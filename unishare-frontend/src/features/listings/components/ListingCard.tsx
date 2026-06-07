import { useNavigate } from 'react-router-dom';
import type { ListingDto } from '../../../types/api.types';
import { formatCurrency, CATEGORY_LABELS, CONDITION_LABELS, getInitials, getImageUrl } from '../../../utils/formatters';
import { ListingStatusBadge } from '../../../components/ui/Badge';

interface ListingCardProps {
  listing: ListingDto;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  const navigate = useNavigate();
  const mainImage = getImageUrl(listing.images?.[0]?.imageUrl);

  return (
    <div
      onClick={() => navigate(`/listings/${listing.id}`)}
      className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-card hover:shadow-card-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-surface-container relative overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">image</span>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-on-surface shadow-sm">
          {CONDITION_LABELS[listing.condition] ?? listing.condition}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-headline font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="text-right shrink-0">
            <div className="font-bold text-primary text-lg">{formatCurrency(listing.pricePerDay)}</div>
            <div className="text-xs text-on-surface-variant">/ day</div>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-grow font-body">
          {listing.description}
        </p>

        {/* Status badge */}
        {showStatus && (
          <div className="mb-3">
            <ListingStatusBadge status={listing.status} />
          </div>
        )}

        {/* Owner + rating */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container-highest">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); navigate(`/users/${listing.owner.id}`); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate(`/users/${listing.owner.id}`); } }}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
          >
            {listing.owner.profilePicture ? (
              <img src={listing.owner.profilePicture} alt={listing.owner.fullName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
                {getInitials(listing.owner.fullName)}
              </div>
            )}
            <span className="text-xs font-medium text-on-surface">{listing.owner.fullName.split(' ')[0]}</span>
          </span>

          {listing.averageRating != null && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-semibold text-on-surface">{listing.averageRating.toFixed(1)}</span>
              {listing.totalReviews != null && (
                <span className="text-xs text-on-surface-variant">({listing.totalReviews})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-surface-container" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-surface-container rounded w-2/3" />
          <div className="h-5 bg-surface-container rounded w-1/5" />
        </div>
        <div className="h-4 bg-surface-container rounded w-full" />
        <div className="h-4 bg-surface-container rounded w-3/4" />
        <div className="h-px bg-surface-container-highest" />
        <div className="flex justify-between">
          <div className="h-4 bg-surface-container rounded w-1/4" />
          <div className="h-4 bg-surface-container rounded w-1/5" />
        </div>
      </div>
    </div>
  );
}