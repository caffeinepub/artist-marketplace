import { useState } from 'react';
import { Button } from './ui/button';
import { useCreateCheckoutSession } from '../hooks/useQueries';
import type { Item } from '../backend';
import { Loader2 } from 'lucide-react';

interface PurchaseButtonProps {
  item: Item;
}

export default function PurchaseButton({ item }: PurchaseButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession();
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setError(null);
    try {
      const shoppingItem = {
        productName: item.title,
        productDescription: item.description,
        priceInCents: item.price,
        currency: 'usd',
        quantity: BigInt(1),
      };

      const session = await createCheckoutSession.mutateAsync([shoppingItem]);
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to initiate checkout');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={createCheckoutSession.isPending}
        size="lg"
        className="w-full text-lg"
      >
        {createCheckoutSession.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Purchase Now'
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
