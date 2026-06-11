import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster, ToastBar, resolveValue, toast } from 'react-hot-toast';
import { store } from './app/store';
import { AppRouter } from './router/AppRouter';
import './index.css';

function AppToast({ currentToast }: { currentToast: Parameters<NonNullable<React.ComponentProps<typeof Toaster>['children']>>[0] }) {
  const isError = currentToast.type === 'error';
  const isSuccess = currentToast.type === 'success';
  const icon = isError ? 'error' : isSuccess ? 'check_circle' : 'info';
  const title = isError ? 'Action needed' : isSuccess ? 'Success' : 'Message';
  const iconTone = isError
    ? 'bg-error-container text-error'
    : isSuccess
      ? 'bg-primary-container text-primary'
      : 'bg-surface-container text-primary';

  return (
    <ToastBar
      toast={currentToast}
      style={{
        background: 'transparent',
        boxShadow: 'none',
        color: 'inherit',
        maxWidth: 'min(28rem, calc(100vw - 2rem))',
        padding: 0,
        width: '100%',
      }}
    >
      {() => (
        <>
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" />
          <div className="relative w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-card-lg">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
                <span className="material-symbols-outlined text-[26px]">{icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-headline text-2xl font-bold text-on-surface">{title}</h2>
                <div className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {resolveValue(currentToast.message, currentToast)}
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => toast.dismiss(currentToast.id)}
                className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </>
      )}
    </ToastBar>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
      <Toaster
        position="top-center"
        containerStyle={{
          left: '1rem',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      >
        {(currentToast) => <AppToast currentToast={currentToast} />}
      </Toaster>
    </Provider>
  </React.StrictMode>,
);
