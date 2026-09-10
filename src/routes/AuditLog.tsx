import { useEffect, useState } from 'react';
import { adminApi, type AuditLogEntry } from '../api/admin';
import { ApiError } from '../api/client';

export function AuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .auditLogs(100)
      .then(setEntries)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the audit log.'));
  }, []);

  return (
    <div>
      <h2>Audit log</h2>
      {error && <p className="error-text">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Action</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.createdAt).toLocaleString()}</td>
              <td>{entry.action}</td>
              <td>
                {entry.targetType} {entry.targetId}
              </td>
              <td>{entry.reason ?? '—'}</td>
              <td>{entry.actorId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
