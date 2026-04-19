import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserDto } from '../../types/api.types';
import type { RootState } from '../../app/store';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Load persisted auth from localStorage on startup
const persistedToken = localStorage.getItem('unishare_token');
const persistedUser = localStorage.getItem('unishare_user');

const initialState: AuthState = {
  token: persistedToken ?? null,
  user: persistedUser ? (JSON.parse(persistedUser) as UserDto) : null,
  isAuthenticated: !!persistedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: UserDto; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('unishare_token', action.payload.token);
      localStorage.setItem('unishare_user', JSON.stringify(action.payload.user));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('unishare_token');
      localStorage.removeItem('unishare_user');
    },
    updateUser: (state, action: PayloadAction<UserDto>) => {
      state.user = action.payload;
      localStorage.setItem('unishare_user', JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser  = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentRole  = (state: RootState) => state.auth.user?.role;
