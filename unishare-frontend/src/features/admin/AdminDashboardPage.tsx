import { AdminSidebar } from './components/AdminSidebar';

export function AdminDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Dashboard Overview</h1>
          <p className="text-on-surface-variant font-body">Platform health and key metrics.</p>
        </div>

        {/* Stats dashboard is pending backend implementation */}
        <div className="us-card p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">construction</span>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-2">Stats Coming Soon</h2>
          <p className="text-on-surface-variant font-body max-w-md mx-auto">
            The dashboard statistics endpoint (<code className="text-primary">/admin/stats</code>) is not yet implemented on the backend.
            This page will be activated once the backend team completes it.
          </p>
        </div>
      </main>
    </div>
  );
}
