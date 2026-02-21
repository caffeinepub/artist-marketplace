import { useState, useEffect } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function StripePaymentSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isConfigured === false) {
      setShowForm(true);
    }
  }, [isConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const countries = allowedCountries.split(',').map((c) => c.trim());
      await setStripeConfig.mutateAsync({
        secretKey,
        allowedCountries: countries,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to configure Stripe:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isConfigured && !showForm) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Stripe payment processing is configured and ready.{' '}
          <button onClick={() => setShowForm(true)} className="underline">
            Update configuration
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Stripe Payment Setup</CardTitle>
        <CardDescription>Configure Stripe to enable payment processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key *</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              required
            />
            <p className="text-sm text-muted-foreground">
              Get your secret key from the{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe Dashboard
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedCountries">Allowed Countries *</Label>
            <Input
              id="allowedCountries"
              value={allowedCountries}
              onChange={(e) => setAllowedCountries(e.target.value)}
              placeholder="US,CA,GB"
              required
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated country codes (e.g., US,CA,GB). See{' '}
              <a
                href="https://stripe.com/docs/connect/country-availability"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe documentation
              </a>
            </p>
          </div>

          <Button type="submit" disabled={setStripeConfig.isPending}>
            {setStripeConfig.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuring...
              </>
            ) : (
              'Configure Stripe'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
