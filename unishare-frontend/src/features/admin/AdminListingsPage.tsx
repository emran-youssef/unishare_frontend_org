import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetAdminListingsQuery, useDeactivateListingMutation } from './adminApi';
import { AdminSidebar } from './components/AdminSidebar';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { ListingStatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate, CATEGORY_LABELS, getInitials } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

export function AdminListingsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isError, refetch } = useGetAdminListingsQuery({ page, size: 15, search: debouncedSearch || undefined });
  const [deactivateListing, { isLoading: isDeactivating }] = useDeactivateListingMutation();

  const handleDeactivate = async (id: number, title: string) => {
    if (!confirm(`Deactivate listing "${title}"? It will be hidden from the platform.`)) return;
    try {
      await deactivateListing(id).unwrap();
      toast.success(`"${title}" has been deactivated.`);
    } catch {
      toast.error('Could not deactivate listing. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <AdminSidebar />
      <main className="flex-grow p-8 bg-surface-container-low/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Listing Moderation</h1>
            <p className="text-on-surface-variant font-body">
              {data ? `${data.totalElements.toLocaleString()} total listings` : 'Loading…'}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search listings…"
              className="us-input pl-12"
            />
          </div>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <ErrorMessage error={null} onRetry={refetch} />
        ) : !data?.content.length ? (
          <EmptyState icon="inventory_2" title="No listings found" />
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
                    <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((listing) => (
                    <tr key={listing.id} className="border-b border-surface-container-highest last:border-0 hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container shrink-0">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-on-surface-variant/30">image</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <Link to={`/listings/${listing.id}`} className="font-semibold text-on-surface text-sm hover:text-primary transition-colors line-clamp-1">
                              {listing.title}
                            </Link>
                            <p className="text-xs text-on-surface-variant">{CATEGORY_LABELS[listing.category]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
                            {getInitials(listing.owner.fullName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{listing.owner.fullName}</p>
                            <p className="text-xs text-on-surface-variant">{formatDate(listing.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="font-bold text-primary">{formatCurrency(listing.pricePerDay)}</span>
                        <span className="text-xs text-on-surface-variant"> / day</span>
                      </td>
                      <td className="px-6 py-4">
                        <ListingStatusBadge status={listing.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/listings/${listing.id}`} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </Link>
                          {listing.status !== 'INACTIVE' && (
                            <Button variant="danger" size="sm" loading={isDeactivating}
                              onClick={() => handleDeactivate(listing.id, listing.title)}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-surface px-3 py-2 disabled:opacity-40">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-label font-semibold ${i === page ? 'bg-primary text-on-primary' : 'btn-surface'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-surface px-3 py-2 disabled:opacity-40">
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
