import { useState } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { useGetAdminBookingsQuery } from './adminApi';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingStatusBadge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export function AdminBookingsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useGetAdminBookingsQuery({ page, size: 15 });

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">All Bookings</h1>
          <p className="text-on-surface-variant font-body">
            {data ? `${data.totalElements.toLocaleString()} total bookings` : 'View and monitor all platform bookings.'}
          </p>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : !data?.content.length ? (
          <EmptyState icon="event_available" title="No bookings yet" />
        ) : (
          <>
            <div className="us-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Listing</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Renter</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Dates</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Total</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((booking) => (
                    <tr key={booking.id} className="border-b border-surface-container-highest last:border-0 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface text-sm">{booking.listing.title}</p>
                        <p className="text-xs text-on-surface-variant">Owner: {booking.listing.owner?.fullName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface hidden md:table-cell">
                        {booking.renter?.fullName ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface hidden lg:table-cell">
                        {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary hidden lg:table-cell">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 0} className="btn-surface px-3 py-2 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-label font-semibold ${i === page ? 'bg-primary text-on-primary' : 'btn-surface'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages - 1} className="btn-surface px-3 py-2 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
