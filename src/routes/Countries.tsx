import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { COUNTRIES, countriesApi, type CountryCode, type CountrySettings } from '../api/countries';
import { Switch } from '../components/Switch';
import { currencyDigits, formatMinor } from '../format/money';

const MONEY_KEYS = new Set(['MIN_PACKAGE_PRICE', 'MAX_PACKAGE_PRICE', 'MIN_PAYOUT']);

function toMajor(minor: number, currency: string): string {
  return (minor / 10 ** currencyDigits(currency)).toString();
}

function toMinor(major: string, currency: string): number {
  return Math.round(Number(major) * 10 ** currencyDigits(currency));
}

export function Countries() {
  const [countries, setCountries] = useState<CountrySettings[] | null>(null);
  // Money is edited in whole currency units and converted to minor units only on save.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyCountry, setBusyCountry] = useState<CountryCode | null>(null);

  function apply(list: CountrySettings[]) {
    setCountries(list);
    const next: Record<string, string> = {};
    for (const entry of list) {
      const currency = COUNTRIES.find((c) => c.code === entry.country)?.currency ?? 'INR';
      for (const setting of entry.settings) {
        next[`${entry.country}.${setting.key}`] = MONEY_KEYS.has(setting.key)
          ? toMajor(setting.value, currency)
          : setting.value.toString();
      }
    }
    setDrafts(next);
  }

  useEffect(() => {
    countriesApi
      .list()
      .then(apply)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load country settings.'));
  }, []);

  async function save(entry: CountrySettings, currency: string) {
    const settings = entry.settings.map((setting) => {
      const draft = drafts[`${entry.country}.${setting.key}`] ?? '';
      return { key: setting.key, value: MONEY_KEYS.has(setting.key) ? toMinor(draft, currency) : Number(draft) };
    });
    if (settings.some((setting) => !Number.isInteger(setting.value))) {
      setError('Every value must be a number.');
      return;
    }
    setBusyCountry(entry.country);
    setError(null);
    try {
      apply(await countriesApi.update(entry.country, settings));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save these settings.');
    } finally {
      setBusyCountry(null);
    }
  }

  return (
    <div className="settings-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Configuration</span>
          <h2>Countries</h2>
          <p className="page-lede">Which countries accept signups, and the money limits in each one's own currency.</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {countries?.map((entry) => {
        const meta = COUNTRIES.find((c) => c.code === entry.country);
        const currency = meta?.currency ?? 'INR';
        const isBusy = busyCountry === entry.country;
        return (
          <div className="card" key={entry.country} style={{ marginTop: 16 }}>
            <div className="card-row">
              <div>
                <strong>{meta?.name ?? entry.country}</strong>
                <div className="muted">{entry.country} · {currency}</div>
              </div>
              <span className={`pill pill-${entry.hasAllProviders ? 'positive' : 'pending'}`}>
                {entry.hasAllProviders ? 'Providers ready' : 'Missing a payment, payout or SMS provider'}
              </span>
            </div>
            <div className="settings-matrix">
              {entry.settings.map((setting) => {
                const draftKey = `${entry.country}.${setting.key}`;
                const isSwitch = setting.min === 0 && setting.max === 1;
                return (
                  <div className="setting-row" key={setting.key}>
                    <div className="setting-info">
                      <code>{setting.key}</code>
                      <strong>{setting.label}</strong>
                      <span className="muted">{setting.description}</span>
                    </div>
                    <div className="setting-control">
                      {isSwitch ? (
                        <Switch
                          checked={drafts[draftKey] === '1'}
                          label={setting.label}
                          disabled={isBusy || (!entry.hasAllProviders && drafts[draftKey] !== '1')}
                          onChange={(checked) => setDrafts({ ...drafts, [draftKey]: checked ? '1' : '0' })}
                        />
                      ) : (
                        <input
                          type="number"
                          aria-label={setting.label}
                          value={drafts[draftKey] ?? ''}
                          disabled={isBusy}
                          onChange={(event) => setDrafts({ ...drafts, [draftKey]: event.target.value })}
                        />
                      )}
                      {MONEY_KEYS.has(setting.key) && <span className="muted">Now {formatMinor(setting.value, currency)}</span>}
                      <span className={`pill pill-${setting.isOverride ? 'positive' : 'pending'}`}>
                        {setting.isOverride ? 'Override' : 'Default'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card-row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" disabled={isBusy} onClick={() => void save(entry, currency)}>
                {isBusy ? 'Saving...' : `Save ${meta?.name ?? entry.country}`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
