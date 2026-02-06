import React, { useState } from 'react';
import { Upload, AlertCircle, Loader } from 'lucide-react';
import Papa from 'papaparse';

interface ComposeEmailProps {
  onSuccess: () => void;
  onCancel: () => void;
  authToken: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const ComposeEmail: React.FC<ComposeEmailProps> = ({ onSuccess, onCancel, authToken }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sender, setSender] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [delayBetween, setDelayBetween] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const emails: string[] = [];
        (results.data as any[]).forEach((row: any) => {
          const email =
            typeof row === 'string' ? row.trim() : (row[0] as string)?.trim?.();
          if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emails.push(email);
          }
        });
        setRecipients(emails);
        setError(null);
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`);
        setCsvFile(null);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !body.trim() || !sender.trim() || !scheduledAt) {
      setError('Please fill in all required fields');
      return;
    }

    if (recipients.length === 0) {
      setError('Please upload a CSV with at least one email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/emails/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          recipients,
          subject,
          body,
          sender,
          scheduledAt: new Date(scheduledAt).toISOString(),
          delayBetween,
        }),
      });

      if (response.ok) {
        setSubject('');
        setBody('');
        setSender('');
        setScheduledAt('');
        setDelayBetween(0);
        setRecipients([]);
        setCsvFile(null);
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to schedule emails');
      }
    } catch (err) {
      setError('Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Sender Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          placeholder="sender@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Email Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Email Body <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter email body"
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Upload Recipients (CSV) <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-600 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleCsvUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="font-semibold text-gray-900 mb-1">Drop CSV file here or click to upload</p>
          <p className="text-sm text-gray-600">One email per line or column</p>
          {csvFile && (
            <p className="text-sm text-green-600 mt-2 font-semibold">
              ✓ {csvFile.name} ({recipients.length} emails)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Start Sending At <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Delay Between Emails (ms)
          </label>
          <input
            type="number"
            min="0"
            value={delayBetween}
            onChange={(e) => setDelayBetween(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <p className="text-xs text-gray-600 mt-1">
            Adds extra delay between individual emails (in addition to system delays)
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? 'Scheduling...' : 'Schedule Emails'}
        </button>
      </div>
    </form>
  );
};

export default ComposeEmail;
