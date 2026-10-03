import { useEffect, useState } from 'react';
import { ApiError, apiClient } from '../api/client';
import { appGateApi, type AppGateState } from '../api/appGate';

// Must match the app's default copy (core/resources strings_app.xml: app_maintenance_*).
const DEFAULT_TITLE = "We'll be right back";
const DEFAULT_MESSAGE = 'ForAWhile is down for a short maintenance. Please try again in a few minutes.';
const MAX_BUILD = 2_100_000_000;

interface Form {
  maintenanceEnabled: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  minBuildAndroid: string;
  minBuildIos: string;
}

function toForm(state: AppGateState): Form {
  return {
    maintenanceEnabled: state.maintenanceEnabled,
    maintenanceTitle: state.maintenanceTitle ?? '',
    maintenanceMessage: state.maintenanceMessage ?? '',
    minBuildAndroid: String(state.minBuildAndroid),
    minBuildIos: String(state.minBuildIos),
  };
}

function parseBuild(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const build = Number(value.trim());
  return build <= MAX_BUILD ? build : null;
}

export function AppGate() {
  const [live, setLive] = useState<AppGateState | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    try {
      const state = await appGateApi.get();
      setLive(state);
      setForm(toForm(state));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load maintenance and update settings.');
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!form || !live) return;
    const minBuildAndroid = parseBuild(form.minBuildAndroid);
    const minBuildIos = parseBuild(form.minBuildIos);
    if (minBuildAndroid === null || minBuildIos === null) {
      setError('Minimum builds must be whole numbers of 0 or more.');
      return;
    }
    const environment = apiClient.environment();
    if (form.maintenanceEnabled && !live.maintenanceEnabled &&
      !confirm(`Turn on maintenance in ${environment}? Every non-admin user is blocked from the app straight away.`)) return;
    if ((minBuildAndroid > live.minBuildAndroid || minBuildIos > live.minBuildIos) &&
      !confirm(`Raise the minimum build in ${environment}? Older builds will be told to update before they can continue.`)) return;
    setIsBusy(true);
    try {
      const saved = await appGateApi.update({
        maintenanceEnabled: form.maintenanceEnabled,
        maintenanceTitle: form.maintenanceTitle.trim() || null,
        maintenanceMessage: form.maintenanceMessage.trim() || null,
        minBuildAndroid,
        minBuildIos,
      });
      setLive(saved);
      setForm(toForm(saved));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save these settings.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Configuration</span>
          <h2>Maintenance &amp; updates</h2>
          <p className="page-lede">
            Block the whole app while something critical is fixed, or require people on an old build to update.
            Unlike notices, these replace the entire app with a full-screen message.
          </p>
        </div>
      </div>
      <div className="settings-toolbar">
        <p className="muted">
          Changes affect the selected {apiClient.environment()} environment and reach every server within about 10 seconds.
        </p>
        <button className="btn btn-primary" disabled={isBusy || !form} onClick={() => void save()}>
          {isBusy ? 'Saving...' : 'Save and go live'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {form && live && (
        <div className="settings-matrix">
          <div className="setting-row">
            <div className="setting-info">
              <strong>Maintenance mode</strong>
              <span className="muted">
                Shows a maintenance screen and refuses bookings, payments and every other app request. Admin accounts,
                payment webhooks and this console keep working. Booking and payment deadlines keep running.
              </span>
            </div>
            <div className="setting-control">
              <button
                className={`btn ${form.maintenanceEnabled ? 'btn-danger' : 'btn-primary'}`}
                disabled={isBusy}
                onClick={() => setForm({ ...form, maintenanceEnabled: !form.maintenanceEnabled })}
              >
                {form.maintenanceEnabled ? 'Turn off' : 'Turn on'}
              </button>
              <span className={`pill pill-${live.maintenanceEnabled ? 'negative' : 'positive'}`}>
                {live.maintenanceEnabled ? 'Live: app blocked' : 'Live: app open'}
              </span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Maintenance title</strong>
              <span className="muted">Leave blank to use the app's default.</span>
            </div>
            <div className="setting-control">
              <input
                aria-label="Maintenance title"
                value={form.maintenanceTitle}
                maxLength={60}
                placeholder={DEFAULT_TITLE}
                disabled={isBusy}
                onChange={(event) => setForm({ ...form, maintenanceTitle: event.target.value })}
              />
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Maintenance message</strong>
              <span className="muted">Leave blank to use the app's default. Up to 200 characters.</span>
            </div>
            <div className="setting-control">
              <textarea
                aria-label="Maintenance message"
                value={form.maintenanceMessage}
                maxLength={200}
                rows={3}
                placeholder={DEFAULT_MESSAGE}
                disabled={isBusy}
                onChange={(event) => setForm({ ...form, maintenanceMessage: event.target.value })}
              />
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Minimum Android build</strong>
              <span className="muted">
                The versionCode (CI run number). Builds below this must update before use. 0 = no minimum.
              </span>
            </div>
            <div className="setting-control">
              <input
                type="number"
                aria-label="Minimum Android build"
                min={0}
                value={form.minBuildAndroid}
                disabled={isBusy}
                onChange={(event) => setForm({ ...form, minBuildAndroid: event.target.value })}
              />
              <span className="muted">Live {live.minBuildAndroid}</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Minimum iOS build</strong>
              <span className="muted">
                The build number (CFBundleVersion, CI run number). Builds below this must update before use. 0 = no minimum.
              </span>
            </div>
            <div className="setting-control">
              <input
                type="number"
                aria-label="Minimum iOS build"
                min={0}
                value={form.minBuildIos}
                disabled={isBusy}
                onChange={(event) => setForm({ ...form, minBuildIos: event.target.value })}
              />
              <span className="muted">Live {live.minBuildIos}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
