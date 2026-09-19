'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { storeConfig } from '@/config/store';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'INCREMENT'; payload: string }
  | { type: 'DECREMENT'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isMinimumMet: boolean;
  amountToMinimum: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateTotals(items: CartItem[]): { totalItems: number; subtotal: number; deliveryCharge: number; discount: number; grandTotal: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const deliveryCharge = storeConfig.deliveryCharge || 0;
  const discount = 0; // Implement discount logic if needed
  const grandTotal = subtotal + deliveryCharge - discount;
  return { totalItems, subtotal, deliveryCharge, discount, grandTotal };
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  deliveryCharge: storeConfig.deliveryCharge || 0,
  discount: 0,
  grandTotal: storeConfig.deliveryCharge || 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.product.id === action.payload.id);
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...state.items, { product: action.payload, quantity: 1 }];
      }
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case 'REMOVE_ITEM': {
      newItems = state.items.filter(item => item.product.id !== action.payload);
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case 'INCREMENT': {
      newItems = state.items.map(item =>
        item.product.id === action.payload ? { ...item, quantity: item.quantity + 1 } : item
      );
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case 'DECREMENT': {
      newItems = state.items
        .map(item =>
          item.product.id === action.payload ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0);
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }
    case 'CLEAR':
      return { ...initialState };
    case 'HYDRATE':
      newItems = action.payload;
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('psk-cart');
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: 'HYDRATE', payload: items });
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('psk-cart', JSON.stringify(state.items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [state.items]);

  const addItem = (product: Product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const incrementItem = (productId: string) => dispatch({ type: 'INCREMENT', payload: productId });
  const decrementItem = (productId: string) => dispatch({ type: 'DECREMENT', payload: productId });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const getItemQuantity = (productId: string) => {
    const item = state.items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const isMinimumMet = state.subtotal >= storeConfig.minimumOrderValue;
  const amountToMinimum = Math.max(0, storeConfig.minimumOrderValue - state.subtotal);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        clearCart,
        getItemQuantity,
        isMinimumMet,
        amountToMinimum,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
