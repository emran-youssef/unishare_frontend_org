// ─── Enums (mirror backend enums exactly) ──────────────────────────────────
export type Role = 'STUDENT' | 'ADMIN';
export type ListingCategory = 'TEXTBOOKS' | 'ELECTRONICS' | 'FURNITURE' | 'CLOTHING' | 'OTHER';
export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type ListingStatus = 'AVAILABLE' | 'RENTED' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'ONLINE' | 'CASH';
export type ReviewType = 'OWNER_TO_RENTER' | 'RENTER_TO_OWNER';

// ─── Auth DTOs ─────────────────────────────────────────────────────────────
export interface RegisterRequest {
  fullName: string;
  universityEmail: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string; // mapped to `universityEmail` before sending to backend
  password: string;
}

export interface JwtResponse {
  token: string;
  type?: string;
  userId: number;
  universityEmail: string;
  role: Role;
}

export interface ResetPasswordRequest {
  universityEmail: string;
  otp: string;
  newPassword: string;
}

// ─── User DTOs ─────────────────────────────────────────────────────────────
export interface UserDto {
  id: number;
  fullName: string;
  universityEmail: string;
  role: Role;
  profilePicture?: string;
  phone?: string;
  createdAt: string;
  email?: string; // optional backward compatibility
}

export interface PublicUserDto {
  id: number;
  fullName: string;
  universityEmail: string;
  role: Role;
  profilePicture?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  profilePicture?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Listing DTOs ──────────────────────────────────────────────────────────
export interface ListingDto {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  category: ListingCategory;
  condition: ItemCondition;
  status: ListingStatus;
  createdAt: string;
  owner: UserDto;
  images?: ListingImageDto[];
  averageRating?: number;
  totalReviews?: number;
  updatedAt?: string;
  availableFrom?: string;
}

export interface ListingImageDto {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  pricePerDay: number;
  category: ListingCategory;
  condition: ItemCondition;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  pricePerDay?: number;
  category?: ListingCategory;
  condition?: ItemCondition;
  status?: ListingStatus;
}

export interface ListingsQueryParams {
  page?: number;
  size?: number;
  category?: ListingCategory | '';
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
}

// ─── Meetup Location DTO ───────────────────────────────────────────────────
export interface MeetupLocationDto {
  id: number;
  name: string;
  description?: string;
  address?: string;
}

// ─── Booking DTOs ──────────────────────────────────────────────────────────
export interface BookingDto {
  id: number;
  listing: ListingDto;
  renter: UserDto;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  meetupLocation?: MeetupLocationDto | null;
  createdAt: string;
}

// Backend CreateBookingRequest = { listingId, startDate, endDate, meetupLocationId? }
export interface CreateBookingRequest {
  listingId: number;
  startDate: string;
  endDate: string;
  meetupLocationId?: number | null;
}

// ─── Payment DTOs ──────────────────────────────────────────────────────────
export interface PaymentDto {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface ProcessPaymentRequest {
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cvv?: string;
}

// ─── Review DTOs ───────────────────────────────────────────────────────────
export interface ReviewDto {
  id: number;
  bookingId: number;
  reviewer: PublicUserDto;
  reviewee: PublicUserDto;
  listingId: number;
  rating: number;
  comment?: string;
  type: ReviewType;
  createdAt: string;
}

export interface CreateReviewRequest {
  bookingId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
  type: ReviewType;
}

// ─── Chat DTOs ─────────────────────────────────────────────────────────────
export interface ChatMessageDto {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: PublicUserDto;
  receiver: PublicUserDto;
  listingId: number;
}

export interface SendMessageRequest {
  content: string;
}

// ─── Admin DTOs ────────────────────────────────────────────────────────────
export interface AdminStatsDto {
  totalUsers: number;
  totalListing: number;
  totalBookings: number;
  activeListings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Error Response ────────────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}