import { useEffect, useState } from 'react';
import { ApiError, apiClient } from '../api/client';
import { settingsApi, type BusinessSetting } from '../api/settings';

export function Settings() {
  const [settings, setSettings] = useState<BusinessSetting[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    try {
      setSettings(await settingsApi.listBusiness());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load business settings.');
    }
  }

  useEffect(() => { void load(); }, []);

  async function publish() {
    if (!settings) return;
    for (const setting of settings) {
      if (!Number.isInteger(setting.value) || setting.value < setting.min || setting.value > setting.max) {
        setError(`${setting.label} must be between ${setting.min} and ${setting.max}.`);
        return;
      }
    }
    setIsBusy(true);
    try {
      setSettings(await settingsApi.updateBusiness(settings.map(({ key, value }) => ({ key, value }))));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not publish these settings.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Configuration</span>
          <h2>Business settings</h2>
          <p className="page-lede">Tune marketplace behavior for the selected environment.</p>
        </div>
      </div>
      <div className="settings-toolbar">
        <p className="muted">Draft values affect the selected {apiClient.environment()} environment only. Secrets and provider settings stay in deployment configuration.</p>
        <button className="btn btn-primary" disabled={isBusy || !settings} onClick={() => void publish()}>
          {isBusy ? 'Publishing...' : 'Save and go live'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="settings-matrix">
      {settings?.map((setting) => (
        <div className="setting-row" key={setting.key}>
          <div className="setting-info">
            <code>{setting.key}</code>
            <strong>{setting.label}</strong>
            <span className="muted">{setting.description}</span>
          </div>
          <div className="setting-control">
            {setting.min === 0 && setting.max === 1 ? (
              <>
                <button
                  className={`btn ${setting.value === 1 ? 'btn-danger' : 'btn-primary'}`}
                  disabled={isBusy}
                  onClick={() => setSettings((current) => current?.map((item) => item.key === setting.key ? { ...item, value: item.value === 1 ? 0 : 1 } : item) ?? null)}
                >
                  {setting.value === 1 ? 'Turn off' : 'Turn on'}
                </button>
                <span className={`pill pill-${setting.value === 1 ? 'positive' : 'negative'}`}>
                  {setting.value === 1 ? 'On' : 'Off'}
                </span>
              </>
            ) : (
              <>
                <input
                  type="number"
                  aria-label={setting.label}
                  min={setting.min}
                  max={setting.max}
                  value={setting.value}
                  disabled={isBusy}
                  onChange={(event) => setSettings((current) => current?.map((item) => item.key === setting.key ? { ...item, value: Number(event.target.value) } : item) ?? null)}
                />
                <span className="muted">Default {setting.defaultValue} · {setting.min}-{setting.max}</span>
              </>
            )}
            <span className={`pill pill-${setting.isOverride ? 'positive' : 'pending'}`}>
              {setting.isOverride ? 'Override' : 'Default'}
            </span>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}