import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useCreateListingMutation, useUploadListingImagesMutation } from './listingsApi';
import { createListingSchema, type CreateListingFormData } from '../../utils/validators';
import { FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import type { ListingCategory, ItemCondition } from '../../types/api.types';

const CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: 'TEXTBOOKS',   label: 'Textbooks' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FURNITURE',   label: 'Furniture' },
  { value: 'CLOTHING',    label: 'Clothing' },
  { value: 'OTHER',       label: 'Other' },
];

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'NEW',       label: 'New' },
  { value: 'LIKE_NEW',  label: 'Like New' },
  { value: 'GOOD',      label: 'Good' },
  { value: 'FAIR',      label: 'Fair' },
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [createdListingId, setCreatedListingId] = useState<number | null>(null);

  const [createListing, { isLoading: isCreating }] = useCreateListingMutation();
  const [uploadImages, { isLoading: isUploading }] = useUploadListingImagesMutation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: { category: 'ELECTRONICS', condition: 'GOOD' },
  });

  const watchedValues = watch();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 5));
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data: CreateListingFormData) => {
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }

    // Step 3 — publish
    try {
      const listing = await createListing(data).unwrap();
      setCreatedListingId(listing.id);

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img));
        await uploadImages({ id: listing.id, formData }).unwrap();
      }

      toast.success('Listing published successfully!');
      navigate(`/listings/${listing.id}`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Failed to publish listing. Please try again.');
    }
  };

  const STEPS = ['Details', 'Photos', 'Publish'];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-3">
          Post a New Listing
        </h1>
        <p className="text-on-surface-variant font-body text-lg max-w-2xl">
          Share your gear with fellow ZUJ students and earn extra cash.
        </p>

        {/* Stepper */}
        <div className="mt-8 flex items-center max-w-sm">
          {STEPS.map((label, i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center">
                {i > 0 && <div className={`w-16 h-px mx-3 ${isDone ? 'bg-primary' : 'bg-surface-container-highest'}`} />}
                <div className={`flex items-center gap-2 ${isActive ? 'text-primary' : isDone ? 'text-primary' : 'text-on-surface-variant opacity-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${isActive ? 'bg-primary text-on-primary' : isDone ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {isDone ? <span className="material-symbols-outlined text-[16px]">check</span> : stepNum}
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* LEFT — form */}
          <div className="w-full lg:w-[65%]">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-card">
              {/* STEP 1 — Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Item Details</h2>
                    <p className="text-on-surface-variant text-sm">What are you renting out?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Listing Title</label>
                    <input {...register('title')} type="text" className="us-input" placeholder="e.g., Sony A7III Camera Kit" />
                    <FieldError message={errors.title?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Description</label>
                    <textarea {...register('description')} rows={4} className="us-input resize-none"
                      placeholder="Describe the condition, included accessories, and any quirks…" />
                    <FieldError message={errors.description?.message} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Category</label>
                      <div className="relative">
                        <select {...register('category')} className="us-input appearance-none pr-10">
                          {CATEGORIES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                      <FieldError message={errors.category?.message} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Condition</label>
                      <div className="relative">
                        <select {...register('condition')} className="us-input appearance-none pr-10">
                          {CONDITIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-surface-container-low/60 rounded-xl p-6">
                    <h2 className="font-headline text-xl font-bold text-on-surface mb-1">Pricing</h2>
                    <p className="text-on-surface-variant text-sm mb-4">Set a fair daily rate.</p>
                    <div className="flex items-end gap-3 max-w-xs">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-on-surface mb-2">Price per Day</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 font-semibold text-on-surface-variant">$</span>
                          <input {...register('pricePerDay', { valueAsNumber: true })} type="number" min="0.01" step="0.01"
                            className="us-input pl-8" placeholder="0.00" />
                        </div>
                        <FieldError message={errors.pricePerDay?.message} />
                      </div>
                      <span className="text-sm text-on-surface-variant mb-3">/ day</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Photos */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Photos</h2>
                    <p className="text-on-surface-variant text-sm">Upload up to 5 clear photos of your item.</p>
                  </div>

                  {/* Upload zone */}
                  <label className="border-2 border-dashed border-outline-variant/60 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-container-low/50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    </div>
                    <p className="font-semibold text-on-surface mb-1">Click to upload or drag & drop</p>
                    <p className="text-sm text-on-surface-variant">PNG, JPG, WEBP (max 5 images)</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                  </label>

                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                          <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-inverse-surface/80 rounded-full flex items-center justify-center text-inverse-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Review & Publish</h2>
                    <p className="text-on-surface-variant text-sm">Double check your listing before publishing.</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Title', value: watchedValues.title },
                      { label: 'Category', value: watchedValues.category },
                      { label: 'Condition', value: watchedValues.condition },
                      { label: 'Price', value: watchedValues.pricePerDay ? `${formatCurrency(watchedValues.pricePerDay)} / day` : '—' },
                      { label: 'Photos', value: `${imagePreviews.length} selected` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-3 border-b border-surface-container-highest last:border-0">
                        <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
                        <span className="text-sm text-on-surface font-medium">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-surface-container-highest/50">
                {step > 1 && (
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                    Back
                  </Button>
                )}
                <div className="ml-auto">
                  {step < 3 ? (
                    <Button type="submit" rightIcon="arrow_forward">
                      {step === 1 ? 'Continue to Photos' : 'Continue to Review'}
                    </Button>
                  ) : (
                    <Button type="submit" loading={isCreating || isUploading} rightIcon="publish">
                      Publish Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Live preview */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-[100px]">
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline font-bold text-lg mb-4 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">visibility</span>
                Live Preview
              </h3>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
                <div className="aspect-[4/3] bg-surface-container flex items-center justify-center">
                  {imagePreviews[0] ? (
                    <img src={imagePreviews[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">image</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-headline font-bold text-on-surface leading-tight">
                      {watchedValues.title || 'Your listing title'}
                    </h4>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary">
                        {watchedValues.pricePerDay ? formatCurrency(watchedValues.pricePerDay) : '$0.00'}
                      </div>
                      <div className="text-xs text-on-surface-variant">/ day</div>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {watchedValues.description || 'Your description will appear here…'}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs text-on-surface-variant mt-3">
                This is how your listing will appear to other students.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
