import HeroSection from '../components/HeroSection';
import ItemGrid from '../components/ItemGrid';
import { useGetItems } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { data: items, isLoading } = useGetItems();

  const featuredItems = items?.slice(0, 8) || [];

  return (
    <div>
      <HeroSection />

      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-bold mb-4">Featured Works</h2>
          <p className="text-muted-foreground text-lg">Discover exceptional pieces from talented creators</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ItemGrid items={featuredItems} />
        )}
      </section>
    </div>
  );
}
