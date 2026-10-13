import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { settingsApi, type BusinessSetting } from '../api/settings';
import { Switch } from './Switch';

export const UPGRADE_VISIBILITY_KEYS = ['UPGRADE_VISIBLE_ANDROID', 'UPGRADE_VISIBLE_IOS', 'UPGRADE_VISIBLE_WEB'] as const;

const PLATFORM_NAMES: Record<string, string> = {
  UPGRADE_VISIBLE_ANDROID: 'Android app',
  UPGRADE_VISIBLE_IOS: 'iOS app',
  UPGRADE_VISIBLE_WEB: 'Website',
};

export function isUpgradeVisibilitySetting(setting: BusinessSetting): boolean {
  return (UPGRADE_VISIBILITY_KEYS as readonly string[]).includes(setting.key);
}

interface Props {
  // Only the platforms this backend knows about; an older backend has no website switch.
  settings: BusinessSetting[];
  disabled: boolean;
  onSaved: (updated: BusinessSetting[]) => void;
}

/** One row on the Settings page plus a dialog that switches every platform's Upgrade entry points together. */
export function UpgradeVisibilityControl({ settings, disabled, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ordered = UPGRADE_VISIBILITY_KEYS.flatMap((key) => settings.filter((setting) => setting.key === key));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setError(null);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  if (ordered.length === 0) return null;

  function open() {
    setDraft(Object.fromEntries(ordered.map((setting) => [setting.key, setting.value === 1])));
    setError(null);
    dialogRef.current?.showModal();
  }

  async function save() {
    setIsSaving(true);
    try {
      const updated = await settingsApi.updateBusiness(
        ordered.map((setting) => ({ key: setting.key, value: draft[setting.key] ? 1 : 0 })),
      );
      onSaved(updated);
      dialogRef.current?.close();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save Upgrade availability.');
    } finally {
      setIsSaving(false);
    }
  }

  const changed = ordered.some((setting) => draft[setting.key] !== (setting.value === 1));

  return (
    <>
      <div className="setting-row">
        <div className="setting-info">
          <strong>Upgrade availability</strong>
          <span className="muted">
            Where Premium / Companion Pro can be bought. Off hides every upgrade entry point on that platform.
          </span>
          <div className="platform-pills">
            {ordered.map((setting) => (
              <span key={setting.key} className={`pill pill-${setting.value === 1 ? 'positive' : 'negative'}`}>
                {PLATFORM_NAMES[setting.key]}: {setting.value === 1 ? 'On' : 'Off'}
              </span>
            ))}
          </div>
        </div>
        <div className="setting-control">
          <button type="button" className="btn btn-secondary" disabled={disabled} onClick={open}>
            Manage
          </button>
        </div>
      </div>

      <dialog ref={dialogRef} className="dialog" aria-labelledby="upgrade-visibility-title">
        <span className="eyebrow">Configuration</span>
        <h3 id="upgrade-visibility-title">Upgrade availability</h3>
        <p className="muted">Saving applies immediately. Purchases already made are not affected.</p>
        <div className="settings-matrix">
          {ordered.map((setting) => (
            <div className="setting-row" key={setting.key}>
              <div className="setting-info">
                <strong>{PLATFORM_NAMES[setting.key]}</strong>
                <span className="muted">{setting.description}</span>
                <code>{setting.key}</code>
              </div>
              <div className="setting-control">
                <Switch
                  checked={draft[setting.key] ?? false}
                  label={`Show Upgrade on ${PLATFORM_NAMES[setting.key]}`}
                  disabled={isSaving}
                  onChange={(checked) => setDraft((current) => ({ ...current, [setting.key]: checked }))}
                />
              </div>
            </div>
          ))}
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" disabled={isSaving} onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={isSaving || !changed} onClick={() => void save()}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </dialog>
    </>
  );
}
