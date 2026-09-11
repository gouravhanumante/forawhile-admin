import { useState, type ReactNode } from 'react';

/**
 * A living reference for the console: every example is built from the same classes the real
 * screens use, so this page cannot drift from the product the way a set of replicas would.
 *
 * The tokens below are transcribed from the mobile theme — Palette.kt (InkScheme), Shape.kt,
 * Spacing.kt and Type.kt — and mirrored in index.css, so both products share one language.
 */

const COLOR_ROLES: Array<[string, string]> = [
  ['primary', '#1F4D3A'],
  ['primaryContainer', '#DCEAE2'],
  ['secondary', '#2B3F5E'],
  ['secondaryContainer', '#DDE3EC'],
  ['tertiary', '#35735A'],
  ['background', '#F6F5F2'],
  ['surface', '#FFFFFF'],
  ['surfaceVariant', '#EFEDE7'],
  ['outlineVariant', '#E4E2DB'],
  ['outline', '#BDB9B0'],
  ['onSurface', '#17202A'],
  ['onSurfaceVariant', '#6B6A66'],
  ['error', '#DC2626'],
  ['errorContainer', '#FEE2E2'],
];

const TYPE_SCALE: Array<[string, number, number]> = [
  ['displaySmall', 32, 700],
  ['headlineMedium', 26, 700],
  ['headlineSmall', 22, 600],
  ['titleLarge', 20, 600],
  ['titleMedium', 16, 600],
  ['bodyLarge', 16, 400],
  ['bodyMedium', 14, 400],
  ['labelLarge', 15, 600],
  ['labelMedium', 13, 600],
  ['labelSmall', 11, 600],
];

const SPACING: Array<[string, number]> = [
  ['xs', 4], ['sm', 8], ['smd', 12], ['md', 16], ['lg', 24], ['xl', 32], ['xxl', 48],
];

const RADII: Array<[string, number]> = [
  ['button', 8], ['chip', 10], ['field', 12], ['card', 16],
];

const SECTIONS = ['Foundations', 'Buttons', 'Surfaces', 'Forms', 'Status'] as const;
type Section = (typeof SECTIONS)[number];

export function DesignSystem() {
  const [active, setActive] = useState<Section>('Foundations');

  return (
    <div className="queue-page">
      <div className="page-heading page-heading-compact">
        <div>
          <span className="eyebrow">Reference</span>
          <h2>Design system</h2>
          <p className="page-lede">
            The console's building blocks, rendered with the same classes the real screens use.
            Tokens are shared with the mobile app, so both products read as one product.
          </p>
        </div>
        <div className="heading-meta">
          <span className="live-indicator"><span className="status-dot" /> Live styles</span>
        </div>
      </div>

      <div className="queue-toolbar">
        <div className="field" style={{ maxWidth: 240 }}>
          <label htmlFor="ds-section">Section</label>
          <select id="ds-section" value={active} onChange={(e) => setActive(e.target.value as Section)}>
            {SECTIONS.map((section) => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
      </div>

      {active === 'Foundations' && <Foundations />}
      {active === 'Buttons' && <ButtonSpecimens />}
      {active === 'Surfaces' && <Surfaces />}
      {active === 'Forms' && <Forms />}
      {active === 'Status' && <StatusSpecimens />}
    </div>
  );
}

function Block({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="card">
      <strong style={{ fontSize: 16 }}>{title}</strong>
      <p className="muted" style={{ margin: '4px 0 0', maxWidth: 720 }}>{note}</p>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Foundations() {
  return (
    <>
      <Block
        title="Colour roles"
        note="Forest leads and InkBlue counters it. The neutrals are warm paper rather than a tint of the green, which keeps the colour rare enough to still mean something."
      >
        <div className="ds-grid">
          {COLOR_ROLES.map(([name, value]) => (
            <div className="ds-swatch" key={name}>
              <i style={{ background: value }} />
              <b>{name}</b>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography" note="Plus Jakarta Sans, the app's own face. One weight step above body is what makes a card scannable.">
        <div style={{ display: 'grid', gap: 12 }}>
          {TYPE_SCALE.map(([name, size, weight]) => (
            <div key={name}>
              <span className="ds-type-meta">{name} · {size}px · {weight}</span>
              <span style={{ fontSize: size, fontWeight: weight }}>An outing, not a date</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Spacing and radii" note="Multiples of four; a value outside the scale is a bug rather than a judgement call. Surfaces are softly rounded and never pill-shaped.">
        <div className="ds-row">
          {SPACING.map(([name, value]) => (
            <div className="ds-token" key={name}>
              <i style={{ width: value, height: value }} />
              <b>{name}</b>
              <span>{value}px</span>
            </div>
          ))}
        </div>
        <div className="ds-row" style={{ marginTop: 24 }}>
          {RADII.map(([name, value]) => (
            <div className="ds-token" key={name}>
              <i style={{ width: 64, height: 40, borderRadius: value, background: 'var(--surface-high)', border: '1px solid var(--border)' }} />
              <b>{name}</b>
              <span>{value}px</span>
            </div>
          ))}
        </div>
      </Block>
    </>
  );
}

function ButtonSpecimens() {
  return (
    <>
      <Block title="Primary" note="One per screen — the single thing the screen wants an admin to do.">
        <div className="ds-row">
          <button className="btn btn-primary">Approve verification</button>
          <button className="btn btn-primary" disabled>Disabled</button>
        </div>
      </Block>
      <Block title="Tonal" note="Middle emphasis, and the default for supporting actions: a screen full of outlined buttons has no hierarchy at all.">
        <div className="ds-row">
          <button className="btn btn-tonal">View outing evidence</button>
          <button className="btn btn-tonal">Mark reviewing</button>
        </div>
      </Block>
      <Block title="Secondary" note="Lowest emphasis. Reserve it for the action that must not compete with the primary one.">
        <div className="ds-row">
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-secondary">Look up</button>
        </div>
      </Block>
      <Block title="Danger" note="Only for an action that destroys or refuses something. Red never carries a second meaning.">
        <div className="ds-row">
          <button className="btn btn-danger">Reject</button>
          <button className="btn btn-danger">Suspend account</button>
        </div>
      </Block>
    </>
  );
}

function Surfaces() {
  return (
    <>
      <Block title="Card" note="The default surface: 16px radius and a hairline border. Elevation is deliberately absent — the border does that job.">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-row">
            <div>
              <strong>Coffee &amp; chai chat</strong>
              <div className="muted">Release Test Customer → Release Test Companion · 11/09/2026, 18:00</div>
            </div>
            <span className="pill pill-pending">Awaiting release</span>
          </div>
        </div>
      </Block>

      <Block title="Stat tiles" note="Dashboard counts. The soft container carries the category and the number stays in the lead hue.">
        <div className="stat-grid">
          <Tile tone="teal" kicker="Review" value="4" label="Pending verifications" action="Open queue" />
          <Tile tone="coral" kicker="Safety" value="1" label="Open reports" action="Investigate" />
          <Tile tone="amber" kicker="Escrow" value="2" label="Held payments" action="View payments" />
          <Tile tone="slate" kicker="Finance" value="0" label="Pending payouts" action="Open payouts" />
        </div>
      </Block>

      <Block title="Priority panel" note="The one thing the overview wants acted on first, with its count and its action in the same place.">
        <div className="attention-panel" style={{ marginBottom: 0 }}>
          <div>
            <span className="eyebrow">Priority queue</span>
            <h3>Companion verification</h3>
            <p>Identity reviews are waiting for an admin decision.</p>
          </div>
          <div className="attention-count">4</div>
          <button className="btn btn-primary">Review queue</button>
        </div>
      </Block>

      <Block title="Table" note="Dense operational data sits in its own scrollable surface rather than being broken into cards.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>When</th><th>Action</th><th>Target</th><th>Actor</th></tr>
            </thead>
            <tbody>
              <tr><td>11/09/2026, 18:04</td><td>ESCROW_RELEASED</td><td>BOOKING b31f…</td><td>admin</td></tr>
              <tr><td>11/09/2026, 17:55</td><td>VERIFICATION_APPROVED</td><td>USER 9a02…</td><td>admin</td></tr>
            </tbody>
          </table>
        </div>
      </Block>
    </>
  );
}

function Tile(props: { tone: string; kicker: string; value: string; label: string; action: string }) {
  return (
    <div className={`stat-card stat-card-${props.tone}`}>
      <span className="card-kicker">{props.kicker}</span>
      <div className="value">{props.value}</div>
      <div className="stat-label">{props.label}</div>
      <span className="stat-action">{props.action}</span>
    </div>
  );
}

function Forms() {
  return (
    <>
      <Block title="Fields" note="A 12px radius and a 44px minimum height, so a long review form stays comfortable to work through.">
        <div style={{ maxWidth: 420 }}>
          <div className="field">
            <label htmlFor="ds-name">Nickname</label>
            <input id="ds-name" defaultValue="Meera" />
          </div>
          <div className="field">
            <label htmlFor="ds-note">Note (shown to the companion on rejection)</label>
            <textarea id="ds-note" rows={2} defaultValue="The ID photo is too blurry to read." />
          </div>
          <div className="field">
            <label htmlFor="ds-phone">Phone number</label>
            <div className="phone-input">
              <span className="phone-prefix">+91</span>
              <input id="ds-phone" placeholder="9000000000" />
            </div>
          </div>
        </div>
      </Block>

      <Block title="Decision bar" note="Sticks to the bottom of a review card, so the decision stays reachable while an admin reads the evidence above it.">
        <div className="decision-bar" style={{ position: 'static' }}>
          <div className="ds-row">
            <button className="btn btn-primary">Approve</button>
            <button className="btn btn-danger">Reject</button>
            <button className="btn btn-secondary">Skip</button>
          </div>
        </div>
      </Block>
    </>
  );
}

function StatusSpecimens() {
  return (
    <>
      <Block
        title="Status pills"
        note="Colour carries meaning, so the label is never the only signal. Anything still in progress recedes into the warm neutral, because red stays reserved for failure."
      >
        <div className="ds-row">
          <span className="pill pill-positive">Approved</span>
          <span className="pill pill-pending">Under review</span>
          <span className="pill pill-negative">Rejected</span>
        </div>
      </Block>

      <Block title="Queue count" note="A quiet total beside a page heading, so the size of a queue never needs a coloured badge.">
        <div className="ds-row">
          <span className="queue-count">4 pending</span>
          <span className="queue-count">1 awaiting release</span>
        </div>
      </Block>

      <Block title="Environment strip" note="Always visible, because acting on production by mistake is the expensive error.">
        <div className="content-topbar" style={{ minHeight: 'auto', borderBottom: 'none' }}>
          <span className="status-dot" />
          <span>Production environment</span>
          <span className="topbar-divider" />
          <span className="muted">Restricted admin access</span>
        </div>
      </Block>

      <Block title="Inline error" note="Sits with the control it refers to rather than in a banner at the top of the page.">
        <p className="error-text">Could not load the escrow queue.</p>
      </Block>
    </>
  );
}
