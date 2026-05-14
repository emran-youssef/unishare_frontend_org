import { AdminSidebar } from './components/AdminSidebar';

export function AdminListingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Listing Moderation</h1>
          <p className="text-on-surface-variant font-body">Manage platform listings.</p>
        </div>
        <div className="us-card p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">construction</span>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Coming Soon</h2>
          <p className="text-on-surface-variant font-body max-w-md mx-auto">
            The listing moderation endpoints are not yet implemented on the backend.
          </p>
        </div>
      </main>
    </div>
  );
}