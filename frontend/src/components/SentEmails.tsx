import React, { useEffect, useState } from 'react';

export const SentEmails: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/emails/sent')
      .then(res => res.json())
      .then(data => {
        setEmails(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (emails.length === 0) return <div>No sent emails.</div>;

  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          <th>Email</th>
          <th>Subject</th>
          <th>Sent Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {emails.map(email => (
          <tr key={email.id}>
            <td>{email.to}</td>
            <td>{email.subject}</td>
            <td>{new Date(email.sentAt).toLocaleString()}</td>
            <td>{email.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
