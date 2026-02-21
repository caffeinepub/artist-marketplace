import { useState } from 'react';
import { useGetBrandConfig, useUpdateBrandConfig } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { data: brandConfig, isLoading } = useGetBrandConfig();
  const updateBrandConfig = useUpdateBrandConfig();

  const [platformName, setPlatformName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [feePercentage, setFeePercentage] = useState('');

  useState(() => {
    if (brandConfig) {
      setPlatformName(brandConfig.platformName);
      setLogoUrl(brandConfig.logoUrl);
      setPrimaryColor(brandConfig.primaryColor);
      setFeePercentage(brandConfig.feePercentage.toString());
    }
  });

  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandConfig) return;

    try {
      await updateBrandConfig.mutateAsync({
        platformName,
        logoUrl,
        primaryColor,
        feePercentage: brandConfig.feePercentage,
      });
    } catch (error) {
      console.error('Failed to update branding:', error);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandConfig) return;

    try {
      await updateBrandConfig.mutateAsync({
        ...brandConfig,
        feePercentage: BigInt(parseInt(feePercentage)),
      });
    } catch (error) {
      console.error('Failed to update configuration:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="branding" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="configuration">Configuration</TabsTrigger>
      </TabsList>

      <TabsContent value="branding">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Platform Branding</CardTitle>
            <CardDescription>Customize your marketplace appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBrandingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="Creative Market"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded border border-input"
                  />
                </div>
              </div>

              <Button type="submit" disabled={updateBrandConfig.isPending}>
                {updateBrandConfig.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Branding'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="configuration">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Platform Configuration</CardTitle>
            <CardDescription>Adjust platform settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feePercentage">Platform Fee Percentage</Label>
                <Input
                  id="feePercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(e.target.value)}
                  placeholder="10"
                />
                <p className="text-sm text-muted-foreground">
                  Current fee: {feePercentage}% (Creator receives {100 - parseInt(feePercentage || '0')}%)
                </p>
              </div>

              <Button type="submit" disabled={updateBrandConfig.isPending}>
                {updateBrandConfig.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
