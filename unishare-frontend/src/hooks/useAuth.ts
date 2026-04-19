import { useAppSelector } from '../app/hooks';
import { useAppDispatch } from '../app/hooks';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectCurrentRole,
  clearCredentials,
} from '../features/auth/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectCurrentToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectCurrentRole);

  const logout = () => {
    dispatch(clearCredentials());
  };

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin: role === 'ADMIN',
    isStudent: role === 'STUDENT',
    logout,
  };
}
