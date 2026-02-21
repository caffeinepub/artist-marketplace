import { useParams } from '@tanstack/react-router';
import { useGetItems, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import EditItemForm from '../components/EditItemForm';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

export default function EditItemPage() {
  const { itemId } = useParams({ from: '/edit-item/$itemId' });
  const { identity } = useInternetIdentity();
  const { data: items, isLoading } = useGetItems();
  const { data: isAdmin } = useIsCallerAdmin();

  const item = items?.find((i) => i.id === itemId);
  const isCreator = item && identity && item.creator.toString() === identity.getPrincipal().toString();
  const canEdit = isCreator || isAdmin;

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!identity || !canEdit) {
    return <AccessDeniedScreen />;
  }

  if (!item) {
    return (
      <div className="container py-12 text-center">
        <h1 className="font-serif text-4xl font-bold mb-4">Item Not Found</h1>
        <p className="text-muted-foreground">The item you're trying to edit doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <EditItemForm item={item} />
    </div>
  );
}
