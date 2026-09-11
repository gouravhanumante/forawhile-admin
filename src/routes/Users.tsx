import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi, type AdminBookingSummary, type BookingInvestigation, type SafeUser } from '../api/admin';
import { ApiError } from '../api/client';
import { BookingInvestigationPanel } from '../components/BookingInvestigationPanel';

export function Users() {
  const [searchParams] = useSearchParams();
  const [id, setId] = useState(searchParams.get('id') ?? '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SafeUser[] | null>(null);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [bookings, setBookings] = useState<AdminBookingSummary[]>([]);
  const [investigation, setInvestigation] = useState<BookingInvestigation | null>(null);

  async function lookup(targetId: string) {
    if (!targetId.trim()) return;
    setError(null);
    setUser(null);
    try {
      const loadedUser = await adminApi.getUser(targetId.trim());
      setUser(loadedUser);
      // Outings are supplementary: an API that cannot serve them yet must not break the lookup.
      try {
        setBookings(await adminApi.userBookings(loadedUser.id));
      } catch {
        setBookings([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not find that user.');
    }
  }

  async function search() {
    if (query.trim().length < 2) return;
    setError(null);
    setResults(null);
    try {
      setResults(await adminApi.searchUsers(query.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed.');
    }
  }

  useEffect(() => {
    if (searchParams.get('id')) void lookup(searchParams.get('id')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSuspend() {
    if (!user || !reason.trim()) return;
    setIsBusy(true);
    setError(null);
    try {
      const updated =
        user.status === 'SUSPENDED'
          ? await adminApi.unsuspend(user.id, reason.trim())
          : await adminApi.suspend(user.id, reason.trim());
      setUser(updated);
      setReason('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the account.');
    } finally {
      setIsBusy(false);
    }
  }

  async function openInvestigation(bookingId: string) {
    setError(null);
    try { setInvestigation(await adminApi.bookingInvestigation(bookingId)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not load outing evidence.'); }
  }

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Investigation workspace</span>
          <h2>Users</h2>
          <p className="page-lede">Search for an account, then review identity, risk, and outing history.</p>
        </div>
      </div>
      <div className="search-panel">
      <div className="field" style={{ maxWidth: 360 }}>
        <label htmlFor="query">Search by phone, nickname, or email</label>
        <input
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void search()}
          placeholder="e.g. +9190... or Priya"
        />
      </div>
      <button className="btn btn-secondary" disabled={query.trim().length < 2} onClick={() => void search()}>
        Search
      </button>
      </div>

      {results && results.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No matches.</p>}
      {results && results.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {results.map((row) => (
            <div
              className="card search-result"
              key={row.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                void lookup(row.id);
                setResults(null);
              }}
            >
              <strong>{row.companionProfile?.nickname ?? row.customerProfile?.nickname ?? 'Unnamed'}</strong>
              <div className="muted">
                {row.phone} · {row.roles.join(', ')} · {row.status}
              </div>
            </div>
          ))}
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary className="muted">Look up by exact user id instead</summary>
        <div className="field" style={{ maxWidth: 360, marginTop: 8 }}>
          <label htmlFor="userId">User id</label>
          <input id="userId" value={id} onChange={(e) => setId(e.target.value)} placeholder="paste a user id" />
        </div>
        <button className="btn btn-secondary" onClick={() => void lookup(id)}>
          Look up
        </button>
      </details>

      {error && <p className="error-text">{error}</p>}

      {user && (
        <div className="card profile-card" style={{ marginTop: 16 }}>
          <div className="card-row">
            <div>
              <strong>{user.companionProfile?.nickname ?? user.customerProfile?.nickname ?? 'Unnamed'}</strong>
              <div className="muted">
                {user.phone} · {user.roles.join(', ')}
              </div>
            </div>
            <span className={`pill pill-${user.status === 'ACTIVE' ? 'positive' : user.status === 'SUSPENDED' ? 'negative' : 'pending'}`}>
              {user.status}
            </span>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {user.reportCount} report(s) · {user.blockCount} block(s)
            {user.companionProfile && ` · verified: ${user.companionProfile.isVerified} · live: ${user.companionProfile.isLive}`}
          </p>
          {user.photos.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {user.photos.map((photo) => (
                <a href={photo.url} target="_blank" rel="noreferrer" key={photo.id}>
                  <img
                    src={photo.url}
                    alt=""
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: photo.isPrimary ? '2px solid var(--accent, #6750a4)' : '1px solid #ccc',
                    }}
                  />
                </a>
              ))}
            </div>
          )}
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="reason">Reason (required)</label>
            <input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <button
            className={`btn ${user.status === 'SUSPENDED' ? 'btn-primary' : 'btn-danger'}`}
            disabled={isBusy || !reason.trim()}
            onClick={() => void toggleSuspend()}
          >
            {user.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
          </button>
          <h3 style={{ marginTop: 20 }}>Outings</h3>
          {bookings.length === 0 ? <p className="muted">No outings found.</p> : bookings.map((booking) => <div className="card" key={booking.id} style={{ marginTop: 8 }}>
            <strong>{booking.packageTitle}</strong><div className="muted">{new Date(booking.scheduledStart).toLocaleString()} · {booking.status.replaceAll('_', ' ')} · {booking.meetingArea}</div>
            <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => void openInvestigation(booking.id)}>View outing</button>
          </div>)}
          {investigation && <BookingInvestigationPanel evidence={investigation} />}
        </div>
      )}
    </div>
  );
}
