import type { BookingInvestigation } from '../api/admin';

export function BookingInvestigationPanel({ evidence }: { evidence: BookingInvestigation }) {
  const customerName = evidence.customer.customerProfile?.nickname ?? 'Customer';
  const companionName = evidence.companion.companionProfile?.nickname ?? 'Companion';
  const nameFor = (userId: string) => userId === evidence.customerId ? customerName : companionName;
  return <section className="evidence-panel" aria-label="Outing investigation">
    <h3>Outing evidence</h3>
    <dl className="evidence-facts">
      <div><dt>Status</dt><dd>{evidence.status.replaceAll('_', ' ')}</dd></div>
      <div><dt>Scheduled</dt><dd>{new Date(evidence.scheduledStart).toLocaleString()}</dd></div>
      <div><dt>Package</dt><dd>{evidence.packageTitle} ({evidence.durationMinutes} min)</dd></div>
      <div><dt>Meeting area</dt><dd>{evidence.meetingArea}</dd></div>
      <div><dt>Participants</dt><dd>{customerName} and {companionName}</dd></div>
    </dl>
    {evidence.noShowClaim && <p className="muted">No-show claim by {nameFor(evidence.noShowClaim.reporterId)}: {evidence.noShowClaim.locationStatus}{evidence.noShowClaim.latitude !== null ? ` at ${evidence.noShowClaim.latitude.toFixed(3)}, ${evidence.noShowClaim.longitude?.toFixed(3)}` : ''}</p>}
    {evidence.reports.length > 0 && <p className="muted">Unresolved reports: {evidence.reports.map((report) => report.reason.replaceAll('_', ' ')).join(', ')}</p>}
    <h4>Coordination messages</h4>
    {evidence.messages.length === 0 ? <p className="muted">No retained messages.</p> : <div className="evidence-list">{evidence.messages.map((message) => <div className="evidence-item" key={`${message.senderId}-${message.createdAt}`}><strong>{nameFor(message.senderId)}</strong><time>{new Date(message.createdAt).toLocaleString()}</time><p>{message.text}</p></div>)}</div>}
    <h4>Private arrival check-ins</h4>
    {evidence.checkIns.length === 0 ? <p className="muted">No retained check-ins.</p> : <div className="evidence-list">{evidence.checkIns.map((checkIn) => <div className="evidence-item" key={`${checkIn.userId}-${checkIn.createdAt}`}><strong>{nameFor(checkIn.userId)}</strong><time>{new Date(checkIn.createdAt).toLocaleString()}</time><p>{checkIn.latitude.toFixed(3)}, {checkIn.longitude.toFixed(3)}</p></div>)}</div>}
  </section>;
}