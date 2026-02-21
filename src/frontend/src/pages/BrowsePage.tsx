import { useState } from 'react';
import { useGetItems, useGetItemsByCategory } from '../hooks/useQueries';
import ItemGrid from '../components/ItemGrid';
import CategoryFilter from '../components/CategoryFilter';
import { Category } from '../backend';
import { Loader2 } from 'lucide-react';

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { data: allItems, isLoading: loadingAll } = useGetItems();
  const { data: filteredItems, isLoading: loadingFiltered } = useGetItemsByCategory(selectedCategory);

  const items = selectedCategory ? filteredItems : allItems;
  const isLoading = selectedCategory ? loadingFiltered : loadingAll;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-4">Browse Marketplace</h1>
        <p className="text-muted-foreground text-lg mb-6">Explore original works from artists around the world</p>
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ItemGrid items={items || []} />
      )}
    </div>
  );
}
