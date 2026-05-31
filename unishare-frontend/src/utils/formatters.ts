// Date formatting
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

// Currency formatting — Jordanian Dinar (JD)
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} JD`;
}


// Calculate number of rental days
export function calcRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Calculate total price
export function calcTotalPrice(pricePerDay: number, startDate: string, endDate: string): number {
  return pricePerDay * calcRentalDays(startDate, endDate);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

// Resolve image URL — prepend backend base URL for server-uploaded paths
const API_BASE = 'http://localhost:8080';
export function getImageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('/uploads/')) return `${API_BASE}${path}`;
  return path;
}

// Get initials from full name
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Listing category display labels
export const CATEGORY_LABELS: Record<string, string> = {
  TEXTBOOKS:   'Textbooks',
  ELECTRONICS: 'Electronics',
  FURNITURE:   'Furniture',
  CLOTHING:    'Clothing',
  OTHER:       'Other',
};

// Item condition display labels
export const CONDITION_LABELS: Record<string, string> = {
  NEW:       'New',
  LIKE_NEW:  'Like New',
  GOOD:      'Good',
  FAIR:      'Fair',
};

// Booking status display labels & colors
export const BOOKING_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Pending',   className: 'bg-surface-dim text-on-surface-variant' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-secondary-fixed-dim/30 text-secondary' },
  COMPLETED: { label: 'Completed', className: 'bg-tertiary-fixed-dim/20 text-tertiary' },
  CANCELLED: { label: 'Cancelled', className: 'bg-error-container/50 text-error' },
};

// Listing status styles
export const LISTING_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Available', className: 'bg-tertiary-container/10 text-tertiary' },
  RENTED:    { label: 'Rented',    className: 'bg-secondary-fixed-dim/30 text-secondary' },
  INACTIVE:  { label: 'Inactive',  className: 'bg-surface-dim text-on-surface-variant' },
};
