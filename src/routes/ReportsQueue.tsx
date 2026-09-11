import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi, type ReportStatus, type ReportView } from '../api/reports';
import { ApiError } from '../api/client';
import { adminApi, type BookingCoordinationEvidence } from '../api/admin';

const STATUSES: ReportStatus[] = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];
const DECISIONS: Array<'REVIEWING' | 'RESOLVED' | 'DISMISSED'> = ['REVIEWING', 'RESOLVED', 'DISMISSED'];

export function ReportsQueue() {
  const [status, setStatus] = useState<ReportStatus>('OPEN');
  const [reports, setReports] = useState<ReportView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [evidenceByReportId, setEvidenceByReportId] = useState<Record<string, BookingCoordinationEvidence>>({});
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);

  function load() {
    reportsApi
      .list(status)
      .then(setReports)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load reports.'));
  }

  useEffect(load, [status]);

  async function review(id: string, decision: 'REVIEWING' | 'RESOLVED' | 'DISMISSED') {
    setBusyId(id);
    setError(null);
    try {
      await reportsApi.review(id, decision, notes[id]?.trim() || undefined);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the review.');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleEvidence(reportId: string) {
    if (expandedEvidenceId === reportId) {
      setExpandedEvidenceId(null);
      return;
    }
    if (evidenceByReportId[reportId]) {
      setExpandedEvidenceId(reportId);
      return;
    }
    setBusyId(reportId);
    setError(null);
    try {
      const evidence = await adminApi.bookingEvidence(reportId);
      setEvidenceByReportId((current) => ({ ...current, [reportId]: evidence }));
      setExpandedEvidenceId(reportId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load booking evidence.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Safety queue</span>
          <h2>Reports</h2>
          <p className="page-lede">Investigate the oldest and highest-risk cases first.</p>
        </div>
        <span className="queue-count">{reports.length} {status.toLowerCase()}</span>
      </div>
      <div className="queue-toolbar">
      <div className="field" style={{ maxWidth: 200 }}>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {reports.length === 0 && <p className="muted">Nothing here.</p>}
      {reports.map((report) => (
        <div className="card review-card" key={report.id}>
          <div className="card-row">
            <div>
              <strong>{report.reason.replaceAll('_', ' ')}</strong>
              <div className="muted">
                <Link to={`/users?id=${report.reporterId}`}>Reporter</Link> ·{' '}
                <Link to={`/users?id=${report.targetUserId}`}>Target</Link>
                {report.bookingId && ` · booking ${report.bookingId}`}
              </div>
            </div>
            <span
              className={`pill pill-${report.status === 'OPEN' || report.status === 'REVIEWING' ? 'pending' : report.status === 'RESOLVED' ? 'positive' : 'negative'}`}
            >
              {report.status}
            </span>
          </div>
          {report.details && <p style={{ marginTop: 8 }}>{report.details}</p>}
          {report.bookingId && (
            <div className="evidence-action">
              <button
                className="btn btn-secondary"
                disabled={busyId === report.id}
                onClick={() => void toggleEvidence(report.id)}
              >
                {expandedEvidenceId === report.id ? 'Hide outing evidence' : 'View outing evidence'}
              </button>
            </div>
          )}
          {expandedEvidenceId === report.id && evidenceByReportId[report.id] && (
            <BookingEvidencePanel evidence={evidenceByReportId[report.id]} />
          )}
          {(report.status === 'OPEN' || report.status === 'REVIEWING') && (
            <div className="decision-bar">
              <div className="field">
                <label htmlFor={`note-${report.id}`}>Review note</label>
                <textarea
                  id={`note-${report.id}`}
                  rows={2}
                  value={notes[report.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
                />
              </div>
              {DECISIONS.map((decision) => (
                <button
                  key={decision}
                  className={`btn ${decision === 'DISMISSED' ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={busyId === report.id}
                  onClick={() => void review(report.id, decision)}
                  style={{ marginRight: 8 }}
                >
                  {decision}
                </button>
              ))}
            </div>
          )}
          {report.reviewNote && (
            <p className="muted" style={{ marginTop: 8 }}>
              Review note: {report.reviewNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function BookingEvidencePanel({ evidence }: { evidence: BookingCoordinationEvidence }) {
  const { booking } = evidence;
  return (
    <section className="evidence-panel" aria-label="Outing coordination evidence">
      <h3>Outing evidence</h3>
      <dl className="evidence-facts">
        <div><dt>Status</dt><dd>{booking.status.replaceAll('_', ' ')}</dd></div>
        <div><dt>Scheduled</dt><dd>{new Date(booking.scheduledStart).toLocaleString()}</dd></div>
        <div><dt>Package</dt><dd>{booking.packageTitle} ({booking.durationMinutes} min)</dd></div>
        <div><dt>Meeting area</dt><dd>{booking.meetingArea}</dd></div>
        <div><dt>Participants</dt><dd>{booking.customer.nickname} and {booking.companion.nickname}</dd></div>
      </dl>
      {booking.cancellationReason && <p className="muted">Booking reason: {booking.cancellationReason}</p>}

      <h4>Coordination messages</h4>
      {evidence.messages.length === 0 ? (
        <p className="muted">No retained messages.</p>
      ) : (
        <div className="evidence-list">
          {evidence.messages.map((message) => (
            <div className="evidence-item" key={`${message.senderId}-${message.createdAt}`}>
              <strong>{message.sender.nickname}</strong>
              <time>{new Date(message.createdAt).toLocaleString()}</time>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      )}

      <h4>Private arrival check-ins</h4>
      <p className="muted">Coordinates are rounded to about 110m and were never visible to the other participant.</p>
      {evidence.checkIns.length === 0 ? (
        <p className="muted">No retained check-ins.</p>
      ) : (
        <div className="evidence-list">
          {evidence.checkIns.map((checkIn) => (
            <div className="evidence-item" key={`${checkIn.userId}-${checkIn.createdAt}`}>
              <strong>{checkIn.user.nickname}</strong>
              <time>{new Date(checkIn.createdAt).toLocaleString()}</time>
              <p>{checkIn.latitude.toFixed(3)}, {checkIn.longitude.toFixed(3)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
