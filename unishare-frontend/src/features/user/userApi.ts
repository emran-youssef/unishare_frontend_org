import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type {
  UserDto,
  PublicUserDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  MeetupLocationDto,
} from '../../types/api.types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile', 'MeetupLocations'],
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<UserDto, void>({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),

    // Update profile
    updateProfile: builder.mutation<UserDto, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),

    // Change password
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: '/users/me/password', method: 'PUT', body }),
    }),

    // Get a user's public profile (anyone can view)
    getPublicProfile: builder.query<PublicUserDto, number>({
      query: (id) => `/users/${id}`,
      providesTags: ['Profile'],
    }),

    // Get all active meetup locations (authenticated)
    getMeetupLocations: builder.query<MeetupLocationDto[], void>({
      query: () => '/meetup-locations',
      providesTags: ['MeetupLocations'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetPublicProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMeetupLocationsQuery,
} = userApi;
