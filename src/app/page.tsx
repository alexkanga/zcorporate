import { redirect } from 'next/navigation';

// Redirect root to default locale (fr)
export default function RootPage() {
  redirect('/fr');
}
