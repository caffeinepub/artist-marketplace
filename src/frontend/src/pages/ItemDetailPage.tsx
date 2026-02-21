import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetItems, useGetUserProfile, useIsCallerAdmin, useRemoveItem } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ImageGallery from '../components/ImageGallery';
import PurchaseButton from '../components/PurchaseButton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Loader2, Edit, Trash2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: items, isLoading } = useGetItems();
  const { data: isAdmin } = useIsCallerAdmin();
  const removeItem = useRemoveItem();

  const item = items?.find((i) => i.id === itemId);
  const { data: creatorProfile } = useGetUserProfile(item?.creator || null);

  const isCreator = item && identity && item.creator.toString() === identity.getPrincipal().toString();
  const canEdit = isCreator || isAdmin;

  const handleDelete = async () => {
    if (!item) return;
    try {
      await removeItem.mutateAsync(item.id);
      navigate({ to: '/browse' });
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-12 text-center">
        <h1 className="font-serif text-4xl font-bold mb-4">Item Not Found</h1>
        <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist.</p>
        <Link to="/browse">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const price = Number(item.price) / 100;
  const date = new Date(Number(item.timestamp) / 1000000);

  const categoryLabels: Record<string, string> = {
    music: 'Music',
    videography: 'Video',
    images: 'Images',
    prints: '3D Prints',
    ceramics: 'Ceramics',
    paintings: 'Paintings',
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ImageGallery images={item.images} />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-serif text-4xl font-bold">{item.title}</h1>
              <Badge variant="secondary" className="shrink-0">
                {categoryLabels[item.category] || item.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">by {creatorProfile?.name || 'Artist'}</p>
          </div>

          <Separator />

          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Listed on {date.toLocaleDateString()}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl font-bold">${price.toFixed(2)}</span>
              <span className="text-muted-foreground">USD</span>
            </div>

            {!isCreator && <PurchaseButton item={item} />}

            {canEdit && (
              <div className="flex gap-2 pt-4 border-t">
                <Link to="/edit-item/$itemId" params={{ itemId: item.id }} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this item from the marketplace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={removeItem.isPending}>
                        {removeItem.isPending ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
