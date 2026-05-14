import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { UserDto, Page } from '../../types/api.types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminUsers'],
  endpoints: (builder) => ({
    // List all users — correct endpoint is GET /users/all (requires ADMIN role)
    getAdminUsers: builder.query<Page<UserDto>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/users/all', params }),
      providesTags: ['AdminUsers'],
    }),

    // NOTE: The following endpoints are NOT yet implemented on the backend.
    // They are commented out to prevent 404 errors.
    // Uncomment each one when the backend team confirms it is ready.

    // getAdminStats: builder.query<AdminStatsDto, void>({
    //   query: () => '/admin/stats',   // NOT BUILT YET
    // }),

    // deactivateUser: builder.mutation<void, number>({
    //   query: (id) => ({ url: `/admin/users/${id}/deactivate`, method: 'PUT' }), // NOT BUILT YET
    // }),

    // getAdminListings: builder.query<Page<ListingDto>, { page?: number; size?: number }>({
    //   query: (params) => ({ url: '/admin/listings', params }),  // NOT BUILT YET
    // }),

    // deactivateListing: builder.mutation<void, number>({
    //   query: (id) => ({ url: `/admin/listings/${id}/deactivate`, method: 'PUT' }), // NOT BUILT YET
    // }),
  }),
});

export const {
  useGetAdminUsersQuery,
} = adminApi;
