import React, { useState } from 'react';
import { Mail, Send, Clock, CheckCircle, X } from 'lucide-react';
import EmailTabs from '../components/EmailTabs';
import ComposeEmail from '../components/ComposeEmail';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [showCompose, setShowCompose] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getAuthToken = () => localStorage.getItem('auth_token') || '';

  const handleComposeSuccess = () => {
    setShowCompose(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ReachBox</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.name || user.email}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Compose Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Send size={20} />
            Compose New Email
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'scheduled'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Clock className="inline mr-2" size={20} />
              Scheduled Emails
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'sent'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="inline mr-2" size={20} />
              Sent Emails
            </button>
          </div>

          <div className="p-6">
            <EmailTabs
              tab={activeTab}
              authToken={getAuthToken()}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Compose Email</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <ComposeEmail
                onSuccess={handleComposeSuccess}
                onCancel={() => setShowCompose(false)}
                authToken={getAuthToken()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
