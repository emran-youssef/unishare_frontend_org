import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { clearCredentials } from '../features/auth/authSlice';
import type { ApiError } from '../types/api.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Shared base query with JWT injection
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper: auto-logout on 401
export const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error && result.error.status === 401) {
    api.dispatch(clearCredentials());
  }
  return result;
};

// Helper to extract field errors from backend error response
export function extractFieldErrors(error: unknown): Record<string, string> {
  const apiErr = error as { data?: ApiError };
  return apiErr?.data?.fieldErrors ?? {};
}
