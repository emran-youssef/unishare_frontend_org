import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import { ChatDropdown } from '../../features/chat/ChatDropdown';

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`;

export function Sidebar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isCreatePage = pathname === '/listings/create';

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeDrawer();
    setProfileMenuOpen(false);
  };

  const brand = (
    <Link
      to="/"
      onClick={closeDrawer}
      className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-primary font-headline transition-transform active:scale-95"
    >
      <span
        className="material-symbols-outlined material-symbols-filled rounded-xl bg-primary/10 p-1.5 text-[22px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        local_mall
      </span>
      Unishare
    </Link>
  );

  const notificationsButton = isAuthenticated && (
    <button
      type="button"
      aria-label="Notifications"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
    >
      <span className="material-symbols-outlined text-[20px]">notifications</span>
    </button>
  );

  const profileMenu = isAuthenticated && (
    <div className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={profileMenuOpen}
        onClick={() => setProfileMenuOpen((o) => !o)}
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20 active:scale-95"
      >
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={user.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-primary-container text-xs font-bold text-on-primary-container font-headline">
            {user ? getInitials(user.fullName) : 'U'}
          </div>
        )}
      </button>

      {profileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-2 shadow-card-lg">
            <div className="mx-2 mb-1 rounded-lg bg-surface-container-low px-3 py-3">
              <p className="truncate text-sm font-semibold text-on-surface">{user?.fullName}</p>
              <p className="truncate text-xs text-on-surface-variant">{user?.universityEmail}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setProfileMenuOpen(false)}
              className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-error transition-colors hover:bg-error-container/30"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );

  const navLinks = (
    <nav className="flex-grow space-y-1 overflow-y-auto px-3 py-2">
      <NavLink to="/" onClick={closeDrawer} className={sidebarLinkClass}>
        <span className="material-symbols-outlined text-[19px]">storefront</span>
        Browse
      </NavLink>
      {isAuthenticated && (
        <>
          <NavLink
            to="/listings/create"
            onClick={closeDrawer}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
              isCreatePage
                ? 'bg-primary text-on-primary shadow-primary'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">add_circle</span>
            Post a Listing
          </NavLink>
          <NavLink to="/my-listings" onClick={closeDrawer} className={sidebarLinkClass}>
            <span className="material-symbols-outlined text-[19px]">inventory_2</span>
            My Listings
          </NavLink>
          <NavLink to="/bookings" onClick={closeDrawer} className={sidebarLinkClass}>
            <span className="material-symbols-outlined text-[19px]">event_available</span>
            My Bookings
          </NavLink>
        </>
      )}
      {isAdmin && (
        <NavLink
          to="/admin"
          onClick={closeDrawer}
          className={({ isActive }) => `mobile-nav-link text-secondary font-bold ${isActive ? 'bg-secondary/10' : ''}`}
        >
          <span className="material-symbols-outlined text-[19px]">admin_panel_settings</span>
          Admin Panel
        </NavLink>
      )}
    </nav>
  );

  const userFooter = isAuthenticated ? (
    <div className="border-t border-surface-container-highest p-3">
      <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-container text-sm font-bold text-on-primary-container font-headline">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.fullName} className="h-full w-full object-cover" />
          ) : (
            <span>{user ? getInitials(user.fullName) : 'U'}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface">{user?.fullName}</p>
          <p className="truncate text-xs text-on-surface-variant">{user?.universityEmail}</p>
        </div>
      </div>
      <NavLink to="/profile" onClick={closeDrawer} className={sidebarLinkClass}>
        <span className="material-symbols-outlined text-[19px]">person</span>
        Profile
      </NavLink>
      <button onClick={handleLogout} className="mobile-nav-link w-full text-left text-error">
        <span className="material-symbols-outlined text-[19px]">logout</span>
        Sign out
      </button>
    </div>
  ) : (
    <div className="space-y-2 border-t border-surface-container-highest p-3">
      <Link to="/login" onClick={closeDrawer} className="btn-ghost block w-full px-4 py-2 text-center text-sm">
        Sign in
      </Link>
      <Link to="/register" onClick={closeDrawer} className="btn-primary block w-full px-4 py-2.5 text-center text-sm">
        Get Started
      </Link>
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <div className="glass-nav fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-primary font-headline">
            <span
              className="material-symbols-outlined material-symbols-filled rounded-xl bg-primary/10 p-1.5 text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_mall
            </span>
            Unishare
          </Link>
        </div>
        <div className="flex items-center gap-1">
          {isAuthenticated && <ChatDropdown />}
          {notificationsButton}
          {profileMenu}
        </div>
      </div>

      {/* Slide-in sidebar, opened via the menu button */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-surface-container-lowest shadow-card-lg">
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-4">
              {brand}
              <button
                type="button"
                aria-label="Close navigation menu"
                className="grid h-10 w-10 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low"
                onClick={closeDrawer}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {navLinks}
            {userFooter}
          </aside>
        </div>
      )}
    </>
  );
}
