import { useEffect, useState } from 'react';
import { adminApi, type PendingNoShowClaim } from '../api/admin';
import { ApiError } from '../api/client';
import { BookingInvestigationPanel } from '../components/BookingInvestigationPanel';
import type { BookingInvestigation } from '../api/admin';

export function NoShowClaims() {
  const [claims, setClaims] = useState<PendingNoShowClaim[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<BookingInvestigation | null>(null);
  const load = () => adminApi.pendingNoShowClaims().then(setClaims).catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load no-show claims.'));
  useEffect(() => { void load(); }, []);

  async function decide(claim: PendingNoShowClaim, decision: 'CONFIRMED' | 'DISMISSED') {
    const reviewNote = notes[claim.bookingId]?.trim();
    if (!reviewNote) return;
    setBusyId(claim.bookingId);
    setError(null);
    try {
      await adminApi.decideNoShowClaim(claim.bookingId, decision, reviewNote);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not decide this claim.');
    } finally { setBusyId(null); }
  }

  async function viewEvidence(bookingId: string) {
    setError(null);
    try { setInvestigation(await adminApi.bookingInvestigation(bookingId)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not load outing evidence.'); }
  }

  return <div>
    <h2>No-show Review</h2>
    {error && <p className="error-text">{error}</p>}
    {claims.length === 0 && <p className="muted">No pending no-show claims.</p>}
    {claims.map((claim) => <div className="card" key={claim.bookingId}>
      <strong>{claim.booking.customer.customerProfile?.nickname ?? 'Customer'} and {claim.booking.companion.companionProfile?.nickname ?? 'Companion'}</strong>
      <p className="muted">{new Date(claim.booking.scheduledStart).toLocaleString()} · {claim.booking.packageTitle} · {claim.booking.meetingArea}</p>
      <p>Claim: {claim.reason ?? 'No reason supplied'}</p>
      <p className="muted">Location: {claim.locationStatus}{claim.latitude !== null && claim.longitude !== null ? ` · ${claim.latitude.toFixed(3)}, ${claim.longitude.toFixed(3)}` : ''}{claim.accuracyMeters !== null ? ` · accuracy ${Math.round(claim.accuracyMeters)}m` : ''}</p>
      <button className="btn btn-secondary" onClick={() => void viewEvidence(claim.bookingId)}>View outing evidence</button>
      <div className="field"><label htmlFor={`note-${claim.bookingId}`}>Decision note</label><textarea id={`note-${claim.bookingId}`} value={notes[claim.bookingId] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [claim.bookingId]: event.target.value }))} /></div>
      <button className="btn btn-primary" disabled={busyId === claim.bookingId || !notes[claim.bookingId]?.trim()} onClick={() => void decide(claim, 'CONFIRMED')}>Confirm no-show</button>
      <button className="btn btn-secondary" disabled={busyId === claim.bookingId || !notes[claim.bookingId]?.trim()} onClick={() => void decide(claim, 'DISMISSED')} style={{ marginLeft: 8 }}>Dismiss claim</button>
    </div>)}
    {investigation && <BookingInvestigationPanel evidence={investigation} />}
  </div>;
}