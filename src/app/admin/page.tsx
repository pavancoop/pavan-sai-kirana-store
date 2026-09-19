import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to orders as the default admin view
  redirect('/admin/orders');
}
