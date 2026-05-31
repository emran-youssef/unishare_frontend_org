import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { PaymentDto, ProcessPaymentRequest } from '../../types/api.types';

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    // STUDENT (renter): process payment for a confirmed booking
    // POST /api/payments/{bookingId}
    processPayment: builder.mutation<PaymentDto, { bookingId: number; body: ProcessPaymentRequest }>({
      query: ({ bookingId, body }) => ({
        url: `/payments/${bookingId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { bookingId }) => [
        'Payment',
        { type: 'Payment', id: bookingId },
      ],
    }),

    // Get payment details for a booking
    // GET /api/payments/{bookingId}
    getPayment: builder.query<PaymentDto, number>({
      query: (bookingId) => `/payments/${bookingId}`,
      providesTags: (_result, _err, bookingId) => [{ type: 'Payment', id: bookingId }],
    }),
  }),
});

export const { useProcessPaymentMutation, useGetPaymentQuery } = paymentsApi;
