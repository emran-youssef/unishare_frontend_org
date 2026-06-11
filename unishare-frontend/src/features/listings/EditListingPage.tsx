import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetListingByIdQuery, useUpdateListingMutation } from './listingsApi';
import { useAuth } from '../../hooks/useAuth';
import { FieldError, ErrorMessage } from '../../components/ui/ErrorMessage';
import { PageSpinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { createListingSchema, type CreateListingFormData } from '../../utils/validators';
import { CATEGORY_LABELS, CONDITION_LABELS, formatCurrency, getImageUrl } from '../../utils/formatters';
import type { ItemCondition, ListingCategory } from '../../types/api.types';

const CATEGORIES: ListingCategory[] = ['TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'OTHER'];
const CONDITIONS: ItemCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: listing, isLoading, isError, refetch } = useGetListingByIdQuery(listingId, {
    skip: Number.isNaN(listingId),
    refetchOnMountOrArgChange: true,
  });
  const [updateListing, { isLoading: isSaving }] = useUpdateListingMutation();

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      description: '',
      pricePerDay: 0,
      category: 'ELECTRONICS',
      condition: 'GOOD',
    },
  });

  useEffect(() => {
    if (!listing) return;
    reset({
      title: listing.title,
      description: listing.description,
      pricePerDay: listing.pricePerDay,
      category: listing.category,
      condition: listing.condition,
    });
  }, [listing, reset]);

  const watchedValues = watch();
  const isOwner = Boolean(user && listing && user.id === listing.owner.id);
  const mainImage = getImageUrl(listing?.images?.[0]?.imageUrl);

  const onSubmit = async (data: CreateListingFormData) => {
    if (!listing || !isOwner) return;

    try {
      await updateListing({ id: listing.id, body: data }).unwrap();
      toast.success('Listing updated.');
      navigate(`/listings/${listing.id}`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Could not update listing. Please try again.');
    }
  };

  if (Number.isNaN(listingId)) return <ErrorMessage error={{ status: 404 }} />;
  if (isLoading) return <PageSpinner />;
  if (isError || !listing) return <ErrorMessage error={null} onRetry={refetch} />;

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-screen-md px-6 py-16">
        <div className="rounded-xl bg-surface-container-lowest p-8 text-center shadow-card">
          <span className="material-symbols-outlined mb-3 block text-4xl text-error">lock</span>
          <h1 className="mb-2 font-headline text-2xl font-bold text-on-surface">You cannot edit this listing</h1>
          <p className="mb-6 text-sm text-on-surface-variant">Only the listing owner can update listing details.</p>
          <Link to={`/listings/${listing.id}`} className="btn-surface inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">Manage Listing</p>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface md:text-5xl">
            Edit Listing
          </h1>
          <p className="mt-2 text-on-surface-variant">Update the details students see before they book.</p>
        </div>
        <Link to={`/listings/${listing.id}`} className="btn-surface inline-flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          View Listing
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col items-start gap-10 lg:flex-row">
          <div className="w-full lg:w-[65%]">
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-card">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Listing Title</label>
                  <input {...register('title')} type="text" className="us-input" placeholder="e.g., Sony A7III Camera Kit" />
                  <FieldError message={errors.title?.message} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    className="us-input resize-none"
                    placeholder="Describe the condition, included accessories, and any quirks..."
                  />
                  <FieldError message={errors.description?.message} />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Category</label>
                    <div className="relative">
                      <select {...register('category')} className="us-input appearance-none pr-10">
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3 text-on-surface-variant">expand_more</span>
                    </div>
                    <FieldError message={errors.category?.message} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Condition</label>
                    <div className="relative">
                      <select {...register('condition')} className="us-input appearance-none pr-10">
                        {CONDITIONS.map((condition) => (
                          <option key={condition} value={condition}>{CONDITION_LABELS[condition]}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-3 text-on-surface-variant">expand_more</span>
                    </div>
                    <FieldError message={errors.condition?.message} />
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-low/60 p-6">
                  <h2 className="mb-1 font-headline text-xl font-bold text-on-surface">Pricing</h2>
                  <p className="mb-4 text-sm text-on-surface-variant">Change the daily rental price.</p>
                  <div className="flex max-w-xs items-end gap-3">
                    <div className="flex-1">
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Price per Day</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 font-semibold text-on-surface-variant">$</span>
                        <input
                          {...register('pricePerDay', { valueAsNumber: true })}
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="us-input pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      <FieldError message={errors.pricePerDay?.message} />
                    </div>
                    <span className="mb-3 text-sm text-on-surface-variant">/ day</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-surface-container-highest/50 pt-6 sm:flex-row sm:justify-end">
                <Link to={`/listings/${listing.id}`} className="btn-surface inline-flex items-center justify-center px-6 py-3 text-sm">
                  Cancel
                </Link>
                <Button type="submit" loading={isSaving} disabled={!isDirty} rightIcon="save">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full lg:sticky lg:top-[100px] lg:w-[35%]">
            <div className="rounded-xl bg-surface-container-low p-6">
              <h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
                <span className="material-symbols-outlined text-xl text-primary">preview</span>
                Preview
              </h2>
              <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-card">
                <div className="flex aspect-[4/3] items-center justify-center bg-surface-container">
                  {mainImage ? (
                    <img src={mainImage} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">image</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-headline font-bold leading-tight text-on-surface">
                      {watchedValues.title || listing.title}
                    </h3>
                    <div className="shrink-0 text-right">
                      <div className="font-bold text-primary">
                        {watchedValues.pricePerDay ? formatCurrency(watchedValues.pricePerDay) : formatCurrency(listing.pricePerDay)}
                      </div>
                      <div className="text-xs text-on-surface-variant">/ day</div>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-xs text-on-surface-variant">
                    {watchedValues.description || listing.description}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-on-surface-variant">
                Existing photos are kept. Photo management can be added separately.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
