import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { ReviewDto, CreateReviewRequest } from '../../types/api.types';

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    // Public: get reviews for a listing
    getListingReviews: builder.query<ReviewDto[], number>({
      query: (listingId) => `/reviews/listing/${listingId}`,
      providesTags: (_result, _err, listingId) => [{ type: 'Review', id: `listing-${listingId}` }],
    }),

    // Public: get reviews for a user
    getUserReviews: builder.query<ReviewDto[], number>({
      query: (userId) => `/reviews/user/${userId}`,
      providesTags: (_result, _err, userId) => [{ type: 'Review', id: `user-${userId}` }],
    }),

    // STUDENT: create a review (COMPLETED bookings only)
    createReview: builder.mutation<ReviewDto, CreateReviewRequest>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetListingReviewsQuery,
  useGetUserReviewsQuery,
  useCreateReviewMutation,
} = reviewsApi;
