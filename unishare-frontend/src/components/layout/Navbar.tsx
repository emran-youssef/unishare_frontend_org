import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`;

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`;

export function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isCreatePage = pathname === '/listings/create';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter text-primary font-headline flex items-center gap-2 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined material-symbols-filled rounded-xl bg-primary/10 p-1.5 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_mall
            </span>
            UniShare
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 font-headline tracking-tight">
            <NavLink to="/" className={desktopNavClass}>Browse</NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/listings/create"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all active:scale-95 ${
                    isCreatePage
                      ? 'bg-primary text-on-primary shadow-primary'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Post
                </NavLink>
                <NavLink to="/my-listings" className={desktopNavClass}>My Listings</NavLink>
                <NavLink to="/chat" className={desktopNavClass}>Messages</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link text-secondary font-bold ${isActive ? 'bg-secondary/10' : ''}`}>
                Admin Panel
              </NavLink>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button
                type="button"
                aria-label="Notifications"
                className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent ring-2 ring-transparent transition-all hover:border-primary hover:ring-primary/10 active:scale-95"
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm font-headline">
                      {user ? getInitials(user.fullName) : 'U'}
                    </div>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-2 shadow-card-lg z-50">
                    <div className="mx-2 mb-1 rounded-lg bg-surface-container-low px-3 py-3">
                      <p className="font-semibold text-on-surface text-sm">{user?.fullName}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.universityEmail}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profile
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setProfileOpen(false)}
                      className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                      My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-surface-container-low"
                      >
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-surface-container-highest mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-error transition-colors hover:bg-error-container/30"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2.5">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-4 shadow-card-lg">
          {isAuthenticated && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container font-headline">
                {user ? getInitials(user.fullName) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">{user?.fullName}</p>
                <p className="truncate text-xs text-on-surface-variant">{user?.universityEmail}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
              <span className="material-symbols-outlined text-[19px]">storefront</span>
              Browse Listings
            </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/listings/create" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">add_circle</span>
                Post a Listing
              </NavLink>
              <NavLink to="/my-listings" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">inventory_2</span>
                My Listings
              </NavLink>
              <NavLink to="/bookings" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">event_available</span>
                My Bookings
              </NavLink>
              <NavLink to="/chat" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">chat_bubble</span>
                Messages
              </NavLink>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">person</span>
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                  <span className="material-symbols-outlined text-[19px]">admin_panel_settings</span>
                  Admin Panel
                </NavLink>
              )}
              <button onClick={handleLogout} className="mobile-nav-link w-full text-left text-error">
                <span className="material-symbols-outlined text-[19px]">logout</span>
                Sign out
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">login</span>
                Sign in
              </NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)} className={mobileNavClass}>
                <span className="material-symbols-outlined text-[19px]">person_add</span>
                Get Started
              </NavLink>
            </>
          )}
          </div>
        </div>
      )}

      {/* Overlay for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
}
