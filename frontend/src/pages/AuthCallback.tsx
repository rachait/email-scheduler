import React, { useEffect } from 'react';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Parse token from URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('access_token');
    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('google_token', token);
      window.location.href = '/dashboard';
    }
  }, []);

  return <div>Authenticating...</div>;
};
