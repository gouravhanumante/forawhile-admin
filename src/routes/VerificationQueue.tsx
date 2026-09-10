import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { verificationApi, type VerificationRequestView, type VerificationStatus } from '../api/verification';
import { ApiError } from '../api/client';
import { ZoomableDocImage } from '../components/ZoomableDocImage';

const STATUSES: VerificationStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

export function VerificationQueue() {
  const [status, setStatus] = useState<VerificationStatus>('PENDING');
  const [requests, setRequests] = useState<VerificationRequestView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load() {
    verificationApi
      .list(status)
      .then(setRequests)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load verification requests.'));
  }

  useEffect(load, [status]);

  async function decide(id: string, decision: 'APPROVED' | 'REJECTED') {
    setBusyId(id);
    setError(null);
    try {
      await verificationApi.decide(id, decision, notes[id]?.trim() || undefined);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the decision.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2>Verification requests</h2>
      <div className="field" style={{ maxWidth: 200 }}>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as VerificationStatus)}>
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
              <strong>{req.companion.nickname ?? 'Unnamed'}</strong>{' '}
              <Link className="muted" to={`/users?id=${req.companionId}`}>
                View user
              </Link>
              <div className="muted">
                {req.companion.city ?? 'Unknown city'} · {req.companion.phone} · {req.docType}
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
              {req.companion.photoUrl ? (
                <ZoomableDocImage src={req.companion.photoUrl} alt="Companion profile" />
              ) : (
                <div className="doc-image doc-image-empty">No photo yet</div>
              )}
            </div>
            <div>
              <p className="muted" style={{ marginBottom: 4 }}>
                {req.selfieUrl ? 'Live selfie' : 'Selfie'}
              </p>
              {req.selfieUrl ? (
                <ZoomableDocImage src={req.selfieUrl} alt="Live selfie" />
              ) : (
                <div className="doc-image doc-image-empty">Not submitted yet</div>
              )}
            </div>
            <div>
              <p className="muted" style={{ marginBottom: 4 }}>
                ID document ({req.docType})
              </p>
              {req.docUrl ? <ZoomableDocImage src={req.docUrl} alt="ID document" /> : <div className="doc-image doc-image-empty">Document unavailable</div>}
            </div>
          </div>
          {req.status === 'PENDING' && (
            <div style={{ marginTop: 12 }}>
              <div className="field">
                <label htmlFor={`note-${req.id}`}>Note (shown to the companion on rejection)</label>
                <textarea
                  id={`note-${req.id}`}
                  rows={2}
                  value={notes[req.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                />
              </div>
              <button className="btn btn-primary" disabled={busyId === req.id || !req.docUrl} onClick={() => void decide(req.id, 'APPROVED')}>
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
