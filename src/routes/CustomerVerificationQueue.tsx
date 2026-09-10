import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  customerVerificationApi,
  type CustomerVerificationRequestView,
  type CustomerVerificationStatus,
} from '../api/customer-verification';
import { ApiError } from '../api/client';
import { ZoomableDocImage } from '../components/ZoomableDocImage';

const STATUSES: CustomerVerificationStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export function CustomerVerificationQueue() {
  const [status, setStatus] = useState<CustomerVerificationStatus>('PENDING');
  const [requests, setRequests] = useState<CustomerVerificationRequestView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load() {
    customerVerificationApi
      .list(status)
      .then(setRequests)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load verification requests.'));
  }

  useEffect(load, [status]);

  async function decide(id: string, decision: 'APPROVED' | 'REJECTED') {
    setBusyId(id);
    setError(null);
    try {
      await customerVerificationApi.decide(id, decision, notes[id]?.trim() || undefined);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the decision.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2>Booker verification requests</h2>
      <div className="field" style={{ maxWidth: 200 }}>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as CustomerVerificationStatus)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error-text">{error}</p>}
      {requests.length === 0 && <p className="muted">Nothing here.</p>}
      {requests.map((req) => (
        <div className="card" key={req.id}>
          <div className="card-row">
            <div>
              <strong>{req.customer.nickname ?? 'Unnamed'}</strong>{' '}
              <Link className="muted" to={`/users?id=${req.customerId}`}>
                View user
              </Link>
              <div className="muted">
                {req.customer.city ?? 'Unknown city'} · {req.customer.phone}
              </div>
            </div>
            <span className={`pill pill-${req.status === 'PENDING' ? 'pending' : req.status === 'APPROVED' ? 'positive' : 'negative'}`}>
              {req.status}
            </span>
          </div>
          <div className="compare-grid" style={{ marginTop: 12 }}>
            <div>
              <p className="muted" style={{ marginBottom: 4 }}>
                Profile photo
              </p>
              {req.customer.photoUrl ? (
                <ZoomableDocImage src={req.customer.photoUrl} alt="Customer profile" />
              ) : (
                <div className="doc-image doc-image-empty">No photo yet</div>
              )}
            </div>
            <div>
              <p className="muted" style={{ marginBottom: 4 }}>
                Live selfie
              </p>
              <ZoomableDocImage src={req.selfieUrl} alt="Live selfie" />
            </div>
          </div>
          {req.status === 'PENDING' && (
            <div style={{ marginTop: 12 }}>
              <div className="field">
                <label htmlFor={`note-${req.id}`}>Note (shown to the booker on rejection)</label>
                <textarea
                  id={`note-${req.id}`}
                  rows={2}
                  value={notes[req.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" disabled={busyId === req.id} onClick={() => void decide(req.id, 'APPROVED')}>
                Approve
              </button>{' '}
              <button
                className="btn btn-danger"
                disabled={busyId === req.id || !notes[req.id]?.trim()}
                onClick={() => void decide(req.id, 'REJECTED')}
              >
                Reject
              </button>
            </div>
          )}
          {req.note && (
            <p className="muted" style={{ marginTop: 8 }}>
              Note: {req.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
