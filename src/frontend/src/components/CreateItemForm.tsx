import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAddItem, useGenerateItemDescription, useArtistStatus, useIsStripeConfigured } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Category } from '../backend';
import { Loader2, Upload, X, Sparkles, AlertCircle } from 'lucide-react';

export default function CreateItemForm() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const addItem = useAddItem();
  const generateDescription = useGenerateItemDescription();
  const { data: isArtist, isLoading: artistStatusLoading } = useArtistStatus();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDescription = async () => {
    if (!title || !category) return;

    setIsGenerating(true);
    try {
      const input = `${title} - ${category}`;
      const generated = await generateDescription.mutateAsync(input);
      setDescription(generated);
    } catch (error) {
      console.error('Failed to generate description:', error);
      const categoryLabels: Record<string, string> = {
        music: 'musical composition',
        videography: 'video production',
        images: 'digital artwork',
        prints: '3D printed creation',
        ceramics: 'ceramic piece',
        paintings: 'painting',
      };
      setDescription(
        `A unique ${categoryLabels[category] || 'artwork'} titled "${title}". This original work showcases exceptional craftsmanship and artistic vision.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !category || !isArtist) return;

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);
      
      const imageUrls: string[] = imagePreviews;

      const item = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        price: BigInt(priceInCents),
        category,
        creator: identity.getPrincipal(),
        images: imageUrls,
        timestamp: BigInt(Date.now() * 1000000),
      };

      await addItem.mutateAsync(item);
      navigate({ to: '/browse' });
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  if (artistStatusLoading || stripeConfigLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isArtist) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to enable artist mode to post items.{' '}
            <Link to="/settings" className="underline font-medium">
              Go to Settings
            </Link>{' '}
            to enable artist status and configure your payment settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isStripeConfigured) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to configure your Stripe payment settings before creating items.{' '}
            <Link to="/settings" className="underline font-medium">
              Go to Settings
            </Link>{' '}
            to complete your artist profile with payment information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-serif">List New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter item title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="videography">Videography</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="prints">3D Prints</SelectItem>
                  <SelectItem value="ceramics">Ceramics</SelectItem>
                  <SelectItem value="paintings">Paintings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={!title || !category || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images *</Label>
              <div className="space-y-4">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={addItem.isPending || imagePreviews.length === 0}>
              {addItem.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
