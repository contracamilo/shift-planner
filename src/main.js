import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import './index.css';
async function enableMocking() {
    if (import.meta.env.MODE !== 'development')
        return;
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
}
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 5_000, retry: 0 },
    },
});
enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(App, {}) }) }));
});
