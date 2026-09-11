import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { payoutApi, type PayoutStatus, type PayoutView } from '../api/payout';
import { ApiError } from '../api/client';

const STATUSES: PayoutStatus[] = ['PENDING', 'PAID', 'REJECTED'];

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function Payouts() {
  const [status, setStatus] = useState<PayoutStatus>('PENDING');
  const [rows, setRows] = useState<PayoutView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load() {
    payoutApi
      .list(status)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load withdrawal requests.'));
  }

  useEffect(load, [status]);

  async function process(id: string, decision: 'PAID' | 'REJECTED') {
    setBusyId(id);
    setError(null);
    try {
      await payoutApi.process(id, decision, notes[id]?.trim() || undefined);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the decision.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Money operations</span>
          <h2>Companion withdrawals</h2>
          <p className="page-lede">
        Manual UPI payouts — send the amount to the UPI ID shown, then mark it paid here. No payout API is called.
          </p>
        </div>
      </div>
      <div className="queue-toolbar">
      <div className="field" style={{ maxWidth: 200 }}>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PayoutStatus)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {rows.length === 0 && <p className="muted">Nothing here.</p>}
      {rows.map((row) => (
        <div className="card review-card payout-card" key={row.id}>
          <div className="card-row">
            <div>
              <strong>{row.companion.nickname ?? 'Unnamed'}</strong>{' '}
              <Link className="muted" to={`/users?id=${row.companionId}`}>
                View user
              </Link>
              <div className="muted">
                {row.companion.city ?? 'Unknown city'} · {row.companion.phone}
              </div>
              <div>
                UPI ID: <strong>{row.upiId}</strong>
              </div>
              <div className="muted">Requested {new Date(row.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div>{formatRupees(row.amountPaise)}</div>
              <span
                className={`pill pill-${row.status === 'PENDING' ? 'pending' : row.status === 'PAID' ? 'positive' : 'negative'}`}
              >
                {row.status}
              </span>
            </div>
          </div>
          {row.status === 'PENDING' && (
            <div className="decision-bar">
              <div className="field">
                <label htmlFor={`note-${row.id}`}>Note (e.g. UTR reference, or reason for rejecting)</label>
                <textarea
                  id={`note-${row.id}`}
                  rows={2}
                  value={notes[row.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" disabled={busyId === row.id} onClick={() => void process(row.id, 'PAID')}>
                Mark paid
              </button>{' '}
              <button className="btn btn-danger" disabled={busyId === row.id} onClick={() => void process(row.id, 'REJECTED')}>
                Reject
              </button>
            </div>
          )}
          {row.note && (
            <p className="muted" style={{ marginTop: 8 }}>
              Note: {row.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
