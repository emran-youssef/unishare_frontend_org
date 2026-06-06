import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useCreateReviewMutation } from '../reviewsApi';
import { reviewSchema, type ReviewFormData } from '../../../utils/validators';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/ErrorMessage';
import type { BookingDto, ReviewType } from '../../../types/api.types';
import { useAuth } from '../../../hooks/useAuth';
import { getInitials } from '../../../utils/formatters';

interface ReviewFormProps {
  booking: BookingDto;
  onClose: () => void;
}

export function ReviewForm({ booking, onClose }: ReviewFormProps) {
  const { user } = useAuth();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const isRenter = booking.renter.id === user?.id;
  const reviewee = isRenter ? booking.listing.owner : booking.renter;
  const reviewType: ReviewType = isRenter ? 'RENTER_TO_OWNER' : 'OWNER_TO_RENTER';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const selectedRating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createReview({
        bookingId: booking.id,
        revieweeId: reviewee.id,
        rating: data.rating,
        comment: data.comment,
        type: reviewType,
      }).unwrap();
      toast.success('Review submitted successfully!');
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Could not submit review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-card-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">Leave a Review</h2>
            <p className="text-on-surface-variant text-sm mt-1">For: {booking.listing.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Reviewee */}
        <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl mb-6">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-headline font-bold text-on-primary-container">
            {getInitials(reviewee.fullName)}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">Reviewing {reviewee.fullName}</p>
            <p className="text-xs text-on-surface-variant">{isRenter ? 'Item Owner' : 'Renter'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Star rating */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setValue('rating', star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <span
                    className={`material-symbols-outlined text-3xl ${(hoveredStar || selectedRating) >= star ? 'text-amber-400' : 'text-surface-container-highest'}`}
                    style={{ fontVariationSettings: (hoveredStar || selectedRating) >= star ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <FieldError message={errors.rating?.message} />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">
              Comment <span className="text-on-surface-variant font-normal text-xs">optional</span>
            </label>
            <textarea
              {...register('comment')}
              rows={4}
              className="us-input resize-none"
              placeholder="Share your experience…"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isLoading} className="flex-1 justify-center" leftIcon="star">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
