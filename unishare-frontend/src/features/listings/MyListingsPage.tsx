import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetMyListingsQuery, useDeleteListingMutation, useUpdateListingMutation } from './listingsApi';
import { useAuth } from '../../hooks/useAuth';
import { ListingCardSkeleton } from './components/ListingCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { ListingStatusBadge } from '../../components/ui/Badge';
import type { ListingDto, ListingStatus } from '../../types/api.types';
import { formatCurrency, getImageUrl } from '../../utils/formatters';

type Tab = 'AVAILABLE' | 'RENTED' | 'INACTIVE';

export function MyListingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('AVAILABLE');

  const { data, isLoading, isError, refetch } = useGetMyListingsQuery(
    { userId: user?.id ?? 0 },
    { skip: !user }
  );

  const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
  const [updateListing] = useUpdateListingMutation();

  const listings = data?.content ?? [];
  const filteredListings = listings.filter((l) => l.status === activeTab);

  const tabCount = (status: ListingStatus) => listings.filter((l) => l.status === status).length;

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteListing(id).unwrap();
      toast.success('Listing deleted.');
    } catch {
      toast.error('Could not delete listing. Please try again.');
    }
  };

  const handleToggleStatus = async (listing: ListingDto) => {
    const newStatus: ListingStatus = listing.status === 'AVAILABLE' ? 'INACTIVE' : 'AVAILABLE';
    try {
      await updateListing({ id: listing.id, body: { status: newStatus } }).unwrap();
      toast.success(`Listing ${newStatus === 'AVAILABLE' ? 'activated' : 'paused'}.`);
    } catch {
      toast.error('Could not update listing status.');
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-2">
            My Listings
          </h1>
          <p className="text-on-surface-variant font-body text-lg">Manage your inventory and track performance.</p>
        </div>
        <Link to="/listings/create" className="btn-primary flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post a New Listing
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Listings', value: listings.length, icon: 'sell', color: 'text-primary' },
            { label: 'Active Now', value: tabCount('AVAILABLE'), icon: 'check_circle', color: 'text-tertiary' },
            { label: 'Currently Rented', value: tabCount('RENTED'), icon: 'key', color: 'text-secondary' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-lowest p-6 rounded-xl shadow-card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <div>
                <div className="font-headline text-3xl font-bold text-on-surface">{value}</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider font-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-container-highest mb-8">
        {(['AVAILABLE', 'RENTED', 'INACTIVE'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-label font-semibold border-b-2 transition-all -mb-px
              ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({tabCount(tab)})
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorMessage error={null} onRetry={refetch} />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon="storefront"
          title={`No ${activeTab.toLowerCase()} listings`}
          description={activeTab === 'AVAILABLE' ? 'Post your first listing to start earning!' : `You have no ${activeTab.toLowerCase()} listings.`}
          action={<Link to="/listings/create" className="btn-primary inline-flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">add</span>Post a Listing</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="us-card overflow-hidden">
              <div className="p-5 flex gap-5">
                {/* Thumbnail */}
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  {listing.images?.[0] ? (
                    <img src={getImageUrl(listing.images[0].imageUrl)} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-bold text-on-surface">{listing.title}</h3>
                    <ListingStatusBadge status={listing.status} />
                  </div>
                  <p className="text-on-surface-variant text-sm mb-3">{formatCurrency(listing.pricePerDay)} / day</p>
                  <div className="flex gap-2">
                    <Link to={`/listings/${listing.id}`} className="btn-surface text-xs px-3 py-1.5 rounded-lg">View</Link>
                    <button
                      onClick={() => handleToggleStatus(listing)}
                      className="btn-surface text-xs px-3 py-1.5 rounded-lg"
                    >
                      {listing.status === 'AVAILABLE' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={isDeleting}
                      className="text-error text-xs px-3 py-1.5 rounded-lg hover:bg-error-container/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
