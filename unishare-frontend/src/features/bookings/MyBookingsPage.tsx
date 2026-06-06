import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetMyBookingsQuery, useGetIncomingBookingsQuery, useCancelBookingMutation, useConfirmBookingMutation, useCompleteBookingMutation } from './bookingsApi';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { BookingStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ReviewForm } from '../reviews/components/ReviewForm';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { BookingDto, BookingStatus } from '../../types/api.types';
import { getInitials } from '../../utils/formatters';

type TabType = 'renter' | 'owner';
const STATUS_FILTERS: (BookingStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export function MyBookingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>('renter');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [reviewBooking, setReviewBooking] = useState<BookingDto | null>(null);

  const { data: bookings = [], isLoading, isError, refetch } = useGetMyBookingsQuery();
  const { data: incoming = [], isLoading: incomingLoading } = useGetIncomingBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();

  const renterBookings = bookings.filter((b) => b.renter.id === user?.id);
  const ownerBookings  = incoming;
  const displayList = (tab === 'renter' ? renterBookings : ownerBookings)
    .filter((b) => statusFilter === 'ALL' || b.status === statusFilter);

  const handleAction = async (action: () => Promise<unknown>, successMsg: string) => {
    try {
      await action();
      toast.success(successMsg);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Action failed. Please try again.');
    }
  };

  if (isLoading || incomingLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage error={null} onRetry={refetch} />;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-2">My Bookings</h1>
        <p className="text-on-surface-variant font-body text-lg">Track and manage all your rental activity.</p>
      </div>

      {/* Tab: Renter / Owner */}
      <div className="flex gap-1 border-b border-surface-container-highest mb-6">
        {([['renter', 'As Renter'], ['owner', 'As Owner']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter('ALL'); }}
            className={`px-5 py-3 text-sm font-label font-semibold border-b-2 transition-all -mb-px
              ${tab === key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
          >
            {label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold
              ${tab === key ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              {key === 'renter' ? renterBookings.length : ownerBookings.length}
            </span>
          </button>
        ))}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-label font-semibold transition-all
              ${statusFilter === status ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayList.length === 0 ? (
        <EmptyState
          icon="event_available"
          title="No bookings here"
          description={tab === 'renter' ? "You haven't booked anything yet. Browse listings to get started!" : "No one has booked your items yet."}
          action={tab === 'renter' ? <Link to="/" className="btn-primary inline-flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">search</span>Browse Listings</Link> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {displayList.map((booking) => {
            const isRenter = booking.renter.id === user?.id;
            const isOwner  = booking.listing.owner.id === user?.id;
            const otherUser = isRenter ? booking.listing.owner : booking.renter;

            return (
              <div key={booking.id} className="us-card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Listing image */}
                  <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-surface-container shrink-0">
                    {booking.listing.images?.[0] ? (
                      <img src={booking.listing.images[0]} alt={booking.listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <Link to={`/listings/${booking.listing.id}`} className="font-headline font-bold text-lg text-on-surface hover:text-primary transition-colors">
                        {booking.listing.title}
                      </Link>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-wider font-label mb-1">Dates</p>
                        <p className="font-medium text-on-surface">{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-wider font-label mb-1">Total</p>
                        <p className="font-bold text-primary">{formatCurrency(booking.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-wider font-label mb-1">Meetup</p>
                        <p className="text-on-surface">{booking.meetupLocation?.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-xs uppercase tracking-wider font-label mb-1">{isRenter ? 'Owner' : 'Renter'}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
                            {getInitials(otherUser.fullName)}
                          </div>
                          <span className="text-on-surface text-sm">{otherUser.fullName.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'PENDING' && isRenter && (
                        <Button variant="danger" size="sm" loading={isCancelling}
                          onClick={() => handleAction(() => cancelBooking(booking.id).unwrap(), 'Booking cancelled.')}>
                          Cancel Booking
                        </Button>
                      )}
                      {booking.status === 'PENDING' && isOwner && (
                        <Button size="sm" loading={isConfirming}
                          onClick={() => handleAction(() => confirmBooking(booking.id).unwrap(), 'Booking confirmed!')}>
                          Confirm Booking
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && isOwner && (
                        <Button size="sm" loading={isCompleting}
                          onClick={() => handleAction(() => completeBooking(booking.id).unwrap(), 'Booking marked as completed!')}>
                          Mark as Completed
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && isRenter && (
                        <Link to={`/checkout/${booking.id}`} className="btn-surface text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">payment</span>
                          Pay Now
                        </Link>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button variant="ghost" size="sm" leftIcon="star"
                          onClick={() => setReviewBooking(booking)}>
                          Leave a Review
                        </Button>
                      )}
                      <Link to={`/chat/${booking.listing.id}/${otherUser.id}`} className="btn-surface text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        Message
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review modal */}
      {reviewBooking && (
        <ReviewForm
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
