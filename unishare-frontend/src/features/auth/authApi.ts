import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';
import type { LoginRequest, RegisterRequest, JwtResponse, ResetPasswordRequest } from '../../types/api.types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<JwtResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<void, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    // Step 1: send OTP to university email (query param, no body)
    forgotPassword: builder.mutation<void, string>({
      query: (uniEmail) => ({
        url: `/auth/forgot-password?uniEmail=${encodeURIComponent(uniEmail)}`,
        method: 'POST',
      }),
    }),
    // Step 2: verify OTP and set new password
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
