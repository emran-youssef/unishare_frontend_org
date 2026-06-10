import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetListingByIdQuery, useGetListingImagesQuery } from './listingsApi';
import { useGetListingReviewsQuery } from '../reviews/reviewsApi';
import { useAttachMeetupLocationMutation, useCreateBookingMutation } from '../bookings/bookingsApi';
import { useGetMeetupLocationsQuery } from '../user/userApi';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { getInitials, formatDate, formatCurrency, calcRentalDays, CATEGORY_LABELS, CONDITION_LABELS, getImageUrl } from '../../utils/formatters';
import { createBookingSchema, type CreateBookingFormData } from '../../utils/validators';
import { useForm, type Resolver } from 'react-hook-form';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-[16px] ${i <= Math.round(rating) ? 'text-amber-400' : 'text-surface-container-highest'}`}
          style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}>
          star
        </span>
      ))}
    </div>
  );
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  const { data: listing, isLoading, isError, refetch } = useGetListingByIdQuery(Number(id), {
    refetchOnMountOrArgChange: true,
  });

  const { data: listingImages = [] } = useGetListingImagesQuery(Number(id));
  const imageUrls = [...listingImages]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img) => img.imageUrl);
  const { data: reviews } = useGetListingReviewsQuery(Number(id));
  const { data: meetupLocations } = useGetMeetupLocationsQuery(undefined, { skip: !isAuthenticated });
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();
  const [attachMeetupLocation] = useAttachMeetupLocationMutation();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema) as Resolver<CreateBookingFormData>,
    defaultValues: {
      meetupLocationId: undefined,
      paymentMethod: undefined,
    },
  });
  const [startDate, endDate] = watch(['startDate', 'endDate']);
  const days = startDate && endDate ? calcRentalDays(startDate, endDate) : 0;
  const totalPrice = days > 0 && listing ? days * listing.pricePerDay : 0;

  const onBookingSubmit = async (data: CreateBookingFormData) => {
    console.log('Booking data:', data);
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const booking = await createBooking({
        listingId: Number(id),
        startDate: data.startDate,
        endDate: data.endDate,
        meetupLocationId: data.meetupLocationId || null,
        paymentMethod: data.paymentMethod,
      }).unwrap();

      localStorage.setItem(`booking:${booking.id}:paymentMethod`, data.paymentMethod);

      if (data.meetupLocationId) {
        await attachMeetupLocation({
          id: booking.id,
          locationId: data.meetupLocationId,
        }).unwrap();
      }

      toast.success('Booking request sent! You can pay once the owner confirms.');
      navigate('/bookings');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Booking failed. Please try again.');
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError || !listing) return <ErrorMessage error={null} onRetry={refetch} />;

  const isOwner = user?.id === listing.owner.id;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-on-surface-variant mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary transition-colors">Browse</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary">{CATEGORY_LABELS[listing.category]}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* LEFT — Gallery + Details */}
        <div>
          {/* Main image */}
          <div className="aspect-[16/9] bg-surface-container rounded-2xl overflow-hidden mb-3 relative">
            {imageUrls[activeImage] ? (
              <img src={getImageUrl(imageUrls[activeImage])} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">image</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-primary/90 text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {CATEGORY_LABELS[listing.category]}
              </span>
              <span className="bg-surface-container-lowest/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-on-surface">
                {CONDITION_LABELS[listing.condition]}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {(imageUrls.length ?? 0) > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
              {imageUrls?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === activeImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={getImageUrl(img)} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title + Price */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="font-headline text-3xl font-bold text-on-surface leading-tight">{listing.title}</h1>
            <div className="text-right shrink-0 ml-4">
              <div className="text-2xl font-bold text-primary">{formatCurrency(listing.pricePerDay)}</div>
              <div className="text-sm text-on-surface-variant">per day</div>
            </div>
          </div>

          {/* Owner card */}
          <Link to={`/users/${listing.owner.id}`} className="flex items-center gap-4 p-4 bg-surface-container rounded-xl mb-6 hover:bg-surface-container-high transition-colors group">
            {listing.owner.profilePicture ? (
              <img src={listing.owner.profilePicture} alt={listing.owner.fullName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container font-headline">
                {getInitials(listing.owner.fullName)}
              </div>
            )}
            <div>
              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{listing.owner.fullName}</p>
              <p className="text-xs text-on-surface-variant">{listing.owner.universityEmail}</p>
            </div>
            {listing.averageRating != null && (
              <div className="ml-auto flex items-center gap-1">
                <StarRating rating={listing.averageRating} />
                <span className="text-sm font-semibold text-on-surface ml-1">{listing.averageRating.toFixed(1)}</span>
                {listing.totalReviews != null && <span className="text-xs text-on-surface-variant">({listing.totalReviews})</span>}
              </div>
            )}
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors ml-auto">chevron_right</span>
          </Link>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-3">About this item</h2>
            <p className="text-on-surface-variant font-body leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-surface-container-low p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Link to={`/users/${review.reviewer.id}`} className="flex items-center gap-3 hover:opacity-75 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
                          {getInitials(review.reviewer.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{review.reviewer.fullName}</p>
                          <p className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</p>
                        </div>
                      </Link>
                      <div className="ml-auto">
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-on-surface font-body italic">"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Booking panel */}
        <div className="lg:sticky lg:top-[100px] self-start">
          <div className="bg-surface-container-lowest rounded-2xl shadow-card p-6">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-5">Book this item</h2>

            {isOwner ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">info</span>
                <p className="text-on-surface-variant text-sm">This is your listing. You cannot book your own item.</p>
                <Link to={`/my-listings`} className="btn-surface mt-4 inline-block text-sm">Manage My Listings</Link>
              </div>
            ) : listing.status === 'RENTED' ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">event_busy</span>
                <p className="font-semibold text-on-surface mb-1">Currently Rented</p>
                <p className="text-on-surface-variant text-sm">This item is currently rented out.</p>
                {listing.availableFrom && (
                  <div className="mt-4 px-4 py-3 bg-surface-container rounded-xl">
                    <p className="text-sm text-on-surface-variant">Available from</p>
                    <p className="font-bold text-primary text-lg">{formatDate(listing.availableFrom)}</p>
                  </div>
                )}
              </div>
            ) : listing.status === 'INACTIVE' ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">block</span>
                <p className="font-semibold text-on-surface mb-1">Unavailable</p>
                <p className="text-on-surface-variant text-sm">This listing is not currently active.</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-on-surface-variant text-sm text-center">Sign in to book this item</p>
                <Link to="/login" className="btn-primary w-full justify-center flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign in to Book
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onBookingSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Start Date</label>
                  <input {...register('startDate')} type="date" min={today} className="us-input" />
                  <FieldError message={errors.startDate?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">End Date</label>
                  <input {...register('endDate')} type="date" min={startDate || today} className="us-input" />
                  <FieldError message={errors.endDate?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Meetup Location <span className="text-on-surface-variant font-normal text-xs">optional</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('meetupLocationId')}
                      defaultValue=""
                      className="us-input appearance-none pr-10"
                    >
                      <option value="">Select a meetup location</option>
                      {meetupLocations?.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                  <FieldError message={errors.meetupLocationId?.message} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['CASH', 'ONLINE'] as const).map((method) => {
                      const selected = watch('paymentMethod') === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setValue('paymentMethod', method, { shouldValidate: true })}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
            ${selected ? 'border-primary bg-primary/5' : 'border-surface-container-highest hover:border-primary/40'}`}
                        >
                          <span className="material-symbols-outlined text-[20px] text-primary">
                            {method === 'CASH' ? 'payments' : 'credit_card'}
                          </span>
                          <span className="text-sm font-semibold text-on-surface">
                            {method === 'CASH' ? 'Cash' : 'Online'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError message={errors.paymentMethod?.message} />
                </div>


                {/* Price summary */}
                {days > 0 && (
                  <div className="bg-surface-container rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>{formatCurrency(listing.pricePerDay)} × {days} day{days !== 1 ? 's' : ''}</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-on-surface border-t border-surface-container-highest pt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" loading={isBooking} className="w-full justify-center" size="lg">
                  {days > 0 ? `Book for ${formatCurrency(totalPrice)}` : 'Book Now'}
                </Button>

                <p className="text-xs text-center text-on-surface-variant">
                  You won't be charged until after the owner confirms.
                </p>
              </form>
            )}
          </div>

          {/* Safety tips */}
          <div className="mt-4 p-4 bg-surface-container rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">security</span>
            <div>
              <p className="text-xs font-semibold text-on-surface mb-1">Safety Tips</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Meet at an approved campus location. Inspect the item before accepting. Report any issues promptly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
