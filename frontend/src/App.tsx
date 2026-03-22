import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Dashboard from './pages/Dashboard';
import './App.css';

interface User {
  id: number;
  email: string;
  name?: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setError(null);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleGoogleError = () => {
    const origin = window.location.origin;
    setError(
      `Google sign-in failed (possible origin_mismatch). Add ${origin} to Authorized JavaScript origins in Google Cloud Console.`
    );
  };

  const handleSimpleLogin = async (email: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name || email.split('@')[0],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    const hasGoogleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
      process.env.REACT_APP_GOOGLE_CLIENT_ID.length > 0;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">ReachBox</h1>
          <p className="text-gray-600 text-center mb-8">AI-Powered Email Scheduler</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Google OAuth Section */}
          {hasGoogleClientId ? (
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleError}
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Google OAuth Not Configured</p>
                <p className="text-xs text-yellow-700 mb-2">
                  To use Google login, add your Client ID to <code className="bg-yellow-100 px-1 rounded">.env.local</code>
                </p>
                <p className="text-xs text-yellow-700">
                  Get it from: <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a>
                </p>
              </div>
              
              {/* Simple Email Login for Testing */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const email = formData.get('email') as string;
                const name = formData.get('name') as string;
                handleSimpleLogin(email, name);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Login for Testing
                </button>
              </form>
            </div>
          )}

          <p className="text-gray-500 text-xs text-center mt-6">
            {hasGoogleClientId 
              ? 'Sign in with your Google account to schedule and manage emails'
              : 'Use test login to access the dashboard'}
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
