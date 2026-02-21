import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <XCircle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="font-serif text-4xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your payment was not completed. You can try again or continue browsing the marketplace.
      </p>
      <div className="flex gap-4">
        <Link to="/browse">
          <Button>Browse Marketplace</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
