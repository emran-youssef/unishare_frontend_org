import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from './userApi';
import { useGetUserReviewsQuery } from '../reviews/reviewsApi';
import { useAppDispatch } from '../../app/hooks';
import { updateUser } from '../auth/authSlice';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorMessage, FieldError } from '../../components/ui/ErrorMessage';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/Badge';
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from '../../utils/validators';
import { getInitials, formatDate } from '../../utils/formatters';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={`material-symbols-outlined text-[14px] ${i <= rating ? 'text-amber-400' : 'text-surface-container-highest'}`}
          style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
      ))}
    </div>
  );
}

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const { data: userReviews = [] } = useGetUserReviewsQuery(profile?.id ?? 0, { skip: !profile });
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation();

  const profileForm = useForm<UpdateProfileFormData>({ resolver: zodResolver(updateProfileSchema) });
  const passwordForm = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) });

  useEffect(() => {
    if (profile) {
      profileForm.reset({ fullName: profile.fullName, phone: profile.phone });
    }
  }, [profile]);

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    try {
      const updated = await updateProfile(data).unwrap();
      dispatch(updateUser(updated));
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; fieldErrors?: Record<string, string> } };
      if (apiErr?.data?.fieldErrors) {
        Object.entries(apiErr.data.fieldErrors).forEach(([field, msg]) => {
          profileForm.setError(field as keyof UpdateProfileFormData, { message: msg });
        });
      } else {
        toast.error(apiErr?.data?.message ?? 'Could not update profile.');
      }
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap();
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      toast.error(apiErr?.data?.message ?? 'Could not change password. Check your current password.');
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError || !profile) return <ErrorMessage error={null} />;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Profile header */}
      <div className="us-card p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-container/20 to-secondary-fixed/20" />
        <div className="relative z-10 mt-4">
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center font-headline font-bold text-2xl text-on-primary-container border-4 border-surface-container-lowest shadow-sm">
            {getInitials(profile.fullName)}
          </div>
        </div>
        <div className="relative z-10 mt-8 sm:mt-4 text-center sm:text-left">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">{profile.fullName}</h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="text-on-surface-variant text-sm">{profile.universityEmail}</span>
            <VerifiedBadge />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-wider">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* LEFT — forms */}
        <div className="space-y-6">
          {/* Profile info */}
          <div className="us-card p-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">Personal Information</h2>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
                  <input {...profileForm.register('fullName')} type="text" className="us-input" />
                  <FieldError message={profileForm.formState.errors.fullName?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Phone</label>
                  <input {...profileForm.register('phone')} type="tel" className="us-input" placeholder="+962 7X XXX XXXX" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">University Email</label>
                <div className="relative">
                  <input type="email" disabled value={profile.universityEmail}
                    className="us-input opacity-60 cursor-not-allowed pr-12" />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-secondary text-[20px]">verified</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Verified @zuj.edu.jo email cannot be changed.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={isSavingProfile}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="us-card p-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">Change Password</h2>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Current Password</label>
                <input {...passwordForm.register('currentPassword')} type="password" className="us-input" placeholder="••••••••" />
                <FieldError message={passwordForm.formState.errors.currentPassword?.message} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">New Password</label>
                  <input {...passwordForm.register('newPassword')} type="password" className="us-input" />
                  <FieldError message={passwordForm.formState.errors.newPassword?.message} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Confirm New Password</label>
                  <input {...passwordForm.register('confirmPassword')} type="password" className="us-input" />
                  <FieldError message={passwordForm.formState.errors.confirmPassword?.message} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={isChangingPw} variant="ghost">Change Password</Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT — activity + reviews */}
        <div className="space-y-6">
          {/* Activity stats */}
          <div className="us-card p-6">
            <h3 className="font-headline text-xl font-bold text-on-surface mb-5">Your Activity</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Member Since', value: profile.createdAt ? formatDate(profile.createdAt) : '—', icon: 'calendar_today', color: 'text-primary' },
                { label: 'Reviews', value: userReviews.length, icon: 'star', color: 'text-amber-400' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center text-center">
                  <span className={`material-symbols-outlined mb-1 ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <span className="font-headline font-bold text-xl text-on-surface">{value}</span>
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reviews */}
          {userReviews.length > 0 && (
            <div className="us-card p-6">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {userReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-surface-container-low p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-on-surface-variant">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-on-surface italic">"{review.comment}"</p>
                    )}
                    <p className="text-xs text-on-surface-variant mt-2">— {review.reviewer.fullName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
