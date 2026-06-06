import { useState } from 'react';
import toast from 'react-hot-toast';
import { AdminSidebar } from './components/AdminSidebar';
import {
  useGetAdminListingsQuery,
  useActivateListingMutation,
  useDeactivateListingMutation,
} from './adminApi';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { ListingStatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, CATEGORY_LABELS } from '../../utils/formatters';

export function AdminListingsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useGetAdminListingsQuery({ page, size: 15 });
  const [activateListing, { isLoading: isActivating }] = useActivateListingMutation();
  const [deactivateListing, { isLoading: isDeactivating }] = useDeactivateListingMutation();
  const busy = isActivating || isDeactivating;

  const toggle = async (id: number, status: string) => {
    try {
      if (status === 'INACTIVE') {
        await activateListing(id).unwrap();
        toast.success('Listing activated.');
      } else {
        await deactivateListing(id).unwrap();
        toast.success('Listing deactivated.');
      }
    } catch {
      toast.error('Could not update listing. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Listing Moderation</h1>
          <p className="text-on-surface-variant font-body">
            {data ? `${data.totalElements.toLocaleString()} listings on the platform` : 'Manage platform listings.'}
          </p>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : !data?.content.length ? (
          <EmptyState icon="sell" title="No listings found" />
        ) : (
          <>
            <div className="us-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Listing</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Owner</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((listing) => (
                    <tr key={listing.id} className="border-b border-surface-container-highest last:border-0 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface text-sm">{listing.title}</p>
                        <p className="text-xs text-on-surface-variant">
                          {CATEGORY_LABELS[listing.category] ?? listing.category} · {formatDate(listing.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface hidden md:table-cell">{listing.owner?.fullName ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-on-surface hidden lg:table-cell">{formatCurrency(listing.pricePerDay)} / day</td>
                      <td className="px-6 py-4"><ListingStatusBadge status={listing.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggle(listing.id, listing.status)}
                          disabled={busy}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            listing.status === 'INACTIVE'
                              ? 'text-tertiary hover:bg-tertiary-container/30'
                              : 'text-error hover:bg-error-container/30'
                          }`}
                        >
                          {listing.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                        </button>
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
