import { useEffect, useState } from 'react';
import { adminApi, type DeletedAccountRow } from '../api/admin';
import { ApiError } from '../api/client';

export function DeletedAccounts() {
  const [rows, setRows] = useState<DeletedAccountRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .deletedAccounts()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load deleted accounts.'));
  }, []);

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Money &amp; people</span>
          <h2>Deleted accounts</h2>
          <p className="page-lede">
            Accounts their owners deleted from the app. Only the number and its record are kept; if the number signs up
            again, these strikes and any suspension come back.
          </p>
        </div>
        <span className="queue-count">{rows.length} shown</span>
      </div>
      {error && <p className="error-text">{error}</p>}
      {rows.length === 0 && !error && <p className="muted">Nothing here.</p>}
      {rows.map((row) => (
        <div className="card review-card" key={row.userId}>
          <div className="card-row">
            <div>
              <strong>{row.phone}</strong>
              <div className="muted">
                Deleted {new Date(row.deletedAt).toLocaleString()} · user {row.userId}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>
                {row.cancellationStrikes} cancellation · {row.fraudStrikes} fraud strikes
              </div>
              {row.wasSuspended && <div className="error-text">Was suspended</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
