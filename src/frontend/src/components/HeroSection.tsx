import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';
import { useGetBrandConfig } from '../hooks/useQueries';

export default function HeroSection() {
  const { data: brandConfig } = useGetBrandConfig();
  const platformName = brandConfig?.platformName || 'Creative Market';

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1920x600.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="relative container h-full flex items-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            {platformName}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Discover and collect original works from talented artists around the world. From paintings to music, ceramics to digital art.
          </p>
          <div className="flex gap-4">
            <Link to="/browse">
              <Button size="lg" className="text-lg">
                Explore Marketplace
              </Button>
            </Link>
            <Link to="/create-item">
              <Button size="lg" variant="outline" className="text-lg">
                List Your Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
