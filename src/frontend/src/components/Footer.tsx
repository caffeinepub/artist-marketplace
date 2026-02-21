import { SiX, SiInstagram } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'artist-marketplace');
  const caffeineUrl = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`;

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-3">About</h3>
            <p className="text-sm text-muted-foreground">
              A curated marketplace for artists and creators to showcase and sell their original works.
            </p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-3">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiX className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-3">Legal</h3>
            <p className="text-sm text-muted-foreground">© {currentYear} Creative Market. All rights reserved.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
          <a href={caffeineUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
