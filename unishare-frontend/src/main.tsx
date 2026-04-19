import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { AppRouter } from './router/AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1c1b1b',
            border: '1px solid #dbc0bf',
            borderRadius: '0.75rem',
            fontFamily: '"Inter", sans-serif',
            fontSize: '14px',
            boxShadow: '0 8px 30px rgba(155, 66, 67, 0.08)',
          },
          success: {
            iconTheme: { primary: '#006c4b', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
          },
        }}
      />
    </Provider>
  </React.StrictMode>,
);
