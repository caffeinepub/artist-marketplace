import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="font-serif text-4xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Thank you for your purchase. Your transaction has been completed successfully.
      </p>
      <div className="flex gap-4">
        <Link to="/browse">
          <Button>Continue Shopping</Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
