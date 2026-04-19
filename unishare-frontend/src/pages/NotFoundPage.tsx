import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-6">
        <div className="text-[120px] font-headline font-black text-primary/10 leading-none select-none">404</div>
        <h1 className="font-headline text-3xl font-bold text-on-surface mt-2 mb-3">Page not found</h1>
        <p className="text-on-surface-variant font-body mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
