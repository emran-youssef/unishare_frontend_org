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
import { useGetPaymentQuery } from '../payments/paymentsApi';
import { formatDate, formatCurrency, getImageUrl } from '../../utils/formatters';
import type { BookingDto, BookingStatus, PaymentMethod } from '../../types/api.types';
import { getInitials } from '../../utils/formatters';

type TabType = 'renter' | 'owner';
const STATUS_FILTERS: (BookingStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_ICONS: Record<BookingStatus | 'ALL', string> = {
  ALL: 'calendar_month',
  PENDING: 'hourglass_top',
  CONFIRMED: 'check_circle',
  COMPLETED: 'task_alt',
  CANCELLED: 'cancel',
};

function formatStatus(status: BookingStatus | 'ALL') {
  return status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase();
}

function getPaymentMethod(booking: BookingDto) {
  const stored = localStorage.getItem(`booking:${booking.id}:paymentMethod`);
  const storedMethod = stored === 'ONLINE' || stored === 'CASH' ? stored : undefined;

  return booking.paymentMethod ?? storedMethod;
}

function RenterPaymentAction({ booking, paymentMethod }: { booking: BookingDto; paymentMethod?: PaymentMethod }) {
  const { data: payment, isFetching } = useGetPaymentQuery(booking.id, {
    skip: paymentMethod !== 'ONLINE',
    refetchOnMountOrArgChange: true,
  });

  if (paymentMethod === 'CASH') {
    return (
      <Button variant="surface" size="sm" disabled leftIcon="payments" className="opacity-70 cursor-not-allowed">
        Pay in cash
      </Button>
    );
  }

  if (payment?.status === 'PAID') {
    return (
      <Button variant="surface" size="sm" disabled leftIcon="check_circle" className="opacity-70 cursor-not-allowed">
        Paid
      </Button>
    );
  }

  if (isFetching) {
    return (
      <Button variant="surface" size="sm" disabled leftIcon="hourglass_top" className="opacity-70 cursor-not-allowed">
        Checking payment
      </Button>
    );
  }

  return (
    <Link to={`/checkout/${booking.id}`} className="btn-surface text-sm px-4 py-2 rounded-lg flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px]">payment</span>
      Pay Now
    </Link>
  );
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>('renter');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [reviewBooking, setReviewBooking] = useState<BookingDto | null>(null);
  const [completeConfirmBooking, setCompleteConfirmBooking] = useState<BookingDto | null>(null);

  const { data: bookings = [], isLoading, isError, refetch } = useGetMyBookingsQuery();
  const { data: incoming = [], isLoading: incomingLoading } = useGetIncomingBookingsQuery();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();

  const renterBookings = bookings.filter((b) => b.renter.id === user?.id);
  const ownerBookings = incoming;
  const activeList = tab === 'renter' ? renterBookings : ownerBookings;
  const displayList = (tab === 'renter' ? renterBookings : ownerBookings)
    .filter((b) => statusFilter === 'ALL' || b.status === statusFilter);
  const pendingCount = activeList.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = activeList.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = activeList.filter((b) => b.status === 'COMPLETED').length;

  const handleAction = async (action: () => Promise<unknown>, successMsg: string) => {
    try {
      await action();
      toast.success(successMsg);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Action failed. Please try again.');
    }
  };

  const handleConfirmCompleteBooking = async () => {
    if (!completeConfirmBooking) return;

    await handleAction(
      () => completeBooking(completeConfirmBooking.id).unwrap(),
      'Booking completed. Listing is available again.'
    );
    setCompleteConfirmBooking(null);
  };

  if (isLoading || incomingLoading) return <PageSpinner />;
  if (isError) return <ErrorMessage error={null} onRetry={refetch} />;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-2">My Bookings</h1>
          <p className="text-on-surface-variant font-body text-lg">Track and manage all your rental activity.</p>
        </div>
        <Link to="/" className="btn-surface inline-flex items-center gap-2 self-start text-sm">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Find something to borrow
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Pending', value: pendingCount, icon: 'hourglass_top', tone: 'text-secondary' },
          { label: 'Confirmed', value: confirmedCount, icon: 'check_circle', tone: 'text-primary' },
          { label: 'Completed', value: completedCount, icon: 'task_alt', tone: 'text-tertiary' },
        ].map(({ label, value, icon, tone }) => (
          <div key={label} className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
                <p className="font-headline text-2xl font-bold text-on-surface">{value}</p>
              </div>
              <span className={`material-symbols-outlined rounded-full bg-surface-container-low p-2 text-[22px] ${tone}`}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab: Renter / Owner */}
      <div className="mb-6 inline-flex rounded-xl bg-surface-container-low p-1">
        {([['renter', 'As Renter'], ['owner', 'As Owner']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter('ALL'); }}
            className={`rounded-lg px-4 py-2.5 text-sm font-label font-semibold transition-all
              ${tab === key ? 'bg-surface-container-lowest text-primary shadow-card' : 'text-on-surface-variant hover:text-primary'}`}
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label font-semibold transition-all
              ${statusFilter === status ? 'bg-primary text-on-primary shadow-primary' : 'bg-surface-container-lowest text-on-surface-variant shadow-card hover:bg-primary/10 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[15px]">{STATUS_ICONS[status]}</span>
            {formatStatus(status)}
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
            const isOwner = booking.listing.owner.id === user?.id;
            const otherUser = isRenter ? booking.listing.owner : booking.renter;
            const paymentMethod = getPaymentMethod(booking);

            return (
              <div key={booking.id} className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg">
                <div className="flex flex-col gap-5 p-5 md:flex-row md:p-6">
                  {/* Listing image */}
                  <Link to={`/listings/${booking.listing.id}`} className="group relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container md:h-40 md:w-40">
                    {booking.listing.images?.[0] ? (
                      <img src={getImageUrl(booking.listing.images?.[0]?.imageUrl)} alt={booking.listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">image</span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="min-w-0 flex-grow">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link to={`/listings/${booking.listing.id}`} className="font-headline text-xl font-bold text-on-surface transition-colors hover:text-primary">
                            {booking.listing.title}
                          </Link>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">sell</span>
                            {formatCurrency(booking.listing.pricePerDay)} / day
                          </span>
                          <span className="h-1 w-1 rounded-full bg-outline-variant" />
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">{isRenter ? 'storefront' : 'person'}</span>
                            {isRenter ? 'Booked from owner' : 'Booked by renter'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                          {getInitials(otherUser.fullName)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{isRenter ? 'Owner' : 'Renter'}</p>
                          <p className="text-sm font-semibold text-on-surface">{otherUser.fullName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-surface-container-low px-3 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant"><span className="material-symbols-outlined text-[15px]">date_range</span>Dates</p>
                        <p className="font-medium text-on-surface">{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</p>
                      </div>
                      <div className="rounded-xl bg-surface-container-low px-3 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant"><span className="material-symbols-outlined text-[15px]">payments</span>Total</p>
                        <p className="font-bold text-primary">{formatCurrency(booking.totalPrice)}</p>
                      </div>
                      <div className="rounded-xl bg-surface-container-low px-3 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant"><span className="material-symbols-outlined text-[15px]">location_on</span>Meetup</p>
                        <p className="text-on-surface">{booking.meetupLocation?.name ?? "—"}</p>
                      </div>

                      <div className="rounded-xl bg-surface-container-low px-3 py-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant"><span className="material-symbols-outlined text-[15px]">{paymentMethod === 'ONLINE' ? 'credit_card' : 'payments'}</span>Payment</p>
                        <p className="text-on-surface">{paymentMethod ?? '—'}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-surface-container-highest pt-4">
                      {booking.status === 'PENDING' && isRenter && (
                        <Button variant="danger" size="sm" loading={isCancelling}
                          onClick={() => handleAction(() => cancelBooking(booking.id).unwrap(), 'Booking cancelled.')}>
                          Cancel Booking
                        </Button>
                      )}
                      {booking.status === 'PENDING' && isRenter && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                          Waiting for owner approval
                        </div>
                      )}

                      {booking.status === 'PENDING' && isOwner && (
                        <Button size="sm" loading={isConfirming}
                          onClick={() => handleAction(() => confirmBooking(booking.id).unwrap(), 'Booking confirmed!')}>
                          Confirm Booking
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && isOwner && (
                        <Button size="sm" loading={isCompleting}
                          onClick={() => setCompleteConfirmBooking(booking)}>
                          Mark as Completed
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && isRenter && (
                        <RenterPaymentAction booking={booking} paymentMethod={paymentMethod} />
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

      {completeConfirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-card-lg w-full max-w-md p-8 border border-outline-variant/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[26px]">task_alt</span>
              </div>
              <div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">Complete Booking?</h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  This will mark the rental as completed and make the listing available again.
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-container rounded-xl mb-6">
              <p className="text-xs uppercase tracking-wider font-label font-semibold text-on-surface-variant mb-1">Listing</p>
              <p className="font-semibold text-on-surface">{completeConfirmBooking.listing.title}</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Renter: {completeConfirmBooking.renter.fullName}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCompleteConfirmBooking(null)}
                className="flex-1"
                disabled={isCompleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCompleteBooking}
                loading={isCompleting}
                className="flex-1 justify-center"
                leftIcon="check_circle"
              >
                Yes, Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
