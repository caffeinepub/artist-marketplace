import { Link } from '@tanstack/react-router';
import type { Item } from '../backend';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { useGetUserProfile } from '../hooks/useQueries';

interface ItemCardProps {
  item: Item;
}

function ItemCard({ item }: ItemCardProps) {
  const { data: creatorProfile } = useGetUserProfile(item.creator);
  const imageUrl = item.images.length > 0 ? item.images[0] : '/assets/generated/item-placeholder.dim_400x400.png';
  const price = Number(item.price) / 100;

  const categoryLabels: Record<string, string> = {
    music: 'Music',
    videography: 'Video',
    images: 'Images',
    prints: '3D Prints',
    ceramics: 'Ceramics',
    paintings: 'Paintings',
  };

  return (
    <Link to="/item/$itemId" params={{ itemId: item.id }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif font-semibold text-lg line-clamp-1">{item.title}</h3>
            <Badge variant="secondary" className="shrink-0">
              {categoryLabels[item.category] || item.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">by {creatorProfile?.name || 'Artist'}</span>
          <span className="font-semibold text-lg">${price.toFixed(2)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

interface ItemGridProps {
  items: Item[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No items found. Be the first to list something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
