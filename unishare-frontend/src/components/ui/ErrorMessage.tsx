import type { ApiError } from '../../types/api.types';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
}

function getErrorMessage(error: unknown): string {
  const apiErr = error as { data?: ApiError; status?: number };
  if (apiErr?.data?.message) return apiErr.data.message;
  if (apiErr?.status === 404) return 'Resource not found.';
  if (apiErr?.status === 403) return 'You do not have permission to view this.';
  if (apiErr?.status === 500) return 'A server error occurred. Please try again later.';
  return 'Something went wrong. Please try again.';
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-error-container/30 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-error">error_outline</span>
      </div>
      <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Something went wrong</h3>
      <p className="text-on-surface-variant text-sm max-w-sm">{getErrorMessage(error)}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-surface text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Try again
        </button>
      )}
    </div>
  );
}

// Inline field error for forms
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-error text-xs mt-1.5 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {message}
    </p>
  );
}
