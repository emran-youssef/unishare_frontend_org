import { z } from 'zod';

// ─── Reusable field schemas ────────────────────────────────────────────────

export const eduEmailSchema = z
  .string()
  .email('Must be a valid email address')
  .refine((val) => val.toLowerCase().split('@')[1]?.endsWith('.edu'), {
    message: 'Must be a valid university .edu email address',
  });

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

// ─── Auth schemas ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName:        z.string().min(2, 'Full name must be at least 2 characters'),
    email:           z.string().email('Enter a valid personal email'),
    universityEmail: eduEmailSchema,
    password:        passwordSchema,
    confirmPassword: z.string(),
    phone:           z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Listing schemas ───────────────────────────────────────────────────────

export const createListingSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pricePerDay: z.number({ message: 'Enter a valid price' }).positive('Price must be greater than 0'),
  category:    z.enum(['TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'OTHER']),
  condition:   z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
});
export type CreateListingFormData = z.infer<typeof createListingSchema>;

// ─── Booking schema ────────────────────────────────────────────────────────

export const createBookingSchema = z
  .object({
    startDate:        z.string().min(1, 'Select a start date'),
    endDate:          z.string().min(1, 'Select an end date'),
    meetupLocationId: z.number({ message: 'Select a meetup location' }).positive(),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    { message: 'End date must be after start date', path: ['endDate'] }
  )
  .refine(
    (data) => new Date(data.startDate) >= new Date(new Date().toDateString()),
    { message: 'Start date cannot be in the past', path: ['startDate'] }
  );
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;

// ─── Payment schemas ───────────────────────────────────────────────────────

export const onlinePaymentSchema = z.object({
  paymentMethod: z.literal('ONLINE'),
  cardNumber:    z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
  cvv:           z.string().regex(/^\d{3}$/, 'CVV must be exactly 3 digits'),
});

export const cashPaymentSchema = z.object({
  paymentMethod: z.literal('CASH'),
});

export const paymentSchema = z.discriminatedUnion('paymentMethod', [
  onlinePaymentSchema,
  cashPaymentSchema,
]);
export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─── Profile schema ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().optional(),
});
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword:     passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ─── Review schema ─────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating:  z.number().min(1, 'Select a rating').max(5),
  comment: z.string().max(500).optional(),
});
export type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Chat schema ───────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});
export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
