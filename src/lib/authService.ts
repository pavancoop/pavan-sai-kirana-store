import { auth, isFirebaseConfigured } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';

/**
 * Log in the admin user with email and password.
 */
export async function loginAdmin(email: string, password: string): Promise<User | null> {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase is not configured.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log out the admin user.
 */
export async function logoutAdmin(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Listen to auth state changes.
 */
export function onAdminAuthStateChanged(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
