import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { RoleGuard } from '../guards/RoleGuard';
import { AppLayout } from '../components/layout/AppLayout';

// Auth
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';

// Listings
import { ListingsPage } from '../features/listings/ListingsPage';
import { ListingDetailPage } from '../features/listings/ListingDetailPage';
import { CreateListingPage } from '../features/listings/CreateListingPage';
import { MyListingsPage } from '../features/listings/MyListingsPage';
import { EditListingPage } from '../features/listings/EditListingPage';

// Bookings
import { MyBookingsPage } from '../features/bookings/MyBookingsPage';

// Payments
import { CheckoutPage } from '../features/payments/CheckoutPage';

// Chat
import { ChatPage } from '../features/chat/ChatPage';

// Profile
import { ProfilePage } from '../features/user/ProfilePage';

// Admin
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminListingsPage } from '../features/admin/AdminListingsPage';
import { AdminBookingsPage } from '../features/admin/AdminBookingsPage';

// Public profile
import { PublicProfilePage } from '../features/user/PublicProfilePage';

// 404
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes wrapped in AppLayout (Navbar + Footer) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />

          {/* Auth — redirect if already logged in handled inside the pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected student routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/listings/create" element={<CreateListingPage />} />
            <Route path="/listings/:id/edit" element={<EditListingPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/checkout/:bookingId" element={<CheckoutPage />} />

            {/* Chat: /chat (inbox) and /chat/:listingId/:userId (thread) */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:listingId/:userId" element={<ChatPage />} />

            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleGuard role="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/listings" element={<AdminListingsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
