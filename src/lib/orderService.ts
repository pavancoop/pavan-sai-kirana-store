import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Order, OrderItem, CheckoutFormData, CartItem } from '@/types';
import { storeConfig } from '@/config/store';

/**
 * Get the next order sequence number atomically using a Firestore counter.
 * Uses a daily counter to reset sequence numbers every day.
 */
async function getNextOrderSequence(dateString: string): Promise<number> {
  if (!db) throw new Error('Firestore not initialized');

  const counterRef = doc(db, 'counters', `orders_${dateString}`);

  const newSequence = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let current = 0;
    if (counterDoc.exists()) {
      current = counterDoc.data().currentSequence || 0;
    }

    const next = current + 1;
    transaction.set(counterRef, { currentSequence: next }, { merge: true });
    return next;
  });

  return newSequence;
}

/**
 * Generate a human-readable order ID from a sequence number and date.
 * Format: PSK-YYYYMMDD-XXXX
 */
function formatOrderId(dateString: string, sequence: number): string {
  return `${storeConfig.orderIdPrefix}-${dateString}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Build OrderItem array from cart items.
 * Snapshots the price at order time — never references current product prices.
 */
function buildOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    brand: item.product.brand,
    weight: item.product.weight,
    unit: item.product.unit,
    quantity: item.quantity,
    unitPrice: item.product.sellingPrice,
    mrp: item.product.mrp,
    subtotal: item.product.sellingPrice * item.quantity,
  }));
}

/**
 * Create an order in Firestore.
 *
 * If Firebase is not configured, falls back to generating a local-only order
 * with a random ID (demo mode).
 */
export async function createOrder(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  cartState: { subtotal: number; deliveryCharge: number; discount: number; grandTotal: number }
): Promise<Order> {
  const dateObj = new Date();
  const now = dateObj.toISOString();
  // Generate dateString in YYYYMMDD format in local time or UTC. UTC is safer.
  const dateString = dateObj.toISOString().split('T')[0].replace(/-/g, '');
  const items = buildOrderItems(cartItems);

  // Fallback: Firebase not configured — local-only demo mode
  if (!isFirebaseConfigured() || !db) {
    const demoSequence = Math.floor(Math.random() * 9999) + 1;
    const order: Order = {
      id: `local-${Date.now()}`,
      orderId: formatOrderId(dateString, demoSequence),
      orderNumber: demoSequence,
      customerName: formData.customerName,
      mobileNumber: formData.mobileNumber,
      address: formData.address,
      pinCode: formData.pinCode,
      deliveryInstructions: formData.deliveryInstructions || '',
      items,
      subtotal: cartState.subtotal,
      deliveryCharge: cartState.deliveryCharge,
      discount: cartState.discount,
      grandTotal: cartState.grandTotal,
      orderStatus: 'NEW',
      paymentStatus: 'PENDING',
      whatsappStatus: 'NOT_STARTED',
      createdAt: now,
      updatedAt: now,
    };

    console.info('[OrderService] Firebase not configured. Created local-only order:', order.orderId);
    return order;
  }

  // Real Firestore order creation
  const sequence = await getNextOrderSequence(dateString);
  const orderId = formatOrderId(dateString, sequence);
  const docRef = doc(collection(db, 'orders'));

  const order: Order = {
    id: docRef.id,
    orderId,
    orderNumber: sequence,
    customerName: formData.customerName,
    mobileNumber: formData.mobileNumber,
    address: formData.address,
    pinCode: formData.pinCode,
    deliveryInstructions: formData.deliveryInstructions || '',
    items,
    subtotal: cartState.subtotal,
    deliveryCharge: cartState.deliveryCharge,
    discount: cartState.discount,
    grandTotal: cartState.grandTotal,
    orderStatus: 'NEW',
    paymentStatus: 'PENDING',
    whatsappStatus: 'NOT_STARTED',
    createdAt: now,
    updatedAt: now,
  };

  // Save to Firestore
  await setDoc(docRef, {
    ...order,
    // Override with Firestore server timestamp for accuracy
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.info('[OrderService] Order created in Firestore:', orderId, docRef.id);
  return order;
}

/**
 * Fetch an order by its Firestore document ID.
 * Returns null if not found or Firebase is not configured.
 */
export async function getOrderById(documentId: string): Promise<Order | null> {
  if (!isFirebaseConfigured() || !db) return null;

  const docRef = doc(db, 'orders', documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    // Convert Firestore Timestamps to ISO strings
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
  } as Order;
}

/**
 * Update the whatsappStatus of an order.
 */
export async function updateOrderWhatsAppStatus(
  documentId: string,
  status: import('@/types').WhatsAppStatus
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    console.info('[OrderService] Firebase not configured. Simulated update order', documentId, 'whatsappStatus:', status);
    return;
  }

  const docRef = doc(db, 'orders', documentId);
  await setDoc(docRef, {
    whatsappStatus: status,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetch all orders, sorted by creation date descending.
 */
export async function getOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured() || !db) return [];

  const { query, orderBy, getDocs } = await import('firebase/firestore');
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Order;
  });
}

/**
 * Update the orderStatus of an order.
 */
export async function updateOrderStatus(
  documentId: string,
  status: import('@/types').OrderStatus
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;

  const docRef = doc(db, 'orders', documentId);
  await setDoc(docRef, {
    orderStatus: status,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Update the paymentStatus of an order.
 */
export async function updatePaymentStatus(
  documentId: string,
  status: import('@/types').PaymentStatus
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;

  const docRef = doc(db, 'orders', documentId);
  await setDoc(docRef, {
    paymentStatus: status,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
