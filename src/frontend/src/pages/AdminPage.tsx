import { useIsCallerAdmin } from '../hooks/useQueries';
import AdminDashboard from '../components/AdminDashboard';
import StripePaymentSetup from '../components/StripePaymentSetup';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Loader2 } from 'lucide-react';
import { Separator } from '../components/ui/separator';

export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your marketplace settings and configuration</p>
      </div>

      <div className="space-y-8">
        <StripePaymentSetup />
        <Separator />
        <AdminDashboard />
      </div>
    </div>
  );
}
