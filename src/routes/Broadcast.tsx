import { useState } from 'react';
import { notificationsApi, type BroadcastAudience, type BroadcastPreview } from '../api/notifications';
import { ApiError } from '../api/client';

const AUDIENCES: { value: BroadcastAudience; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'CUSTOMERS', label: 'Customers only' },
  { value: 'COMPANIONS', label: 'Companions only' },
];

export function Broadcast() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<BroadcastAudience>('ALL');
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  // Snapshot of what was previewed, so editing the form after a preview invalidates it —
  // Send must never fire against a preview count for different text or a different audience.
  const [previewedFor, setPreviewedFor] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const currentSnapshot = JSON.stringify({ title: title.trim(), body: body.trim(), audience });
  const isStale = previewedFor !== currentSnapshot;

  async function runPreview() {
    if (!title.trim() || !body.trim()) return;
    setIsBusy(true);
    setError(null);
    setSentCount(null);
    try {
      const result = await notificationsApi.preview({ title: title.trim(), body: body.trim(), audience });
      setPreview(result);
      setPreviewedFor(currentSnapshot);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the recipient count.');
    } finally {
      setIsBusy(false);
    }
  }

  async function send() {
    if (isStale || !preview) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await notificationsApi.send({ title: title.trim(), body: body.trim(), audience });
      setSentCount(result.recipientDevices);
      setTitle('');
      setBody('');
      setPreview(null);
      setPreviewedFor(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the broadcast.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <h2>Broadcast</h2>
      <p className="muted">
        A push notification to every device for the chosen audience. There is no undo — preview the recipient count
        before sending.
      </p>

      <div className="field" style={{ maxWidth: 480, marginTop: 16 }}>
        <label htmlFor="broadcast-title">Title</label>
        <input id="broadcast-title" value={title} maxLength={65} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field" style={{ maxWidth: 480 }}>
        <label htmlFor="broadcast-body">Message</label>
        <textarea id="broadcast-body" value={body} maxLength={240} rows={3} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="field" style={{ maxWidth: 480 }}>
        <label htmlFor="broadcast-audience">Audience</label>
        <select
          id="broadcast-audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value as BroadcastAudience)}
        >
          {AUDIENCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {sentCount !== null && !error && <p className="muted">Sent to {sentCount} device(s).</p>}

      <button
        className="btn btn-secondary"
        disabled={isBusy || !title.trim() || !body.trim()}
        onClick={() => void runPreview()}
      >
        Preview audience
      </button>

      {preview && (
        <div className="card" style={{ marginTop: 16, maxWidth: 480 }}>
          <div className="card-row">
            <div>
              <strong>
                {preview.recipientUsers} user(s) · {preview.recipientDevices} device(s)
              </strong>
              <div className="muted">
                {isStale ? 'Form changed since this preview — preview again before sending.' : `To: ${AUDIENCES.find((a) => a.value === audience)?.label}`}
              </div>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            "{title.trim()}" — {body.trim()}
          </p>
          <button className="btn btn-danger" disabled={isBusy || isStale} onClick={() => void send()} style={{ marginTop: 12 }}>
            Send to {preview.recipientDevices} device(s)
          </button>
        </div>
      )}
    </div>
  );
}
