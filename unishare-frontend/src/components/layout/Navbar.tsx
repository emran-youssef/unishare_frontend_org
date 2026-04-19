import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

export function Navbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter text-primary font-headline flex items-center gap-2"
          >
            <span className="material-symbols-outlined material-symbols-filled" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_mall
            </span>
            UniShare
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 font-headline tracking-tight">
            <Link to="/" className="nav-link">Browse</Link>
            {isAuthenticated && (
              <>
                <Link to="/listings/create" className="nav-link">Post a Listing</Link>
                <Link to="/my-listings"     className="nav-link">My Listings</Link>
                <Link to="/chat"            className="nav-link">Messages</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="nav-link text-secondary font-bold">Admin Panel</Link>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors active:scale-95"
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
                  <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-card-lg border border-outline-variant/20 py-2 z-50">
                    <div className="px-4 py-2 border-b border-surface-container-highest">
                      <p className="font-semibold text-on-surface text-sm">{user?.fullName}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profile
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                      My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-surface-container-highest mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors"
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
              <Link to="/login"    className="btn-ghost text-sm px-4 py-2">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2.5">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-6 py-4 space-y-1">
          <Link to="/"               onClick={() => setMenuOpen(false)} className="mobile-nav-link">Browse Listings</Link>
          {isAuthenticated && (
            <>
              <Link to="/listings/create" onClick={() => setMenuOpen(false)} className="mobile-nav-link">Post a Listing</Link>
              <Link to="/my-listings"     onClick={() => setMenuOpen(false)} className="mobile-nav-link">My Listings</Link>
              <Link to="/bookings"        onClick={() => setMenuOpen(false)} className="mobile-nav-link">My Bookings</Link>
              <Link to="/chat"            onClick={() => setMenuOpen(false)} className="mobile-nav-link">Messages</Link>
              <Link to="/profile"         onClick={() => setMenuOpen(false)} className="mobile-nav-link">Profile</Link>
              <button onClick={handleLogout} className="mobile-nav-link text-error w-full text-left">Sign out</button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="mobile-nav-link">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="mobile-nav-link">Get Started</Link>
            </>
          )}
        </div>
      )}

      {/* Overlay for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
}
