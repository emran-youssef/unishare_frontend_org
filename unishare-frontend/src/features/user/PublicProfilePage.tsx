import { useParams, Link } from 'react-router-dom';
import { useGetPublicProfileQuery } from './userApi';
import { useGetUserReviewsQuery } from '../reviews/reviewsApi';
import { useGetListingsQuery } from '../listings/listingsApi';
import { ListingCard } from '../listings/components/ListingCard';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { VerifiedBadge } from '../../components/ui/Badge';
import { formatDate, getInitials } from '../../utils/formatters';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[14px] ${i <= rating ? 'text-amber-400' : 'text-surface-container-highest'}`}
          style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >star</span>
      ))}
    </div>
  );
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: profile, isLoading, isError } = useGetPublicProfileQuery(userId);
  const { data: reviews = [] } = useGetUserReviewsQuery(userId, { skip: !userId });
  const { data: listingsPage } = useGetListingsQuery({}, { skip: !userId });

  // Filter listings belonging to this user (backend exposes getMyListings separately,
  // but we can use the public browse endpoint filtered by what we see)
  // For a cleaner approach: link to /listing/user/{id} via the listings page
  // We use getListingsQuery since getMyListings is behind auth
  const userListings = (listingsPage?.content ?? []).filter((l) => l.owner.id === userId).slice(0, 6);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) return <PageSpinner />;
  if (isError || !profile) return <ErrorMessage error={null} />;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-8 group transition-colors">
        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
        Browse Listings
      </Link>

      {/* Profile card */}
      <div className="us-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-primary-container/20 to-secondary-fixed/20" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-4">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center font-headline font-bold text-2xl text-on-primary-container border-4 border-surface-container-lowest shadow">
              {getInitials(profile.fullName)}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">{profile.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
              <span className="text-on-surface-variant text-sm">{profile.universityEmail}</span>
              <VerifiedBadge />
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
            <div className="flex gap-6 justify-center sm:justify-start">
              <div className="text-center">
                <div className="font-headline text-2xl font-bold text-on-surface">{reviews.length}</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-wider">Reviews</div>
              </div>
              {avgRating && (
                <div className="text-center">
                  <div className="font-headline text-2xl font-bold text-amber-400">{avgRating}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider">Avg Rating</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Listings */}
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-5">
            {profile.fullName.split(' ')[0]}'s Listings
          </h2>
          {userListings.length === 0 ? (
            <p className="text-on-surface-variant font-body">No active listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userListings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-5">Reviews Received</h2>
          {reviews.length === 0 ? (
            <p className="text-on-surface-variant font-body">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="us-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <StarRow rating={review.rating} />
                    <span className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-on-surface font-body italic mb-2">"{review.comment}"</p>
                  )}
                  <p className="text-xs text-on-surface-variant">— {review.reviewer.fullName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
