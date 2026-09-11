import { useMemo, useState } from 'react';

/**
 * A catalogue of the mobile design system, rebuilt in HTML so it can be browsed without an
 * emulator.
 *
 * These are replicas, not the real Compose components — they read their values from the tokens
 * below, which are transcribed from theme/Palette.kt, Color.kt, Shape.kt, Spacing.kt and Type.kt.
 * Changing a token in Kotlin will not change this page, so treat it as a reference for design
 * discussions rather than a source of truth.
 */

// ---- tokens, transcribed from the Kotlin theme -------------------------------------------

const FOREST = {
  container: '#DCEAE2',
  containerStrong: '#C2DDCE',
  light: '#6FA98C',
  base: '#4D8F71',
  mid: '#35735A',
  deep: '#1F4D3A',
  dark: '#163828',
  darkest: '#0E2A1E',
};

const INK_BLUE = {
  container: '#DDE3EC',
  containerStrong: '#C3CEDD',
  light: '#6B84A8',
  base: '#4A6690',
  mid: '#3A5477',
  deep: '#2B3F5E',
  dark: '#1E2E45',
  darkest: '#132030',
};

const APRICOT = {
  container: '#F8E2D5',
  containerStrong: '#F2C8B4',
  light: '#C97858',
  base: '#B65D3B',
  mid: '#98472C',
  deep: '#76331F',
  dark: '#572416',
  darkest: '#3B170E',
};

const SEMANTIC = {
  ink: '#17202A',
  slate: '#64748B',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  onDangerLight: '#7F1D1D',
};

// lead = Forest, counter = InkBlue (hues() in Palette.kt), and neutrals are the lead tinted
// into white — which is why the greys are green rather than grey.
const ROLES = {
  primary: FOREST.deep,
  onPrimary: '#FFFFFF',
  secondary: INK_BLUE.deep,
  tertiary: FOREST.mid,
  surface: '#FFFFFF',
  background: '#F7F9F8',
  surfaceVariant: '#E6EBE9',
  onSurface: SEMANTIC.ink,
  onSurfaceVariant: '#536A77',
  outline: '#A1B4AC',
  outlineVariant: '#D7DFDC',
  error: SEMANTIC.danger,
  errorContainer: SEMANTIC.dangerLight,
  onErrorContainer: SEMANTIC.onDangerLight,
};

const SPACING = [
  ['xxs', 2], ['xs', 4], ['sm', 8], ['smd', 12], ['md', 16],
  ['lg', 20], ['xl', 24], ['xxl', 32], ['xxxl', 40],
] as const;

const RADII = [
  ['button', 8], ['chip', 10], ['field', 12], ['card', 16], ['sheet', 24], ['pill', 999],
] as const;

const SIZES = [
  ['minTouch', 48], ['buttonHeight', 52],
] as const;

const TYPE = [
  ['displaySmall', 32, 700], ['headlineSmall', 22, 700], ['titleMedium', 17, 600],
  ['titleSmall', 15, 600], ['bodyLarge', 16, 400], ['bodyMedium', 14, 400],
  ['labelLarge', 14, 600], ['labelMedium', 13, 600], ['caption', 12, 500],
] as const;

// ---- page ---------------------------------------------------------------------------------

type Category =
  | 'Foundations'
  | 'Buttons'
  | 'Cards'
  | 'Inputs'
  | 'Status & badges'
  | 'Rows & lists'
  | 'Feedback';

const CATEGORIES: Category[] = [
  'Foundations',
  'Buttons',
  'Cards',
  'Inputs',
  'Status & badges',
  'Rows & lists',
  'Feedback',
];

export function DesignSystem() {
  const [active, setActive] = useState<Category>('Foundations');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    if (!query.trim()) return null;
    return query.trim().toLowerCase();
  }, [query]);

  return (
    <div className="ds">
      <style>{css}</style>

      <header className="ds-head">
        <div>
          <h1>Design system</h1>
          <p className="ds-sub">
            The mobile app's components, rebuilt in HTML from the Kotlin theme tokens. Replicas for
            reference — they do not update when the Compose source changes.
          </p>
        </div>
        <input
          className="ds-search"
          placeholder="Filter components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <nav className="ds-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={c === active && !visible ? 'ds-tab active' : 'ds-tab'}
            onClick={() => {
              setActive(c);
              setQuery('');
            }}
          >
            {c}
          </button>
        ))}
      </nav>

      {SECTIONS.filter((s) => (visible ? s.name.toLowerCase().includes(visible) : s.category === active)).map(
        (s) => (
          <section className="ds-item" key={s.name}>
            <div className="ds-item-head">
              <h2>{s.name}</h2>
              <code>{s.symbol}</code>
            </div>
            {s.note && <p className="ds-note">{s.note}</p>}
            <div className="ds-canvas">{s.render()}</div>
          </section>
        ),
      )}
    </div>
  );
}

// ---- component replicas -------------------------------------------------------------------

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="sw">
      <i style={{ background: value }} />
      <b>{name}</b>
      <span>{value}</span>
    </div>
  );
}

function Ramp({ label, hue }: { label: string; hue: Record<string, string> }) {
  return (
    <div className="ramp">
      <span className="ramp-label">{label}</span>
      <div className="ramp-steps">
        {Object.entries(hue).map(([step, value]) => (
          <div key={step} className="ramp-step">
            <i style={{ background: value }} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  width: '100%',
  height: 52,
  borderRadius: 8,
  border: '1px solid transparent',
  fontWeight: 600,
  fontSize: 14,
};

const SECTIONS: Array<{
  category: Category;
  name: string;
  symbol: string;
  note?: string;
  render: () => JSX.Element;
}> = [
  // ---- Foundations ----
  {
    category: 'Foundations',
    name: 'Colour roles',
    symbol: 'Palette.kt · schemeOf()',
    note: 'hues() returns Forest to InkBlue, so primary is green. Neutrals are the lead hue lerped into white, which is why the greys lean green.',
    render: () => (
      <div className="grid-sw">
        {Object.entries(ROLES).map(([k, v]) => (
          <Swatch key={k} name={k} value={v} />
        ))}
      </div>
    ),
  },
  {
    category: 'Foundations',
    name: 'Hue ramps',
    symbol: 'Palette.kt · Hue',
    note: 'mid and darker clear 3:1 on white; dark and darkest clear 4.5:1, so gradients built from them can carry white text.',
    render: () => (
      <div className="ramps">
        <Ramp label="Forest (lead)" hue={FOREST} />
        <Ramp label="InkBlue (counter)" hue={INK_BLUE} />
        <Ramp label="Apricot (accent)" hue={APRICOT} />
      </div>
    ),
  },
  {
    category: 'Foundations',
    name: 'Typography',
    symbol: 'Type.kt',
    render: () => (
      <div className="stack">
        {TYPE.map(([name, size, weight]) => (
          <div key={name} className="type-row">
            <span className="type-meta">{name} · {size}px · {weight}</span>
            <span style={{ fontSize: size, fontWeight: weight, color: ROLES.onSurface }}>
              An outing, not a date
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    category: 'Foundations',
    name: 'Spacing, radii & sizes',
    symbol: 'Spacing.kt · Shape.kt',
    render: () => (
      <div className="stack">
        <div className="token-row">
          {SPACING.map(([n, v]) => (
            <div key={n} className="token">
              <i style={{ width: v, height: v, background: ROLES.primary }} />
              <b>{n}</b><span>{v}dp</span>
            </div>
          ))}
        </div>
        <div className="token-row">
          {RADII.map(([n, v]) => (
            <div key={n} className="token">
              <i style={{ width: 44, height: 30, background: ROLES.surfaceVariant, border: `1px solid ${ROLES.outlineVariant}`, borderRadius: v }} />
              <b>{n}</b><span>{v === 999 ? '50%' : `${v}dp`}</span>
            </div>
          ))}
        </div>
        <div className="token-row">
          {SIZES.map(([n, v]) => (
            <div key={n} className="token">
              <i style={{ width: 64, height: v, background: ROLES.primary, borderRadius: 8 }} />
              <b>{n}</b><span>{v}dp</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  // ---- Buttons ----
  {
    category: 'Buttons',
    name: 'Primary',
    symbol: 'RagPrimaryButton',
    note: 'Full width, 52dp. One per screen — the single thing the screen wants you to do.',
    render: () => (
      <div className="phone">
        <button style={{ ...btn, background: ROLES.primary, color: '#fff' }}>Request a booking</button>
        <button style={{ ...btn, background: ROLES.primary, color: '#fff', opacity: 0.38 }} disabled>
          Disabled
        </button>
      </div>
    ),
  },
  {
    category: 'Buttons',
    name: 'Tonal',
    symbol: 'RagTonalButton',
    note: 'Middle emphasis, the default for supporting actions. caution swaps to the error container for a consequential-but-not-destructive action.',
    render: () => (
      <div className="phone">
        <button style={{ ...btn, background: FOREST.container, color: ROLES.primary }}>Leave a review</button>
        <button style={{ ...btn, background: ROLES.errorContainer, color: ROLES.onErrorContainer }}>
          Report a no-show
        </button>
        <span className="cap">caution = true</span>
      </div>
    ),
  },
  {
    category: 'Buttons',
    name: 'Secondary',
    symbol: 'RagSecondaryButton',
    note: 'Lowest-emphasis full-width action. destructive borrows the error colour, because a hairline in the neutral outline reads as barely there.',
    render: () => (
      <div className="phone">
        <button style={{ ...btn, background: 'transparent', color: ROLES.onSurface, border: `1px solid ${ROLES.onSurfaceVariant}` }}>
          Decline
        </button>
        <button style={{ ...btn, background: 'transparent', color: ROLES.error, border: `1.5px solid ${ROLES.error}` }}>
          Cancel outing
        </button>
        <span className="cap">destructive = true</span>
      </div>
    ),
  },
  {
    category: 'Buttons',
    name: 'Text & chip',
    symbol: 'RagTextButton · RagChipButton',
    note: 'Text is 48dp tall but has no container, so reserve it for navigation-ish actions. Chip is wrap-content for one inline action inside a card — currently 36dp, below the 48dp touch target.',
    render: () => (
      <div className="phone row">
        <button style={{ background: 'none', border: 'none', color: ROLES.primary, fontWeight: 600, height: 48, padding: '0 12px' }}>
          See all outings
        </button>
        <button style={{ background: ROLES.primary, color: '#fff', border: 'none', borderRadius: 10, height: 36, padding: '0 16px', fontWeight: 600, fontSize: 13 }}>
          Pay
        </button>
      </div>
    ),
  },
  {
    category: 'Buttons',
    name: 'On accent',
    symbol: 'RagOnAccentButton',
    note: 'For use on a filled accent surface, where the theme buttons would fight the background.',
    render: () => (
      <div className="phone" style={{ background: FOREST.deep, padding: 16, borderRadius: 16 }}>
        <button style={{ ...btn, background: '#fff', color: FOREST.deep }}>Mark completed</button>
        <button style={{ ...btn, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.55)' }}>
          Not now
        </button>
      </div>
    ),
  },

  // ---- Cards ----
  {
    category: 'Cards',
    name: 'Card',
    symbol: 'RagCard',
    note: 'The default surface. 16dp radius, hairline outline, no elevation.',
    render: () => (
      <div className="phone">
        <div style={{ background: ROLES.surface, border: `1px solid ${ROLES.outlineVariant}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Coffee at Third Wave</div>
          <div style={{ color: ROLES.onSurfaceVariant, fontSize: 14, marginTop: 4 }}>60 min · ₹600 · Indiranagar</div>
        </div>
      </div>
    ),
  },
  {
    category: 'Cards',
    name: 'Boarding pass',
    symbol: 'RagBoardingPassCard',
    note: 'Accent fill torn down its right edge by a dashed seam, with a narrow stub. One row tall so it sits above a feed without pushing content off screen.',
    render: () => (
      <div className="phone">
        {[
          { accent: FOREST.deep, eyebrow: 'NEXT UP', title: 'Coffee with Meera', stub: ['12 Sep', '6:30 PM', 'STARTS'] },
          { accent: APRICOT.deep, eyebrow: 'HAPPENING NOW', title: 'Dinner with Riti', stub: ['12 Sep', '7:00 PM', 'STARTED'] },
          { accent: INK_BLUE.deep, eyebrow: 'JUST FINISHED', title: 'Movie with Sana', stub: ['12 Sep', '9:00 PM', 'ENDED'] },
        ].map((c) => (
          <div key={c.eyebrow} className="pass" style={{ background: c.accent }}>
            <div className="pass-main">
              <span className="pass-eyebrow">{c.eyebrow}</span>
              <span className="pass-title">{c.title}</span>
              <span className="pass-sub">MG Road, Bengaluru</span>
            </div>
            <div className="pass-seam" />
            <div className="pass-stub">
              <span>{c.stub[0]}</span>
              <b>{c.stub[1]}</b>
              <span>{c.stub[2]}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    category: 'Cards',
    name: 'Hero & stats',
    symbol: 'RagHeroCard · RagHeroStat',
    render: () => (
      <div className="phone">
        <div style={{ background: `linear-gradient(135deg, ${FOREST.deep}, ${FOREST.darkest})`, borderRadius: 16, padding: 20, color: '#fff' }}>
          <div style={{ fontSize: 12, letterSpacing: '.09em', opacity: 0.75, fontWeight: 600 }}>TODAY</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>2 requests waiting</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            {[['2', 'requests'], ['5', 'upcoming']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    category: 'Cards',
    name: 'Discover card',
    symbol: 'RagDiscoverCard',
    render: () => (
      <div className="phone">
        <div style={{ background: ROLES.surface, border: `1px solid ${ROLES.outlineVariant}`, borderRadius: 16, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 96, background: FOREST.containerStrong }} />
          <div style={{ padding: 14, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <b style={{ fontSize: 16 }}>Meera</b>
              <span style={{ background: FOREST.container, color: FOREST.deep, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>✓ Verified</span>
            </div>
            <div style={{ color: ROLES.onSurfaceVariant, fontSize: 13, marginTop: 4 }}>Bengaluru · 2.4 km</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>from ₹600</div>
          </div>
        </div>
      </div>
    ),
  },

  // ---- Inputs ----
  {
    category: 'Inputs',
    name: 'Text field',
    symbol: 'RagTextField',
    render: () => (
      <div className="phone">
        <label className="fl">Nickname</label>
        <div className="field">Meera</div>
        <label className="fl">About</label>
        <div className="field err">Tell people what you enjoy</div>
        <span className="errtext">About must be at least 20 characters.</span>
      </div>
    ),
  },
  {
    category: 'Inputs',
    name: 'Slider',
    symbol: 'RagSlider',
    note: 'The top of the range renders as "N km+" and stands for no cap, so parking it there means no filter at all.',
    render: () => (
      <div className="phone">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: ROLES.onSurfaceVariant }}>
          <span>Distance</span><b style={{ color: ROLES.onSurface }}>50 km+</b>
        </div>
        <div className="track"><div className="fill" style={{ width: '100%' }} /><i className="knob" style={{ left: 'calc(100% - 11px)' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: ROLES.onSurfaceVariant, marginTop: 14 }}>
          <span>Distance</span><b style={{ color: ROLES.onSurface }}>12 km</b>
        </div>
        <div className="track"><div className="fill" style={{ width: '24%' }} /><i className="knob" style={{ left: 'calc(24% - 11px)' }} /></div>
      </div>
    ),
  },
  {
    category: 'Inputs',
    name: 'Chips',
    symbol: 'RagChipGroup · RagTagChip · RagSingleChoiceGroup',
    render: () => (
      <div className="phone">
        <div className="chips">
          {['Anything', 'Coffee', 'Movies', 'Dinner'].map((c, i) => (
            <span key={c} className={i === 1 ? 'chip on' : 'chip'}>{c}</span>
          ))}
        </div>
        <div className="chips" style={{ marginTop: 10 }}>
          {['Hindi', 'English', 'Kannada'].map((c) => <span key={c} className="chip tag">{c}</span>)}
        </div>
      </div>
    ),
  },
  {
    category: 'Inputs',
    name: 'Switch row',
    symbol: 'RagSwitchRow',
    render: () => (
      <div className="phone">
        {[['Go live', true], ['Pause bookings', false]].map(([l, on]) => (
          <div key={String(l)} className="srow">
            <span>{l}</span>
            <i className={on ? 'sw on' : 'sw'} />
          </div>
        ))}
      </div>
    ),
  },

  // ---- Status & badges ----
  {
    category: 'Status & badges',
    name: 'Status pill',
    symbol: 'RagStatusPill',
    note: 'Four tones. NO_SHOW_REVIEW is pending, NO_SHOW_DISMISSED is neutral — a dismissed claim is not a punishment.',
    render: () => (
      <div className="phone row wrap">
        <span className="pill pos">Confirmed</span>
        <span className="pill pend">Under review</span>
        <span className="pill neg">Cancelled</span>
        <span className="pill neu">Expired</span>
      </div>
    ),
  },
  {
    category: 'Status & badges',
    name: 'Trust badges',
    symbol: 'RagTrustBadge',
    render: () => (
      <div className="phone row wrap">
        <span className="trust">✓ Identity verified</span>
        <span className="trust">₹ Fixed price</span>
        <span className="trust">📍 Public place</span>
      </div>
    ),
  },
  {
    category: 'Status & badges',
    name: 'Avatar',
    symbol: 'RagAvatar',
    render: () => (
      <div className="phone row">
        {[32, 44, 56].map((s) => (
          <div key={s} style={{ width: s, height: s, borderRadius: '50%', background: FOREST.containerStrong, color: FOREST.deep, display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            M
          </div>
        ))}
      </div>
    ),
  },

  // ---- Rows & lists ----
  {
    category: 'Rows & lists',
    name: 'List row',
    symbol: 'RagListRow',
    render: () => (
      <div className="phone">
        {['Packages', 'Availability', 'Earnings'].map((l) => (
          <div key={l} className="lrow"><span>{l}</span><span className="chev">›</span></div>
        ))}
      </div>
    ),
  },
  {
    category: 'Rows & lists',
    name: 'Fact & receipt rows',
    symbol: 'RagFactRow · RagReceiptSummary',
    render: () => (
      <div className="phone">
        {[['Package', 'Coffee · 60 min'], ['Meeting area', 'Indiranagar'], ['Paid', '₹600']].map(([k, v]) => (
          <div key={k} className="frow"><span>{k}</span><b>{v}</b></div>
        ))}
        <div className="frow total"><span>Total</span><b>₹600</b></div>
      </div>
    ),
  },
  {
    category: 'Rows & lists',
    name: 'Section header',
    symbol: 'RagSection · RagSectionHeader',
    render: () => (
      <div className="phone">
        <div style={{ fontSize: 12, letterSpacing: '.09em', fontWeight: 700, color: ROLES.onSurfaceVariant }}>COMING UP</div>
        <div style={{ height: 1, background: ROLES.outlineVariant, margin: '8px 0' }} />
        <div style={{ color: ROLES.onSurfaceVariant, fontSize: 14 }}>Three outings this week</div>
      </div>
    ),
  },

  // ---- Feedback ----
  {
    category: 'Feedback',
    name: 'Notice banner',
    symbol: 'RagNoticeBanner',
    render: () => (
      <div className="phone">
        <div className="banner">
          <b>Get verified</b>
          <span>Verified guests are more likely to get accepted.</span>
          <span className="x">✕</span>
        </div>
      </div>
    ),
  },
  {
    category: 'Feedback',
    name: 'Empty & error',
    symbol: 'RagEmptyState · RagFullScreenError',
    render: () => (
      <div className="phone">
        <div className="empty">
          <div className="empty-ic">🔍</div>
          <b>No companions yet</b>
          <span>Try widening your distance or clearing filters.</span>
          <button style={{ ...btn, width: 'auto', padding: '0 18px', height: 44, background: 'transparent', border: `1px solid ${ROLES.onSurfaceVariant}`, color: ROLES.onSurface }}>
            Clear filters
          </button>
        </div>
      </div>
    ),
  },
  {
    category: 'Feedback',
    name: 'Skeletons',
    symbol: 'RagSkeletonLine · RagDiscoverCardSkeleton',
    render: () => (
      <div className="phone">
        <div className="sk" style={{ width: '62%' }} />
        <div className="sk" style={{ width: '90%' }} />
        <div className="sk" style={{ width: '45%' }} />
      </div>
    ),
  },
  {
    category: 'Feedback',
    name: 'Progress ring',
    symbol: 'RagProgressRing',
    render: () => (
      <div className="phone row">
        {[40, 75, 100].map((p) => (
          <div key={p} className="ring" style={{ background: `conic-gradient(${ROLES.primary} ${p * 3.6}deg, ${ROLES.surfaceVariant} 0)` }}>
            <span>{p}%</span>
          </div>
        ))}
      </div>
    ),
  },
];

const css = `
.ds { max-width: 1180px; }
.ds-head { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:18px; }
.ds h1 { margin:0 0 4px; font-size:22px; }
.ds-sub { margin:0; color:var(--text-muted); font-size:13px; max-width:640px; }
.ds-search { height:36px; border:1px solid var(--border); border-radius:8px; padding:0 12px; min-width:220px; }
.ds-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px; }
.ds-tab { background:var(--surface-muted); border:1px solid transparent; border-radius:999px; padding:6px 14px; font-size:13px; color:var(--text-muted); }
.ds-tab.active { background:var(--primary); border-color:var(--primary); color:#fff; font-weight:600; }
.ds-item { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px; margin-bottom:16px; }
.ds-item-head { display:flex; align-items:baseline; gap:10px; }
.ds-item h2 { margin:0; font-size:15px; }
.ds-item code { font-size:12px; color:var(--text-muted); background:var(--surface-muted); padding:2px 7px; border-radius:5px; }
.ds-note { margin:8px 0 0; font-size:13px; color:var(--text-muted); max-width:720px; }
.ds-canvas { margin-top:14px; background:#F7F9F8; border:1px solid var(--border); border-radius:10px; padding:18px; }
.phone { max-width:360px; display:flex; flex-direction:column; gap:10px; }
.phone.row { flex-direction:row; align-items:center; }
.phone.row.wrap { flex-wrap:wrap; }
.cap { font-size:11px; color:var(--text-muted); }
.grid-sw { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.sw i { display:block; height:40px; border-radius:6px; border:1px solid rgba(0,0,0,.08); }
.sw b { display:block; font-size:12px; margin-top:5px; }
.sw span { font-size:11px; color:var(--text-muted); }
.ramps { display:flex; flex-direction:column; gap:14px; }
.ramp-label { font-size:12px; font-weight:600; color:var(--text-muted); }
.ramp-steps { display:flex; gap:4px; margin-top:6px; flex-wrap:wrap; }
.ramp-step i { display:block; width:70px; height:34px; border-radius:5px; }
.ramp-step span { font-size:10px; color:var(--text-muted); }
.stack { display:flex; flex-direction:column; gap:12px; }
.type-row { display:flex; flex-direction:column; gap:2px; }
.type-meta { font-size:11px; color:var(--text-muted); }
.token-row { display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end; }
.token { text-align:center; }
.token i { display:block; margin:0 auto 5px; }
.token b { display:block; font-size:11px; }
.token span { font-size:10px; color:var(--text-muted); }
.pass { display:flex; border-radius:16px; overflow:hidden; color:#fff; min-height:96px; }
.pass-main { padding:14px 16px; flex:1; display:flex; flex-direction:column; gap:3px; }
.pass-eyebrow { font-size:11px; letter-spacing:.1em; font-weight:700; opacity:.8; }
.pass-title { font-size:17px; font-weight:600; }
.pass-sub { font-size:12px; opacity:.75; }
.pass-seam { width:0; border-left:2px dashed rgba(255,255,255,.45); margin:10px 0; }
.pass-stub { width:80px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; padding:10px 6px; }
.pass-stub span { font-size:10px; letter-spacing:.08em; opacity:.8; }
.pass-stub b { font-size:14px; }
.fl { font-size:12px; color:#536A77; font-weight:600; }
.field { border:1px solid #A1B4AC; border-radius:12px; padding:14px; background:#fff; }
.field.err { border-color:#DC2626; color:#6b7780; }
.errtext { color:#DC2626; font-size:12px; }
.track { position:relative; height:4px; background:#E6EBE9; border-radius:999px; margin-top:8px; }
.fill { position:absolute; height:4px; background:#1F4D3A; border-radius:999px; }
.knob { position:absolute; top:-9px; width:22px; height:22px; border-radius:50%; background:#1F4D3A; }
.chips { display:flex; gap:7px; flex-wrap:wrap; }
.chip { border:1px solid #A1B4AC; border-radius:10px; padding:7px 13px; font-size:13px; background:#fff; }
.chip.on { background:#1F4D3A; border-color:#1F4D3A; color:#fff; font-weight:600; }
.chip.tag { background:#DCEAE2; border-color:transparent; color:#1F4D3A; font-size:12px; }
.srow { display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #D7DFDC; border-radius:12px; padding:14px 16px; }
.sw { width:44px; height:26px; border-radius:999px; background:#D7DFDC; position:relative; }
.sw.on { background:#1F4D3A; }
.sw::after { content:''; position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; }
.sw.on::after { left:21px; }
.pill { font-size:12px; font-weight:600; padding:5px 11px; border-radius:999px; }
.pill.pos { background:#DCEAE2; color:#1F4D3A; }
.pill.pend { background:#F8E2D5; color:#76331F; }
.pill.neg { background:#FEE2E2; color:#7F1D1D; }
.pill.neu { background:#E6EBE9; color:#536A77; }
.trust { background:#fff; border:1px solid #D7DFDC; border-radius:999px; padding:6px 12px; font-size:12px; }
.lrow { display:flex; justify-content:space-between; background:#fff; border:1px solid #D7DFDC; border-radius:12px; padding:15px 16px; }
.chev { color:#536A77; }
.frow { display:flex; justify-content:space-between; font-size:14px; padding:9px 0; border-bottom:1px solid #E6EBE9; }
.frow span { color:#536A77; }
.frow.total { border-bottom:none; font-size:16px; }
.banner { position:relative; background:#DDE3EC; border-radius:14px; padding:14px 38px 14px 16px; display:flex; flex-direction:column; gap:3px; }
.banner b { font-size:15px; color:#2B3F5E; }
.banner span { font-size:13px; color:#3A5477; }
.banner .x { position:absolute; top:10px; right:12px; color:#3A5477; }
.empty { text-align:center; display:flex; flex-direction:column; align-items:center; gap:7px; padding:22px 0; }
.empty-ic { font-size:30px; }
.empty b { font-size:16px; }
.empty span { font-size:13px; color:#536A77; }
.sk { height:13px; border-radius:6px; background:linear-gradient(90deg,#E6EBE9,#F2F5F3,#E6EBE9); }
.ring { width:66px; height:66px; border-radius:50%; display:grid; place-items:center; }
.ring span { width:48px; height:48px; border-radius:50%; background:#fff; display:grid; place-items:center; font-size:13px; font-weight:700; }
`;
