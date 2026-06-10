import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetBookingByIdQuery } from '../bookings/bookingsApi';
import { useProcessPaymentMutation, useGetPaymentQuery } from './paymentsApi';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage, FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { BookingStatusBadge } from '../../components/ui/Badge';
import { formatDate, formatCurrency, calcRentalDays, getImageUrl } from '../../utils/formatters';
import { useEffect, useState } from 'react';
import type { ApiError, BookingDto } from '../../types/api.types';

type PaymentMethod = 'ONLINE' | 'CASH';

interface FieldErrors {
  cardNumber?: string;
  cvv?: string;
}

function isPaymentMethod(value: string | null | undefined): value is PaymentMethod {
  return value === 'ONLINE' || value === 'CASH';
}

function getStoredPaymentMethod(bookingId: string | undefined) {
  if (!bookingId) return undefined;
  const stored = localStorage.getItem(`booking:${bookingId}:paymentMethod`);
  return isPaymentMethod(stored) ? stored : undefined;
}

function getBookingPaymentMethod(booking: BookingDto | undefined, bookingId: string | undefined) {
  return booking?.paymentMethod ?? getStoredPaymentMethod(bookingId);
}

export function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  // ── Payment method selection (undefined = nothing chosen yet) ──────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(() => getStoredPaymentMethod(bookingId));

  // ── Card fields (ONLINE only — never persisted beyond component state) ─────
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');

  // ── Client-side field errors ───────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // ── Success state ──────────────────────────────────────────────────────────
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paidBookingId, setPaidBookingId] = useState<number | null>(null);

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: booking, isLoading, isError } = useGetBookingByIdQuery(Number(bookingId));
  const [processPayment, { isLoading: isPaying }] = useProcessPaymentMutation();
  const fixedPaymentMethod = getBookingPaymentMethod(booking, bookingId);

  useEffect(() => {
    if (fixedPaymentMethod) {
      setPaymentMethod(fixedPaymentMethod);
      setFieldErrors({});
    }
  }, [fixedPaymentMethod]);

  // Fetch payment receipt once payment succeeds
  const { data: receipt } = useGetPaymentQuery(
    paidBookingId ?? Number(bookingId),
    { skip: paidBookingId === null }
  );

  // ── Validate card fields client-side before submitting ────────────────────
  const validate = (): boolean => {
    if (paymentMethod !== 'ONLINE') return true;
    const errs: FieldErrors = {};
    if (!/^\d{16}$/.test(cardNumber)) errs.cardNumber = 'Card number must be exactly 16 digits';
    if (!/^\d{3}$/.test(cvv)) errs.cvv = 'CVV must be exactly 3 digits';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) return;
    if (!validate()) return;

    const body =
      paymentMethod === 'ONLINE'
        ? { paymentMethod: 'ONLINE' as const, cardNumber, cvv }
        : { paymentMethod: 'CASH' as const };

    try {
      const result = await processPayment({
        bookingId: Number(bookingId),
        body,
      }).unwrap();

      // Clear sensitive card data immediately after success
      setCardNumber('');
      setCvv('');

      if (paymentMethod === 'CASH' || result.status === 'PENDING') {
        setSuccessMessage('Booking complete. Pay in cash at meetup location.');
      } else {
        setSuccessMessage('Payment successful! Booking is now complete.');
      }
      setPaidBookingId(Number(bookingId));
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: ApiError };
      const status = apiErr?.status;
      const data = apiErr?.data;

      if (status === 409) {
        // Two distinct 409 cases from the backend
        toast.error(data?.message ?? 'Conflict: cannot process payment right now.');
      } else if (status === 403) {
        toast.error('You are not authorized to pay for this booking.');
      } else if (status === 400 && data?.fieldErrors) {
        // Surface field-level errors returned by the backend
        setFieldErrors({
          cardNumber: data.fieldErrors['cardNumber'],
          cvv: data.fieldErrors['cvv'],
        });
        toast.error('Please fix the highlighted fields and try again.');
      } else {
        toast.error(data?.message ?? 'Payment failed. Please try again.');
      }
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) return <PageSpinner />;
  if (isError || !booking) return <ErrorMessage error={null} />;

  const days = calcRentalDays(booking.startDate, booking.endDate);

  // ── Success screen ─────────────────────────────────────────────────────────
  if (successMessage) {
    const isCash = paymentMethod === 'CASH';
    return (
      <div className="max-w-screen-sm mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
        <span className={`material-symbols-outlined text-6xl ${isCash ? 'text-tertiary' : 'text-primary'}`}>
          {isCash ? 'handshake' : 'check_circle'}
        </span>
        <h1 className="font-headline text-3xl font-bold text-on-surface">{successMessage}</h1>
        <p className="text-on-surface-variant font-body">
          {isCash
            ? `Bring ${formatCurrency(booking.totalPrice)} in cash to ${booking.meetupLocation?.name ?? "the agreed meetup location"}.`
            : `Your payment of ${formatCurrency(booking.totalPrice)} has been processed.`}
        </p>

        {/* Payment receipt */}
        {receipt && (
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-card p-6 text-left border border-surface-container-highest">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              <h2 className="font-headline font-bold text-on-surface">Payment Receipt</h2>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Receipt #', value: `#${receipt.id}` },
                { label: 'Amount', value: formatCurrency(receipt.amount) },
                { label: 'Method', value: receipt.paymentMethod },
                { label: 'Status', value: receipt.status },
                { label: 'Date', value: receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-surface-container-highest last:border-0">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button leftIcon="list_alt" size="lg" onClick={() => navigate('/bookings')}>
          View My Bookings
        </Button>
      </div>
    );
  }

  // ── Payment form ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-screen-lg mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-bold text-on-surface mb-2">Checkout</h1>
        <p className="text-on-surface-variant font-body">
          Your booking is confirmed — choose how you'd like to pay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* LEFT — payment form */}
        <div>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Payment method cards ─────────────────────────────────────── */}
            {!fixedPaymentMethod && (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-5">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-4">

                {/* Cash card */}
                <button
                  id="method-cash"
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                    ${paymentMethod === 'CASH'
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-container-highest hover:border-outline-variant'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined ${paymentMethod === 'CASH' ? 'text-primary' : 'text-on-surface-variant'}`}
                  >
                    payments
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${paymentMethod === 'CASH' ? 'text-primary' : 'text-on-surface'}`}>
                      Pay in Cash
                    </p>
                    <p className="text-xs text-on-surface-variant">Pay when you meet</p>
                  </div>
                </button>

                {/* Online card */}
                <button
                  id="method-online"
                  type="button"
                  onClick={() => { setPaymentMethod('ONLINE'); setFieldErrors({}); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                    ${paymentMethod === 'ONLINE'
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-container-highest hover:border-outline-variant'
                    }`}
                >
                  <span
                    className={`material-symbols-outlined ${paymentMethod === 'ONLINE' ? 'text-primary' : 'text-on-surface-variant'}`}
                  >
                    credit_card
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${paymentMethod === 'ONLINE' ? 'text-primary' : 'text-on-surface'}`}>
                      Pay with Credit Card
                    </p>
                    <p className="text-xs text-on-surface-variant">Pay securely online</p>
                  </div>
                </button>

              </div>
            </div>
            )}

            {/* ── Cash info banner ─────────────────────────────────────────── */}
            {paymentMethod === 'CASH' && (
              <div className="bg-surface-container rounded-xl p-5 flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  You'll pay{' '}
                  <strong className="text-on-surface">{formatCurrency(booking.totalPrice)}</strong>{' '}
                  in cash when you meet the owner at{' '}
                  <strong className="text-on-surface">{booking.meetupLocation?.name ?? "the agreed meetup location"}</strong>.
                </p>
              </div>
            )}

            {/* ── Online card fields (only shown when ONLINE selected) ──────── */}
            {paymentMethod === 'ONLINE' && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card space-y-5">
                <h2 className="font-headline text-xl font-bold text-on-surface">Card Details</h2>

                {/* Card number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-semibold text-on-surface mb-2">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={16}
                    placeholder="1234 5678 9012 3456"
                    className="us-input"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.cardNumber) setFieldErrors((f) => ({ ...f, cardNumber: undefined }));
                    }}
                  />
                  <FieldError message={fieldErrors.cardNumber} />
                </div>

                {/* CVV */}
                <div className="max-w-[160px]">
                  <label htmlFor="cvv" className="block text-sm font-semibold text-on-surface mb-2">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={3}
                    placeholder="•••"
                    className="us-input"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.cvv) setFieldErrors((f) => ({ ...f, cvv: undefined }));
                    }}
                  />
                  <FieldError message={fieldErrors.cvv} />
                </div>
              </div>
            )}

            {/* ── Submit button ────────────────────────────────────────────── */}
            <Button
              id="confirm-payment-btn"
              type="submit"
              loading={isPaying}
              disabled={!paymentMethod || isPaying}
              className="w-full justify-center"
              size="lg"
              leftIcon={paymentMethod === 'ONLINE' ? 'lock' : paymentMethod === 'CASH' ? 'handshake' : 'payments'}
            >
              {!paymentMethod
                ? 'Select a payment method'
                : paymentMethod === 'ONLINE'
                  ? `Pay ${formatCurrency(booking.totalPrice)}`
                  : 'Confirm Payment'}
            </Button>

            <p className="text-xs text-center text-on-surface-variant">
              {paymentMethod === 'ONLINE'
                ? 'Card details are never stored and are used for this transaction only.'
                : 'You can confirm your booking and pay in cash at the meetup.'}
            </p>
          </form>
        </div>

        {/* RIGHT — order summary */}
        <div className="lg:sticky lg:top-[100px] self-start">
          <div className="bg-surface-container-lowest rounded-xl shadow-card p-6">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-5">Order Summary</h2>

            {/* Listing */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-surface-container-highest">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0">
                {booking.listing.images?.[0] ? (
                  <img
                    src={getImageUrl(booking.listing.images?.[0]?.imageUrl)}
                    alt={booking.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">image</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">{booking.listing.title}</h3>
                <p className="text-xs text-on-surface-variant mb-2">
                  Owner: {booking.listing.owner.fullName}
                </p>
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm mb-6">
              {[
                { label: 'Check-in', value: formatDate(booking.startDate) },
                { label: 'Check-out', value: formatDate(booking.endDate) },
                { label: 'Duration', value: `${days} day${days !== 1 ? 's' : ''}` },
                { label: 'Meetup', value: booking.meetupLocation?.name ?? 'To be arranged' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-surface-container-highest pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  {formatCurrency(booking.listing.pricePerDay)} × {days} day{days !== 1 ? 's' : ''}
                </span>
                <span>{formatCurrency(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-surface-container-highest pt-3">
                <span className="text-on-surface">Total</span>
                <span className="text-primary">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
