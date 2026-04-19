import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard', icon: 'dashboard'          },
  { to: '/admin/users',    label: 'Users',     icon: 'group'              },
  { to: '/admin/listings', label: 'Listings',  icon: 'storefront'         },
];

export function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 shrink-0 bg-surface-container-lowest border-r border-surface-container-highest min-h-full flex flex-col">
      <div className="p-6 border-b border-surface-container-highest">
        <div className="flex items-center gap-2 text-secondary">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <span className="font-headline font-bold text-lg">Admin Panel</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">UniShare Management</p>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label font-medium text-sm transition-all
                ${isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-container-highest">
        <Link to="/" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors px-2">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Platform
        </Link>
      </div>
    </aside>
  );
}
