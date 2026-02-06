import React from 'react';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${window.location.origin}/auth/callback&response_type=token&scope=email profile`;
  };

  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
      Sign in with Google
    </button>
  );
};
