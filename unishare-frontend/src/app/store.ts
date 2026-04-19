import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { listingsApi } from '../features/listings/listingsApi';
import { bookingsApi } from '../features/bookings/bookingsApi';
import { paymentsApi } from '../features/payments/paymentsApi';
import { reviewsApi } from '../features/reviews/reviewsApi';
import { chatApi } from '../features/chat/chatApi';
import { userApi } from '../features/user/userApi';
import { adminApi } from '../features/admin/adminApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]:     authApi.reducer,
    [listingsApi.reducerPath]: listingsApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [reviewsApi.reducerPath]:  reviewsApi.reducer,
    [chatApi.reducerPath]:     chatApi.reducer,
    [userApi.reducerPath]:     userApi.reducer,
    [adminApi.reducerPath]:    adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      listingsApi.middleware,
      bookingsApi.middleware,
      paymentsApi.middleware,
      reviewsApi.middleware,
      chatApi.middleware,
      userApi.middleware,
      adminApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
