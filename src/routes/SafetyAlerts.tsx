import { useEffect, useState } from 'react';
import { adminApi, type PendingSafetyAlert, type SafetyVerdict, type SettlementPreview } from '../api/admin';
import { ApiError } from '../api/client';

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const verdicts: Array<{ verdict: SafetyVerdict; label: string; consequence: string }> = [
  { verdict: 'GENUINE', label: 'Real', consequence: 'Customer is suspended.' },
  { verdict: 'UNCLEAR', label: "Can't tell", consequence: 'Nobody is penalised; it stays on both records.' },
  { verdict: 'FALSE', label: 'Made up', consequence: 'Companion gets a fraud strike.' },
];

function split(preview: SettlementPreview) {
  const parts = [`companion ${rupees(preview.payoutMinor)}`, `us ${rupees(preview.commissionMinor)}`, `refund ${rupees(preview.refundMinor)}`];
  if (preview.penaltyMinor > 0) parts.push(`penalty ${rupees(preview.penaltyMinor)}`);
  return parts.join(' · ');
}

export function SafetyAlerts() {
  const [alerts, setAlerts] = useState<PendingSafetyAlert[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => adminApi.pendingSafetyAlerts().then(setAlerts).catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load SOS alerts.'));
  useEffect(() => { void load(); }, []);

  async function decide(alert: PendingSafetyAlert, verdict: SafetyVerdict) {
    const reviewNote = notes[alert.bookingId]?.trim();
    if (!reviewNote) return;
    setBusyId(alert.bookingId);
    setError(null);
    try {
      await adminApi.decideSafetyAlert(alert.bookingId, verdict, reviewNote);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record this decision.');
    } finally { setBusyId(null); }
  }

  function nameOf(alert: PendingSafetyAlert, userId: string) {
    return userId === alert.booking.customerId
      ? alert.booking.customer.customerProfile?.nickname ?? 'Customer'
      : alert.booking.companion.companionProfile?.nickname ?? 'Companion';
  }

  return <div>
    <h2>SOS Review</h2>
    <p className="muted">Each outing here was ended by the companion's SOS. Nothing has been paid or refunded yet. Undecided alerts settle as "can't tell" automatically after 7 days.</p>
    {error && <p className="error-text">{error}</p>}
    {alerts.length === 0 && <p className="muted">No SOS alerts waiting.</p>}
    {alerts.map((alert) => {
      const companion = alert.booking.companion.companionProfile?.nickname ?? 'Companion';
      const customer = alert.booking.customer.customerProfile?.nickname ?? 'Customer';
      const note = notes[alert.bookingId]?.trim();
      return <div className="card" key={alert.bookingId}>
        <strong>{companion} pressed SOS with {customer}</strong>
        <p className="muted">
          {new Date(alert.createdAt).toLocaleString()} · {alert.minutesIntoOuting} min into a {alert.booking.durationMinutes}-min outing · {alert.booking.packageTitle} · {alert.booking.meetingArea}
        </p>
        <p className="muted">Phones: {companion} {alert.booking.companion.phone} · {customer} {alert.booking.customer.phone}</p>
        <p className="muted">
          SOS location: {alert.locationStatus}{alert.latitude !== null && alert.longitude !== null ? ` · ${alert.latitude.toFixed(3)}, ${alert.longitude.toFixed(3)}` : ''}
          {alert.booking.meetingLatitude !== null && alert.booking.meetingLongitude !== null ? ` (meeting point ${alert.booking.meetingLatitude.toFixed(3)}, ${alert.booking.meetingLongitude.toFixed(3)})` : ''}
        </p>
        <p className="muted">
          Trusted contact {alert.contactNotifiedAt ? 'texted' : 'not reached'} · safety team {alert.safetyTeamNotifiedAt ? 'texted' : 'not reached'}
          {alert.markedSafeAt ? ` · marked safe at ${new Date(alert.markedSafeAt).toLocaleTimeString()}` : ''}
        </p>

        {alert.respondedAt
          ? <p><strong>{customer} answers:</strong> {alert.responseText ?? 'No text supplied'}</p>
          : <p className="error-text">{customer} has {alert.customerNotifiedAt ? 'not answered yet' : 'not been told why yet'}.</p>}

        <ul>
          <li>{companion}: {alert.companionHistory.priorAlerts} earlier SOS ({alert.companionHistory.genuine} real, {alert.companionHistory.unclear} unclear, {alert.companionHistory.false} made up){alert.companionHistory.fraudStrikes > 0 ? ` · ${alert.companionHistory.fraudStrikes} fraud strike(s)` : ''}</li>
          <li className={alert.customerHistory.otherCompanionsRaisedSos + alert.customerHistory.peopleWhoFiledSafetyReports > 0 ? 'error-text' : undefined}>
            {customer}: SOS from {alert.customerHistory.otherCompanionsRaisedSos} other companion(s) ({alert.customerHistory.upheldSos} upheld) · safety reports from {alert.customerHistory.peopleWhoFiledSafetyReports} different people
          </li>
        </ul>

        {alert.booking.checkIns.length > 0 && <p className="muted">
          Check-ins: {alert.booking.checkIns.map((checkIn) => `${nameOf(alert, checkIn.userId)} at ${new Date(checkIn.createdAt).toLocaleTimeString()} (${checkIn.latitude.toFixed(3)}, ${checkIn.longitude.toFixed(3)})`).join(' · ')}
        </p>}
        {alert.booking.messages.length > 0 && <details>
          <summary>Coordination thread ({alert.booking.messages.length})</summary>
          <ul>{alert.booking.messages.map((message) => <li key={message.createdAt} className="muted">{new Date(message.createdAt).toLocaleTimeString()} {nameOf(alert, message.senderId)}: {message.text}</li>)}</ul>
        </details>}

        <div className="field"><label htmlFor={`note-${alert.bookingId}`}>Decision note</label><textarea id={`note-${alert.bookingId}`} value={notes[alert.bookingId] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [alert.bookingId]: event.target.value }))} /></div>
        {verdicts.map(({ verdict, label, consequence }, index) => <div key={verdict} style={{ marginTop: 8 }}>
          <button
            className={index === 0 ? 'btn btn-primary' : 'btn btn-secondary'}
            disabled={busyId === alert.bookingId || !note}
            onClick={() => void decide(alert, verdict)}
          >{label}</button>
          <span className="muted" style={{ marginLeft: 8 }}>{split(alert.outcomes[verdict])} · {consequence}</span>
        </div>)}
      </div>;
    })}
  </div>;
}
