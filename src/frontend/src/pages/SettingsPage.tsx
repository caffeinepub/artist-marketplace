import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useArtistStatus, useUpdateArtistStatus } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import StripePaymentSetup from '../components/StripePaymentSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Loader2, User, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function SettingsPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isArtist, isLoading: artistStatusLoading } = useArtistStatus();
  const updateArtistStatus = useUpdateArtistStatus();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  const isLoading = profileLoading || artistStatusLoading;

  const handleArtistToggle = async (checked: boolean) => {
    try {
      await updateArtistStatus.mutateAsync(checked);
    } catch (error) {
      console.error('Failed to update artist status:', error);
    }
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and artist preferences</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="text-lg font-medium">{userProfile?.name || 'Not set'}</div>
                </div>
                <div className="space-y-2">
                  <Label>Principal ID</Label>
                  <div className="text-sm text-muted-foreground font-mono break-all">
                    {identity?.getPrincipal().toString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artist Mode Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Artist Mode
                </CardTitle>
                <CardDescription>Enable artist mode to list items and receive payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="artist-mode" className="text-base">
                      Enable Artist Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Artists can post items for sale and configure payment settings
                    </p>
                  </div>
                  <Switch
                    id="artist-mode"
                    checked={isArtist || false}
                    onCheckedChange={handleArtistToggle}
                    disabled={updateArtistStatus.isPending}
                  />
                </div>

                {isArtist && (
                  <Alert>
                    <AlertDescription>
                      You are currently an artist. You can list items and configure Stripe payments below.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Stripe Payment Setup - Only visible to artists */}
            {isArtist && (
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold">Payment Settings</h2>
                <p className="text-muted-foreground mb-4">
                  Configure Stripe to receive payments for your items
                </p>
                <StripePaymentSetup />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
