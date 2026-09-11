import { useEffect, useState } from 'react';
import { ACTIVITY_ICON_KEYS, catalogApi, type Activity, type ActivityIconKey, type ActivityInput } from '../api/catalog';
import { ApiError } from '../api/client';

const ICON_LABELS: Record<ActivityIconKey, string> = {
  coffee: 'Coffee',
  movie: 'Movie',
  car: 'Car',
  utensils: 'Utensils',
  map: 'Map',
  shopping_bag: 'Shopping bag',
  walk: 'Walk',
  sparkle: 'Sparkle (generic)',
};

interface FormState {
  name: string;
  iconKey: ActivityIconKey;
  description: string;
  defaultTitle: string;
  defaultDurationMinutes: string;
  defaultPriceINR: string;
}

const BLANK_FORM: FormState = {
  name: '',
  iconKey: 'sparkle',
  description: '',
  defaultTitle: '',
  defaultDurationMinutes: '',
  defaultPriceINR: '',
};

function toInput(form: FormState): ActivityInput {
  return {
    name: form.name.trim(),
    iconKey: form.iconKey,
    description: form.description.trim() || undefined,
    defaultTitle: form.defaultTitle.trim() || undefined,
    defaultDurationMinutes: form.defaultDurationMinutes ? Number(form.defaultDurationMinutes) : undefined,
    defaultPriceINR: form.defaultPriceINR ? Number(form.defaultPriceINR) : undefined,
  };
}

function toForm(activity: Activity): FormState {
  return {
    name: activity.name,
    iconKey: (activity.iconKey as ActivityIconKey) ?? 'sparkle',
    description: activity.description ?? '',
    defaultTitle: activity.defaultTitle ?? '',
    defaultDurationMinutes: activity.defaultDurationMinutes?.toString() ?? '',
    defaultPriceINR: activity.defaultPriceINR?.toString() ?? '',
  };
}

export function Catalog() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // Null = form closed. 'new' = creating. An id = editing that row.
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  async function load() {
    setError(null);
    try {
      setActivities(await catalogApi.listActivities());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load activities.');
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

  function startEdit(activity: Activity) {
    setForm(toForm(activity));
    setEditingId(activity.id);
    setError(null);
  }

  function cancelForm() {
    setEditingId(null);
    setForm(BLANK_FORM);
  }

  async function submitForm() {
    if (!form.name.trim() || editingId === null) return;
    setIsBusy(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await catalogApi.createActivity(toInput(form));
      } else {
        await catalogApi.updateActivity(editingId, toInput(form));
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this activity.');
    } finally {
      setIsBusy(false);
    }
  }

  async function toggleActive(activity: Activity) {
    setIsBusy(true);
    setError(null);
    try {
      await catalogApi.setActive(activity.id, !activity.isActive);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this activity.');
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteActivity(activity: Activity) {
    if (!confirm(`Delete "${activity.name}"? This only works if no companion or package uses it.`)) return;
    setIsBusy(true);
    setError(null);
    try {
      await catalogApi.deleteActivity(activity.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete this activity.');
    } finally {
      setIsBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!activities) return;
    const target = index + direction;
    if (target < 0 || target >= activities.length) return;
    const reordered = [...activities];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setActivities(reordered);
    setIsBusy(true);
    setError(null);
    try {
      await catalogApi.reorderActivities(reordered.map((a) => a.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reorder activities.');
      await load();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="crud-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Marketplace configuration</span>
          <h2>Catalog</h2>
          <p className="page-lede">Activities and package suggestions used by companions.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {editingId === null && (
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={startCreate}>
          Add activity
        </button>
      )}

      {editingId !== null && (
        <div className="card" style={{ marginTop: 16, maxWidth: 480 }}>
          <strong>{editingId === 'new' ? 'New activity' : 'Edit activity'}</strong>

          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor="activity-name">Name</label>
            <input id="activity-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="field">
            <label htmlFor="activity-icon">Icon</label>
            <select
              id="activity-icon"
              value={form.iconKey}
              onChange={(e) => setForm({ ...form, iconKey: e.target.value as ActivityIconKey })}
            >
              {ACTIVITY_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {ICON_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="activity-description">Description (shown in the activity picker)</label>
            <input
              id="activity-description"
              value={form.description}
              maxLength={300}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="activity-default-title">Suggested package title</label>
            <input
              id="activity-default-title"
              value={form.defaultTitle}
              maxLength={80}
              onChange={(e) => setForm({ ...form, defaultTitle: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="activity-default-duration">Suggested duration (minutes)</label>
            <input
              id="activity-default-duration"
              type="number"
              min={1}
              value={form.defaultDurationMinutes}
              onChange={(e) => setForm({ ...form, defaultDurationMinutes: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="activity-default-price">Suggested price (₹)</label>
            <input
              id="activity-default-price"
              type="number"
              min={1}
              value={form.defaultPriceINR}
              onChange={(e) => setForm({ ...form, defaultPriceINR: e.target.value })}
            />
          </div>

          <div className="card-row" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" disabled={isBusy || !form.name.trim()} onClick={() => void submitForm()}>
              {editingId === 'new' ? 'Create' : 'Save'}
            </button>
            <button className="btn btn-secondary" disabled={isBusy} onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {activities && (
        <div className="catalog-list">
          {activities.map((activity, index) => (
            <div className="card catalog-item" key={activity.id}>
              <div className="card-row">
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px' }}
                      disabled={isBusy || index === 0}
                      onClick={() => void move(index, -1)}
                      aria-label={`Move ${activity.name} up`}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', marginTop: 4 }}
                      disabled={isBusy || index === activities.length - 1}
                      onClick={() => void move(index, 1)}
                      aria-label={`Move ${activity.name} down`}
                    >
                      ↓
                    </button>
                  </div>
                  <div>
                    <strong>{activity.name}</strong>
                    <div className="muted">
                      {ICON_LABELS[(activity.iconKey as ActivityIconKey) ?? 'sparkle'] ?? activity.iconKey}
                      {activity.description ? ` · ${activity.description}` : ''}
                    </div>
                    {(activity.defaultTitle || activity.defaultDurationMinutes || activity.defaultPriceINR) && (
                      <div className="muted">
                        Suggests: {activity.defaultTitle ?? '—'}
                        {activity.defaultDurationMinutes ? ` · ${activity.defaultDurationMinutes} min` : ''}
                        {activity.defaultPriceINR ? ` · ₹${activity.defaultPriceINR}` : ''}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`pill pill-${activity.isActive ? 'positive' : 'negative'}`}>
                  {activity.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="card-row" style={{ marginTop: 8 }}>
                <button className="btn btn-secondary" disabled={isBusy} onClick={() => startEdit(activity)}>
                  Edit
                </button>
                <button
                  className={`btn ${activity.isActive ? 'btn-danger' : 'btn-primary'}`}
                  disabled={isBusy}
                  onClick={() => void toggleActive(activity)}
                >
                  {activity.isActive ? 'Hide' : 'Unhide'}
                </button>
                <button className="btn btn-danger" disabled={isBusy} onClick={() => void deleteActivity(activity)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
