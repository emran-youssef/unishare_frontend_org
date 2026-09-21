import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { listingsApi } from '../features/listings/listingsApi';
import { bookingsApi } from '../features/bookings/bookingsApi';
import { paymentsApi } from '../features/payments/paymentsApi';
import { reviewsApi } from '../features/reviews/reviewsApi';
import { chatApi } from '../features/chat/chatApi';
import { userApi } from '../features/user/userApi';
import { adminApi } from '../features/admin/adminApi';
import authReducer, { clearCredentials } from '../features/auth/authSlice';

const appReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]:     authApi.reducer,
  [listingsApi.reducerPath]: listingsApi.reducer,
  [bookingsApi.reducerPath]: bookingsApi.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
  [reviewsApi.reducerPath]:  reviewsApi.reducer,
  [chatApi.reducerPath]:     chatApi.reducer,
  [userApi.reducerPath]:     userApi.reducer,
  [adminApi.reducerPath]:    adminApi.reducer,
});

// Wipe every RTK Query cache (not just the auth slice) whenever a session
// ends — logout and auto-logout-on-401 both dispatch clearCredentials —
// so a new login never serves the previous user's cached data.
const rootReducer: typeof appReducer = (state, action) =>
  appReducer(action.type === clearCredentials.type ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
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
