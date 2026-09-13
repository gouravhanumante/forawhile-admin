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

  async function decide(claim: PendingNoShowClaim, decision: 'CONFIRMED' | 'DISMISSED' | 'REPORTER_ABSENT') {
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

  function nameOf(claim: PendingNoShowClaim, userId: string) {
    const customer = claim.booking.customer.customerProfile?.nickname ?? 'Customer';
    const companion = claim.booking.companion.companionProfile?.nickname ?? 'Companion';
    return userId === claim.booking.customerId ? customer : companion;
  }

  function fix(status: string | null, latitude: number | null, longitude: number | null, accuracy: number | null) {
    if (status === null) return 'none';
    const point = latitude !== null && longitude !== null ? ` · ${latitude.toFixed(3)}, ${longitude.toFixed(3)}` : '';
    return `${status}${point}${accuracy !== null ? ` · accuracy ${Math.round(accuracy)}m` : ''}`;
  }

  return <div>
    <h2>No-show Review</h2>
    {error && <p className="error-text">{error}</p>}
    {claims.length === 0 && <p className="muted">No pending no-show claims.</p>}
    {claims.map((claim) => <div className="card" key={claim.bookingId}>
      <strong>{claim.booking.customer.customerProfile?.nickname ?? 'Customer'} and {claim.booking.companion.companionProfile?.nickname ?? 'Companion'}</strong>
      <p className="muted">{new Date(claim.booking.scheduledStart).toLocaleString()} · {claim.booking.packageTitle} · {claim.booking.meetingArea}</p>

      <p><strong>{nameOf(claim, claim.reporterId)} says:</strong> {claim.reason ?? 'No reason supplied'}</p>
      {claim.reporter.fraudStrikes > 0 && <p className="error-text">
        {nameOf(claim, claim.reporterId)} has been found to have filed dishonestly {claim.reporter.fraudStrikes} time(s) before.
      </p>}
      <p className="muted">Their location: {fix(claim.locationStatus, claim.latitude, claim.longitude, claim.accuracyMeters)}</p>

      {claim.respondedAt
        ? <>
            <p><strong>{nameOf(claim, claim.accusedId)} answers:</strong> {claim.responseText ?? 'No reason supplied'}</p>
            <p className="muted">Their location: {fix(claim.responseLocationStatus, claim.responseLatitude, claim.responseLongitude, claim.responseAccuracyMeters)}</p>
          </>
        // Deciding before the accused has answered is allowed, but it should never happen by
        // accident, so it is said plainly rather than left to be inferred from a blank space.
        : <p className="error-text">{nameOf(claim, claim.accusedId)} has not answered yet.</p>}

      <p className="muted">
        Evidence leans {claim.claimStrength > 50 ? 'towards the claim' : claim.claimStrength < 50 ? 'towards the reply' : 'neither way'} ({claim.claimStrength}/100) —
        advisory only, read the signals below before deciding.
      </p>
      <ul>
        {claim.signals.map((signal) => <li key={signal.text} className={signal.leans === 'NEITHER' ? 'muted' : undefined}>{signal.text}</li>)}
      </ul>

      {claim.booking.checkIns.length > 0 && <p className="muted">
        Check-ins: {claim.booking.checkIns.map((checkIn) => `${nameOf(claim, checkIn.userId)} at ${new Date(checkIn.createdAt).toLocaleTimeString()} (${checkIn.latitude.toFixed(3)}, ${checkIn.longitude.toFixed(3)})`).join(' · ')}
      </p>}
      {claim.booking.messages.length > 0 && <details>
        <summary>Coordination thread ({claim.booking.messages.length})</summary>
        <ul>{claim.booking.messages.map((message) => <li key={message.createdAt} className="muted">{new Date(message.createdAt).toLocaleTimeString()} {nameOf(claim, message.senderId)}: {message.text}</li>)}</ul>
      </details>}

      <button className="btn btn-secondary" onClick={() => void viewEvidence(claim.bookingId)}>View outing evidence</button>
      <div className="field"><label htmlFor={`note-${claim.bookingId}`}>Decision note</label><textarea id={`note-${claim.bookingId}`} value={notes[claim.bookingId] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [claim.bookingId]: event.target.value }))} /></div>
      <button className="btn btn-primary" disabled={busyId === claim.bookingId || !notes[claim.bookingId]?.trim()} onClick={() => void decide(claim, 'CONFIRMED')}>Confirm — {nameOf(claim, claim.accusedId)} was absent</button>
      <button className="btn btn-secondary" disabled={busyId === claim.bookingId || !notes[claim.bookingId]?.trim()} onClick={() => void decide(claim, 'REPORTER_ABSENT')} style={{ marginLeft: 8 }}>Reverse — {nameOf(claim, claim.reporterId)} was absent</button>
      <button className="btn btn-secondary" disabled={busyId === claim.bookingId || !notes[claim.bookingId]?.trim()} onClick={() => void decide(claim, 'DISMISSED')} style={{ marginLeft: 8 }}>Dismiss claim</button>
    </div>)}
    {investigation && <BookingInvestigationPanel evidence={investigation} />}
  </div>;
}