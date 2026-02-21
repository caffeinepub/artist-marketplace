import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetBrandConfig } from '../hooks/useQueries';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X, Plus, LayoutGrid, Settings, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: brandConfig } = useGetBrandConfig();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const platformName = brandConfig?.platformName || 'Creative Market';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-serif font-bold text-primary">{platformName}</div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/browse"
              className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Browse
              </div>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/create-item"
                  className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    List Item
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </div>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </div>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
            {buttonText}
          </Button>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/browse"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Browse
              </div>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/create-item"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    List Item
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </div>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </div>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
