import { useEffect, useState } from 'react';
import { adminApi, type PendingEscrowRow } from '../api/admin';
import { paymentApi } from '../api/payment';
import { ApiError } from '../api/client';

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function EscrowQueue() {
  const [rows, setRows] = useState<PendingEscrowRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    adminApi
      .pendingEscrow()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the escrow queue.'));
  }

  useEffect(load, []);

  async function release(bookingId: string) {
    setBusyId(bookingId);
    setError(null);
    try {
      await paymentApi.release(bookingId);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not release escrow.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Money operations</span>
          <h2>Escrow release</h2>
          <p className="page-lede">Completed outings with funds ready for a controlled release.</p>
        </div>
        <span className="queue-count">{rows.length} awaiting release</span>
      </div>
      {error && <p className="error-text">{error}</p>}
      {rows.length === 0 && <p className="muted">Nothing here.</p>}
      {rows.map((row) => (
        <div className="card review-card payout-card" key={row.bookingId}>
          <div className="card-row">
            <div>
              <strong>{row.packageTitle}</strong>
              <div className="muted">
                {row.customerNickname ?? 'Unknown customer'} → {row.companionNickname ?? 'Unknown companion'} ·{' '}
                {new Date(row.scheduledStart).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{formatRupees(row.amountPaise)}</div>
              <button className="btn btn-primary" disabled={busyId === row.bookingId} onClick={() => void release(row.bookingId)}>
                Release
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
