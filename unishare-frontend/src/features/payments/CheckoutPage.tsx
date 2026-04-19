import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetBookingByIdQuery } from '../bookings/bookingsApi';
import { useProcessPaymentMutation } from './paymentsApi';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage, FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { BookingStatusBadge } from '../../components/ui/Badge';
import { paymentSchema, type PaymentFormData } from '../../utils/validators';
import { formatDate, formatCurrency, calcRentalDays } from '../../utils/formatters';
import { useState } from 'react';

export function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');

  const { data: booking, isLoading, isError } = useGetBookingByIdQuery(Number(bookingId));
  const [processPayment, { isLoading: isPaying }] = useProcessPaymentMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMethod: 'CARD' },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await processPayment({
        bookingId: Number(bookingId),
        body: data,
      }).unwrap();
      toast.success('Payment successful! Booking confirmed.');
      navigate('/bookings');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Payment failed. Please try again.');
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError || !booking) return <ErrorMessage error={null} />;

  const days = calcRentalDays(booking.startDate, booking.endDate);

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-headline text-4xl font-bold text-on-surface mb-2">Checkout</h1>
        <p className="text-on-surface-variant font-body">Complete your booking by providing payment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* LEFT — payment form */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Payment method selection */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-5">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                {(['CARD', 'CASH'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                      ${paymentMethod === method
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-container-highest hover:border-outline-variant'}`}
                  >
                    <span className={`material-symbols-outlined ${paymentMethod === method ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {method === 'CARD' ? 'credit_card' : 'payments'}
                    </span>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMethod === method ? 'text-primary' : 'text-on-surface'}`}>
                        {method === 'CARD' ? 'Credit/Debit Card' : 'Cash on Handoff'}
                      </p>
                      <p className="text-xs text-on-surface-variant">{method === 'CARD' ? 'Pay securely online' : 'Pay when you meet'}</p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Hidden field for payment method */}
              <input type="hidden" {...register('paymentMethod')} value={paymentMethod} />
            </div>

            {/* Card details */}
            {paymentMethod === 'CARD' && (
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card space-y-5">
                <h2 className="font-headline text-xl font-bold text-on-surface">Card Details</h2>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Card Holder Name</label>
                  <input {...register('cardHolderName')} type="text" className="us-input" placeholder="Ahmed Khalil" />
                  <FieldError message={(errors as Record<string, { message?: string }>).cardHolderName?.message} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Card Number</label>
                  <input {...register('cardNumber')} type="text" maxLength={16} className="us-input" placeholder="0000 0000 0000 0000" />
                  <FieldError message={(errors as Record<string, { message?: string }>).cardNumber?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Expiry Date</label>
                    <input {...register('expiryDate')} type="text" placeholder="MM/YY" maxLength={5} className="us-input" />
                    <FieldError message={(errors as Record<string, { message?: string }>).expiryDate?.message} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">CVC</label>
                    <input {...register('cvc')} type="text" maxLength={4} placeholder="123" className="us-input" />
                    <FieldError message={(errors as Record<string, { message?: string }>).cvc?.message} />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="bg-surface-container rounded-xl p-5 flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">info</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  You'll pay <strong className="text-on-surface">{formatCurrency(booking.totalPrice)}</strong> in cash when you meet the owner at{' '}
                  <strong className="text-on-surface">{booking.meetupLocation.name}</strong>.
                </p>
              </div>
            )}

            <Button type="submit" loading={isPaying} className="w-full justify-center" size="lg"
              leftIcon={paymentMethod === 'CARD' ? 'lock' : 'handshake'}>
              {paymentMethod === 'CARD' ? `Pay ${formatCurrency(booking.totalPrice)}` : 'Confirm Cash Booking'}
            </Button>

            <p className="text-xs text-center text-on-surface-variant">
              Your booking will be confirmed immediately after payment.
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
                  <img src={booking.listing.images[0]} alt={booking.listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">image</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">{booking.listing.title}</h3>
                <p className="text-xs text-on-surface-variant mb-2">Owner: {booking.listing.owner.fullName}</p>
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm mb-6">
              {[
                { label: 'Check-in', value: formatDate(booking.startDate) },
                { label: 'Check-out', value: formatDate(booking.endDate) },
                { label: 'Duration', value: `${days} day${days !== 1 ? 's' : ''}` },
                { label: 'Meetup', value: booking.meetupLocation.name },
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
                <span>{formatCurrency(booking.listing.pricePerDay)} × {days} day{days !== 1 ? 's' : ''}</span>
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
