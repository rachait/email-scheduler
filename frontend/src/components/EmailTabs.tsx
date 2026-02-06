import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2 } from 'lucide-react';

interface Email {
  id: number;
  to: string;
  subject: string;
  body: string;
  sender: string;
  scheduledAt?: string;
  sentAt?: string;
  status: string;
  error?: string;
}

interface EmailTabsProps {
  tab: 'scheduled' | 'sent';
  authToken: string;
  refreshTrigger: number;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const EmailTabs: React.FC<EmailTabsProps> = ({ tab, authToken, refreshTrigger }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, refreshTrigger]);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = tab === 'scheduled' ? '/emails/scheduled' : '/emails/sent';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch emails');
      }
    } catch (err) {
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEmail = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/emails/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        setEmails(emails.filter(e => e.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel email');
      }
    } catch (err) {
      setError('Failed to cancel email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-xl font-semibold text-gray-900 mb-2">
          {tab === 'scheduled' ? 'No scheduled emails' : 'No sent emails'}
        </p>
        <p className="text-gray-600">
          {tab === 'scheduled'
            ? 'Create a new email to get started'
            : 'Emails you send will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">To</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">From</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              {tab === 'scheduled' ? 'Scheduled' : 'Sent'}
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            {tab === 'scheduled' && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {emails.map((email) => (
            <tr key={email.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{email.to}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{email.sender}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {tab === 'scheduled'
                  ? new Date(email.scheduledAt!).toLocaleString()
                  : new Date(email.sentAt!).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    email.status === 'sent' || email.status === 'scheduled'
                      ? 'bg-green-100 text-green-700'
                      : email.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {email.status}
                </span>
              </td>
              {tab === 'scheduled' && (
                <td className="px-6 py-4 text-sm">
                  {email.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancelEmail(email.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Cancel email"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailTabs;
