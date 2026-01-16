import { useMemo } from 'react';

// FIXME: This should be replaced by only one environment variable
export const useBackendServerUrl = () => {
  // Get the backend server URL. This is a bit involved to support different deployment methods.
  const backendServerUrl = useMemo(() => {
    const isInDocker = window.location.port !== '3000';

    // For local development, you can set this environment variable or modify the URL directly
    const customBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!isInDocker && customBackendUrl) {
      // Use custom backend URL for local development
      return customBackendUrl.replace(/\/$/, '');
    }

    const prefix = isInDocker ? '/api' : '';

    const url = new URL(prefix, window.location.href);
    url.protocol = url.protocol === 'http:' ? 'ws' : 'wss';
    if (!isInDocker) {
      url.port = '8000';
    }

    const backendUrl = new URL('', window.location.href);
    if (!isInDocker) {
      backendUrl.port = '8000';
    }
    backendUrl.pathname = prefix;
    backendUrl.search = ''; // strip any query parameters
    return backendUrl.toString().replace(/\/$/, ''); // remove trailing slash
  }, []);

  return backendServerUrl;
};
