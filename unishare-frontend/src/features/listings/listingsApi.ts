import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type {
  ListingDto,
  CreateListingRequest,
  UpdateListingRequest,
  ListingsQueryParams,
  Page,
} from '../../types/api.types';

export const listingsApi = createApi({
  reducerPath: 'listingsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Listing', 'MyListings'],
  endpoints: (builder) => ({
    // Public: browse all listings
    getListings: builder.query<Page<ListingDto>, ListingsQueryParams>({
      query: (params) => ({ url: '/listing', params }),
      providesTags: ['Listing'],
    }),

    // Public: get single listing
    getListingById: builder.query<ListingDto, number>({
      query: (id) => `/listing/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Listing', id }],
    }),

    // STUDENT: get my listings by userId
    getMyListings: builder.query<Page<ListingDto>, { userId: number; page?: number; size?: number }>({
      query: ({ userId, ...params }) => ({ url: `/listing/user/${userId}`, params }),
      providesTags: ['MyListings'],
    }),

    // STUDENT: create listing
    createListing: builder.mutation<ListingDto, CreateListingRequest>({
      query: (body) => ({ url: '/listing/create', method: 'POST', body }),
      invalidatesTags: ['Listing', 'MyListings'],
    }),

    // STUDENT (owner): update listing
    updateListing: builder.mutation<ListingDto, { id: number; body: UpdateListingRequest }>({
      query: ({ id, body }) => ({ url: `/listing/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Listing', id }, 'MyListings'],
    }),

    // STUDENT (owner): upload listing images
    uploadListingImages: builder.mutation<ListingDto, { listingId: number; formData: FormData }>({
      query: ({ listingId, formData }) => ({
        url: `/listings/${listingId}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _err, { listingId }) => [{ type: 'Listing', id: listingId }, 'MyListings'],
    }),

    // STUDENT (owner): delete listing
    deleteListing: builder.mutation<void, number>({
      query: (id) => ({ url: `/listing/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Listing', 'MyListings'],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useGetMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useUploadListingImagesMutation,
} = listingsApi;
