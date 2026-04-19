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
      query: (params) => ({ url: '/listings', params }),
      providesTags: ['Listing'],
    }),

    // Public: get single listing
    getListingById: builder.query<ListingDto, number>({
      query: (id) => `/listings/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Listing', id }],
    }),

    // STUDENT: create listing
    createListing: builder.mutation<ListingDto, CreateListingRequest>({
      query: (body) => ({ url: '/listings', method: 'POST', body }),
      invalidatesTags: ['Listing', 'MyListings'],
    }),

    // STUDENT (owner): update listing
    updateListing: builder.mutation<ListingDto, { id: number; body: UpdateListingRequest }>({
      query: ({ id, body }) => ({ url: `/listings/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Listing', id }, 'MyListings'],
    }),

    // STUDENT (owner): delete listing
    deleteListing: builder.mutation<void, number>({
      query: (id) => ({ url: `/listings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Listing', 'MyListings'],
    }),

    // STUDENT (owner): upload images — multipart/form-data
    uploadListingImages: builder.mutation<void, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/listings/${id}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Listing', id }],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingByIdQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useUploadListingImagesMutation,
} = listingsApi;
