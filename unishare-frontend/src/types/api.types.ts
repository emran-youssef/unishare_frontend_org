// ─── Enums (mirrors backend enums exactly) ────────────────────────────────
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
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  user: UserDto;
}

// ─── User DTOs ─────────────────────────────────────────────────────────────
export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  universityEmail: string;
  role: Role;
  profilePicture?: string;
  phone?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  universityEmail: string;
  otp: string;
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
  images: string[];
  owner: UserDto;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
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
  search?: string;
  sort?: string;
  ownerId?: number;
}

// ─── Booking DTOs ──────────────────────────────────────────────────────────
export interface BookingDto {
  id: number;
  listing: ListingDto;
  renter: UserDto;
  startDate: string; // ISO date 'YYYY-MM-DD'
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  meetupLocation: MeetupLocationDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  listingId: number;
  startDate: string;
  endDate: string;
  meetupLocationId: number;
}

// ─── Payment DTOs ──────────────────────────────────────────────────────────
export interface PaymentDto {
  id: number;
  bookingId: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
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
  reviewer: UserDto;
  reviewee: UserDto;
  listing: ListingDto;
  rating: number; // 1–5
  comment?: string;
  type: ReviewType;
  createdAt: string;
}

export interface CreateReviewRequest {
  bookingId: number;
  revieweeId: number;
  listingId: number;
  rating: number;
  comment?: string;
  type: ReviewType;
}

// ─── Chat DTOs ─────────────────────────────────────────────────────────────
export interface ChatMessageDto {
  id: number;
  sender: UserDto;
  receiver: UserDto;
  listing?: ListingDto;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  listingId?: number;
}

export interface ConversationDto {
  otherUser: UserDto;
  lastMessage: ChatMessageDto;
  unreadCount: number;
}

// ─── Meetup Location DTOs ──────────────────────────────────────────────────
export interface MeetupLocationDto {
  id: number;
  name: string;
  description?: string;
  address?: string;
  isActive: boolean;
}

// ─── Admin DTOs ────────────────────────────────────────────────────────────
export interface AdminStatsDto {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  newBookings: number;
  estimatedRevenue: number;
  userGrowthPercent?: number;
  listingGrowthPercent?: number;
  bookingGrowthPercent?: number;
  revenueGrowthPercent?: number;
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed current page
  size: number;
}

// ─── Error Response (matches backend GlobalExceptionHandler) ───────────────
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}
