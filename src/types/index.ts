// Product types
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  weight: string;
  unit: string;
  sellingPrice: number;
  mrp: number;
  discount: number;
  image: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQuantity: number;
  description: string;
  searchKeywords: string[];
  isActive: boolean;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
}

// Order types
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type WhatsAppStatus = 'NOT_STARTED' | 'OPENED' | 'CUSTOMER_SENT' | 'FAILED';

export interface OrderItem {
  productId: string;
  productName: string;
  brand?: string;
  weight: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  subtotal: number;
}

export interface Order {
  id: string;                       // Firestore document ID
  orderId: string;                  // Human readable like PSK-20260918-0001
  orderNumber: number;              // Raw sequence number
  customerName: string;
  mobileNumber: string;
  address: string;
  pinCode: string;
  deliveryInstructions: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  whatsappStatus: WhatsAppStatus;
  createdAt: string;                // ISO string (Firestore Timestamp converted)
  updatedAt: string;                // ISO string (Firestore Timestamp converted)
}

// Checkout types
export interface CheckoutFormData {
  customerName: string;
  mobileNumber: string;
  address: string;
  pinCode: string;
  deliveryInstructions: string;
}

export interface FormErrors {
  customerName?: string;
  mobileNumber?: string;
  address?: string;
  pinCode?: string;
}
