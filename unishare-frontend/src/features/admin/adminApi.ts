import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { AdminStatsDto, UserDto, ListingDto, Page } from '../../types/api.types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminUsers', 'AdminListings', 'AdminStats'],
  endpoints: (builder) => ({
    // Dashboard statistics
    getAdminStats: builder.query<AdminStatsDto, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    // List all users (paginated)
    getAdminUsers: builder.query<Page<UserDto>, { page?: number; size?: number; search?: string }>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['AdminUsers'],
    }),

    // Deactivate a user
    deactivateUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/users/${id}/deactivate`, method: 'PUT' }),
      invalidatesTags: ['AdminUsers'],
    }),

    // List all listings (paginated)
    getAdminListings: builder.query<Page<ListingDto>, { page?: number; size?: number; search?: string }>({
      query: (params) => ({ url: '/admin/listings', params }),
      providesTags: ['AdminListings'],
    }),

    // Deactivate a listing
    deactivateListing: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/listings/${id}/deactivate`, method: 'PUT' }),
      invalidatesTags: ['AdminListings'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useDeactivateUserMutation,
  useGetAdminListingsQuery,
  useDeactivateListingMutation,
} = adminApi;
