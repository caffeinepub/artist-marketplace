import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useUpdateItem, useGenerateItemDescription } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Item } from '../backend';
import { Category } from '../backend';
import { Loader2, Sparkles } from 'lucide-react';

interface EditItemFormProps {
  item: Item;
}

export default function EditItemForm({ item }: EditItemFormProps) {
  const navigate = useNavigate();
  const updateItem = useUpdateItem();
  const generateDescription = useGenerateItemDescription();

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState((Number(item.price) / 100).toString());
  const [category, setCategory] = useState<Category>(item.category);
  const [isGenerating, setIsGenerating] = useState(false);

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

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);

      const updatedItem: Item = {
        ...item,
        title,
        description,
        price: BigInt(priceInCents),
        category,
      };

      await updateItem.mutateAsync(updatedItem);
      navigate({ to: '/item/$itemId', params: { itemId: item.id } });
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Edit Item</CardTitle>
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
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Category.music}>Music</SelectItem>
                <SelectItem value={Category.videography}>Video</SelectItem>
                <SelectItem value={Category.images}>Images</SelectItem>
                <SelectItem value={Category.prints}>3D Prints</SelectItem>
                <SelectItem value={Category.ceramics}>Ceramics</SelectItem>
                <SelectItem value={Category.paintings}>Paintings</SelectItem>
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
                    Regenerate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your work..."
              rows={6}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={updateItem.isPending}>
              {updateItem.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/item/$itemId', params: { itemId: item.id } })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
