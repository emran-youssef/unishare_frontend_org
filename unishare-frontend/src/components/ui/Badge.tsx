import { BOOKING_STATUS_STYLES, LISTING_STATUS_STYLES } from '../../utils/formatters';
import type { BookingStatus, ListingStatus } from '../../types/api.types';

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, className } = BOOKING_STATUS_STYLES[status] ?? { label: status, className: '' };
  return <Badge label={label} className={className} />;
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const { label, className } = LISTING_STATUS_STYLES[status] ?? { label: status, className: '' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
      ${isAdmin ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface'}`}>
      {isAdmin && <span className="material-symbols-outlined text-[12px]">admin_panel_settings</span>}
      {role}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
      <span className="material-symbols-outlined text-[12px]">verified</span>
      Verified .edu
    </span>
  );
}
