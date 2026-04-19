import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { BookingDto, CreateBookingRequest } from '../../types/api.types';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Create new booking
    createBooking: builder.mutation<BookingDto, CreateBookingRequest>({
      query: (body) => ({ url: '/bookings', method: 'POST', body }),
      invalidatesTags: ['Booking'],
    }),

    // Get own bookings (as renter + as owner)
    getMyBookings: builder.query<BookingDto[], void>({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),

    // Get single booking by ID
    getBookingById: builder.query<BookingDto, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Booking', id }],
    }),

    // Renter cancels booking
    cancelBooking: builder.mutation<BookingDto, number>({
      query: (id) => ({ url: `/bookings/${id}/cancel`, method: 'PUT' }),
      invalidatesTags: ['Booking'],
    }),

    // Owner confirms booking
    confirmBooking: builder.mutation<BookingDto, number>({
      query: (id) => ({ url: `/bookings/${id}/confirm`, method: 'PUT' }),
      invalidatesTags: ['Booking'],
    }),

    // Owner marks booking as completed
    completeBooking: builder.mutation<BookingDto, number>({
      query: (id) => ({ url: `/bookings/${id}/complete`, method: 'PUT' }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCompleteBookingMutation,
} = bookingsApi;
