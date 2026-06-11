import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { UserDto, ListingDto, BookingDto, AdminStatsDto, Role, Page } from '../../types/api.types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminUsers', 'AdminListings', 'AdminBookings', 'AdminStats'],
  endpoints: (builder) => ({
    // ── Stats ────────────────────────────────────────────────────────────
    getStats: builder.query<AdminStatsDto, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    // ── Users ────────────────────────────────────────────────────────────
    getAdminUsers: builder.query<Page<UserDto>, { page?: number; size?: number; name?: string }>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['AdminUsers'],
    }),

    getAdminUserById: builder.query<UserDto, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['AdminUsers'],
    }),

    changeUserRole: builder.mutation<UserDto, { id: number; role: Role }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role?role=${role}`, method: 'PUT' }),
      invalidatesTags: ['AdminUsers'],
    }),

    deactivateUser: builder.mutation<UserDto, number>({
      query: (id) => ({ url: `/admin/users/${id}/deactivate`, method: 'PUT' }),
      invalidatesTags: ['AdminUsers'],
    }),

    activateUser: builder.mutation<UserDto, number>({
      query: (id) => ({ url: `/admin/users/${id}/activate`, method: 'PUT' }),
      invalidatesTags: ['AdminUsers'],
    }),

    // ── Listings ─────────────────────────────────────────────────────────
    getAdminListings: builder.query<Page<ListingDto>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/admin/listings', params }),
      providesTags: ['AdminListings'],
    }),

    deactivateListing: builder.mutation<ListingDto, number>({
      query: (id) => ({ url: `/admin/listings/${id}/deactivate`, method: 'PUT' }),
      invalidatesTags: ['AdminListings', 'AdminStats'],
    }),

    activateListing: builder.mutation<ListingDto, number>({
      query: (id) => ({ url: `/admin/listings/${id}/activate`, method: 'PUT' }),
      invalidatesTags: ['AdminListings', 'AdminStats'],
    }),

    // ── Bookings ─────────────────────────────────────────────────────────
    getAdminBookings: builder.query<Page<BookingDto>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/admin/bookings', params }),
      providesTags: ['AdminBookings'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useChangeUserRoleMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
  useGetAdminListingsQuery,
  useDeactivateListingMutation,
  useActivateListingMutation,
  useGetAdminBookingsQuery,
} = adminApi;
