import { AdminSidebar } from './components/AdminSidebar';
import { useGetStatsQuery } from './adminApi';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useGetStatsQuery();

  const cards = stats
    ? [
      { label: 'Total Users', value: (stats.totalUsers ?? 0).toLocaleString(), icon: 'group', color: 'text-primary' },
      { label: 'Total Listings', value: (stats.totalListing ?? 0).toLocaleString(), icon: 'sell', color: 'text-secondary' },
      { label: 'Active Listings', value: (stats.activeListings ?? 0).toLocaleString(), icon: 'check_circle', color: 'text-tertiary' },
      { label: 'Total Bookings', value: (stats.totalBookings ?? 0).toLocaleString(), icon: 'event', color: 'text-primary' },
      { label: 'Pending Bookings', value: (stats.pendingBookings ?? 0).toLocaleString(), icon: 'hourglass_top', color: 'text-amber-500' },
      { label: 'Completed Bookings', value: (stats.completedBookings ?? 0).toLocaleString(), icon: 'task_alt', color: 'text-tertiary' },
      { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue ?? 0), icon: 'payments', color: 'text-primary' },
    ]
    : [];

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Dashboard Overview</h1>
          <p className="text-on-surface-variant font-body">Platform health and key metrics.</p>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map(({ label, value, icon, color }) => (
              <div key={label} className="us-card p-6 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center ${color}`}>
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-on-surface leading-none mb-1">{value}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider font-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}