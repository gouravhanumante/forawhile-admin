import { useEffect, useState } from 'react';
import { adminApi, type StuckRefundRow } from '../api/admin';
import { ApiError } from '../api/client';

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function StuckRefunds() {
  const [rows, setRows] = useState<StuckRefundRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  function load() {
    adminApi
      .stuckRefunds()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the refund queue.'));
  }

  useEffect(load, []);

  async function resolve(bookingId: string) {
    setError(null);
    try {
      await adminApi.resolveStuckRefund(bookingId, note.trim() || undefined);
      setResolvingId(null);
      setNote('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resolve this refund.');
    }
  }

  return (
    <div>
      <h2>Refunds needing attention</h2>
      <p className="muted">
        "Needs action" means our automatic refund call to Razorpay failed — check the Razorpay dashboard first;
        only click "Mark as refunded" once you've confirmed the money has actually been sent back (or sent it
        yourself). This never calls Razorpay again, so it can't double-refund.
      </p>
      {error && <p className="error-text">{error}</p>}
      {rows.length === 0 && <p className="muted">Nothing here.</p>}
      {rows.map((row) => (
        <div className="card" key={row.paymentId}>
          <div className="card-row">
            <div>
              <strong>{row.packageTitle}</strong>
              <div className="muted">
                {row.customerNickname ?? 'Unknown customer'} ({row.customerPhone}) ·{' '}
                {row.companionNickname ?? 'Unknown companion'} ({row.companionPhone})
              </div>
              <div className="muted">
                {new Date(row.scheduledStart).toLocaleString()} · booking {row.bookingStatus.toLowerCase()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{formatRupees(row.amountPaise)}</div>
              <span className={`pill pill-${row.state === 'NEEDS_ACTION' ? 'negative' : 'pending'}`}>
                {row.state === 'NEEDS_ACTION' ? 'Needs action' : 'Awaiting bank confirmation'}
              </span>
            </div>
          </div>
          {row.state === 'NEEDS_ACTION' && (
            <div style={{ marginTop: 12 }}>
              {resolvingId === row.bookingId ? (
                <div className="field">
                  <label htmlFor={`note-${row.bookingId}`}>Note (optional — e.g. Razorpay refund id)</label>
                  <input id={`note-${row.bookingId}`} value={note} onChange={(e) => setNote(e.target.value)} />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => void resolve(row.bookingId)}>
                      Confirm — mark as refunded
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setResolvingId(null); setNote(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-danger" onClick={() => setResolvingId(row.bookingId)}>
                  Mark as refunded
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
