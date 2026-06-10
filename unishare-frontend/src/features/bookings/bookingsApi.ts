import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import { listingsApi } from '../listings/listingsApi';
import type { BookingDto, CreateBookingRequest } from '../../types/api.types';

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Create new booking — backend endpoint is /bookings/create
    createBooking: builder.mutation<BookingDto, CreateBookingRequest>({
      query: (body) => ({ url: '/bookings/create', method: 'POST', body }),
      invalidatesTags: ['Booking'],
    }),

    // Get own bookings (as renter)
    getMyBookings: builder.query<BookingDto[], void>({
      query: () => '/bookings/my',
      providesTags: ['Booking'],
    }),

    // Get incoming bookings (as listing owner)
    getIncomingBookings: builder.query<BookingDto[], void>({
      query: () => '/bookings/incoming',
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
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;

        dispatch(
          listingsApi.util.invalidateTags([
            'Listing',
            'MyListings',
            { type: 'Listing', id: data.listing.id },
          ])
        );
      },
      invalidatesTags: ['Booking'],
    }),

    // Attach a campus meetup location to a booking
    // PUT /api/bookings/{id}/meetup?locationId={locationId}
    attachMeetupLocation: builder.mutation<BookingDto, { id: number; locationId: number }>({
      query: ({ id, locationId }) => ({
        url: `/bookings/${id}/meetup?locationId=${locationId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetIncomingBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCompleteBookingMutation,
  useAttachMeetupLocationMutation,
} = bookingsApi;
