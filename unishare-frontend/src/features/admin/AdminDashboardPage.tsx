import { useGetAdminStatsQuery } from './adminApi';
import { AdminSidebar } from './components/AdminSidebar';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: number;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, change, color, bgColor }: StatCardProps) {
  return (
    <div className="us-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
            ${change >= 0 ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error-container/20 text-error'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {change >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="font-headline text-3xl font-bold text-on-surface mb-1">{value}</div>
      <div className="text-xs text-on-surface-variant uppercase tracking-wider font-label">{label}</div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useGetAdminStatsQuery();

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
        ) : isError || !stats ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <StatCard
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon="group"
                change={stats.userGrowthPercent}
                color="text-primary"
                bgColor="bg-primary-container/20"
              />
              <StatCard
                label="Total Listings"
                value={stats.totalListings.toLocaleString()}
                icon="storefront"
                change={stats.listingGrowthPercent}
                color="text-secondary"
                bgColor="bg-secondary-fixed/20"
              />
              <StatCard
                label="Total Bookings"
                value={stats.totalBookings.toLocaleString()}
                icon="event_available"
                change={stats.bookingGrowthPercent}
                color="text-tertiary"
                bgColor="bg-tertiary-container/20"
              />
              <StatCard
                label="Est. Revenue"
                value={formatCurrency(stats.estimatedRevenue)}
                icon="payments"
                change={stats.revenueGrowthPercent}
                color="text-amber-600"
                bgColor="bg-amber-100/60"
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="us-card p-6">
                <h2 className="font-headline text-xl font-bold text-on-surface mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  Listing Health
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant">Active Listings</span>
                      <span className="font-bold text-on-surface">{stats.activeListings} / {stats.totalListings}</span>
                    </div>
                    <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalListings ? (stats.activeListings / stats.totalListings) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="us-card p-6">
                <h2 className="font-headline text-xl font-bold text-on-surface mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">event_note</span>
                  Booking Activity
                </h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-headline text-3xl font-bold text-secondary">{stats.newBookings}</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">New Bookings</div>
                  </div>
                  <div className="flex-grow h-px bg-surface-container-highest" />
                  <div className="text-center">
                    <div className="font-headline text-3xl font-bold text-primary">{stats.totalBookings}</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">All Time</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
