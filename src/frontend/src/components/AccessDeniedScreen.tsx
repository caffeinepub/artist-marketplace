import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="font-serif text-4xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
