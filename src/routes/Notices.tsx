import { useEffect, useState } from 'react';
import { noticesApi, type Notice, type NoticeAudience, type NoticeInput, type NoticeType } from '../api/notices';
import { ApiError } from '../api/client';

const TYPES: { value: NoticeType; label: string }[] = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
];

const AUDIENCES: { value: NoticeAudience; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'CUSTOMERS', label: 'Customers only' },
  { value: 'COMPANIONS', label: 'Companions only' },
];

interface FormState {
  type: NoticeType;
  audience: NoticeAudience;
  title: string;
  message: string;
}

const BLANK_FORM: FormState = { type: 'ANNOUNCEMENT', audience: 'ALL', title: '', message: '' };

function toForm(notice: Notice): FormState {
  return { type: notice.type, audience: notice.audience, title: notice.title, message: notice.message };
}

export function Notices() {
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // Null = form closed. 'new' = creating. An id = editing that row.
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  async function load() {
    setError(null);
    try {
      setNotices(await noticesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load notices.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setForm(BLANK_FORM);
    setEditingId('new');
    setError(null);
  }

  function startEdit(notice: Notice) {
    setForm(toForm(notice));
    setEditingId(notice.id);
    setError(null);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(BLANK_FORM);
  }

  async function submitForm() {
    if (!form.title.trim() || !form.message.trim() || editingId === null) return;
    setIsBusy(true);
    setError(null);
    const input: NoticeInput = { ...form, title: form.title.trim(), message: form.message.trim() };
    try {
      if (editingId === 'new') {
        await noticesApi.create(input);
      } else {
        await noticesApi.update(editingId, input);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this notice.');
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleActive(notice: Notice) {
    setIsBusy(true);
    setError(null);
    try {
      await noticesApi.setActive(notice.id, !notice.isActive);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this notice.');
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteNotice(notice: Notice) {
    if (!confirm(`Delete "${notice.title}"?`)) return;
    setIsBusy(true);
    setError(null);
    try {
      await noticesApi.delete(notice.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete this notice.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="crud-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">In-app communication</span>
          <h2>Notices</h2>
          <p className="page-lede">
        Maintenance warnings and announcements shown inside the app. A maintenance notice stays on screen until it's
        turned off; an announcement can be dismissed by the person reading it. Only active notices are shown, and
        each reaches everyone, customers only, or companions only.
          </p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {editingId === null && (
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={startCreate}>
          Add notice
        </button>
      )}

      {editingId !== null && (
        <div className="card" style={{ marginTop: 16, maxWidth: 480 }}>
          <strong>{editingId === 'new' ? 'New notice' : 'Edit notice'}</strong>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="notice-type">Type</label>
            <select
              id="notice-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as NoticeType })}
            >
              {TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="notice-audience">Audience</label>
            <select
              id="notice-audience"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as NoticeAudience })}
            >
              {AUDIENCES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="notice-title">Title</label>
            <input
              id="notice-title"
              value={form.title}
              maxLength={60}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="notice-message">Message</label>
            <textarea
              id="notice-message"
              value={form.message}
              maxLength={200}
              rows={3}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="card-row" style={{ marginTop: 12 }}>
            <button
              className="btn btn-primary"
              disabled={isBusy || !form.title.trim() || !form.message.trim()}
              onClick={() => void submitForm()}
            >
              {editingId === 'new' ? 'Create' : 'Save'}
            </button>
            <button className="btn btn-secondary" disabled={isBusy} onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {notices && (
        <div className="crud-list" style={{ marginTop: 16 }}>
          {notices.map((notice) => (
            <div className="card" key={notice.id} style={{ marginTop: 8 }}>
              <div className="card-row">
                <div>
                  <strong>{notice.title}</strong>
                  <div className="muted">
                    {TYPES.find((t) => t.value === notice.type)?.label} ·{' '}
                    {AUDIENCES.find((a) => a.value === notice.audience)?.label}
                  </div>
                  <p style={{ marginTop: 4 }}>{notice.message}</p>
                </div>
                <span className={`pill pill-${notice.isActive ? 'positive' : 'negative'}`}>
                  {notice.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="card-row" style={{ marginTop: 8 }}>
                <button className="btn btn-secondary" disabled={isBusy} onClick={() => startEdit(notice)}>
                  Edit
                </button>
                <button
                  className={`btn ${notice.isActive ? 'btn-danger' : 'btn-primary'}`}
                  disabled={isBusy}
                  onClick={() => void toggleActive(notice)}
                >
                  {notice.isActive ? 'Hide' : 'Unhide'}
                </button>
                <button className="btn btn-danger" disabled={isBusy} onClick={() => void deleteNotice(notice)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {notices.length === 0 && <p className="muted">No notices yet.</p>}
        </div>
      )}
    </div>
  );
}
