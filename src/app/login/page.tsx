import { redirect } from 'next/navigation';

// Redirect root /login to localized version
export default function RootLoginPage() {
  redirect('/fr/login');
}
