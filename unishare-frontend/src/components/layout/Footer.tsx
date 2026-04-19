import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-container-highest mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold tracking-tighter text-primary font-headline flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_mall</span>
              UniShare
            </Link>
            <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-3">
              The peer-to-peer rental platform built exclusively for Al-Zaytoonah University students.
            </p>
            <p className="text-xs text-primary font-semibold">For ZUJ Students Only</p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-headline font-semibold text-on-surface text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/"               className="hover:text-primary transition-colors">Browse Listings</Link></li>
              <li><Link to="/listings/create" className="hover:text-primary transition-colors">Post a Listing</Link></li>
              <li><Link to="/bookings"        className="hover:text-primary transition-colors">My Bookings</Link></li>
              <li><Link to="/chat"            className="hover:text-primary transition-colors">Messages</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-headline font-semibold text-on-surface text-sm uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/login"    className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
              <li><Link to="/profile"  className="hover:text-primary transition-colors">Profile Settings</Link></li>
            </ul>
          </div>

          {/* Contact ZUJ */}
          <div>
            <h4 className="font-headline font-semibold text-on-surface text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">phone</span>
                <span>+962 6 429 1511</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">mail</span>
                <a href="mailto:pr13@zuj.edu.jo" className="hover:text-primary transition-colors">pr13@zuj.edu.jo</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">location_on</span>
                <span>Queen Alia Airport St 594,<br />Amman, Jordan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">language</span>
                <a href="https://www.zuj.edu.jo" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">zuj.edu.jo</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-container-highest pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm text-on-surface-variant">© {new Date().getFullYear()} UniShare · Al-Zaytoonah University of Jordan</p>
          <p className="text-xs text-on-surface-variant">Built for ZUJ students, by ZUJ students.</p>
        </div>
      </div>
    </footer>
  );
}
