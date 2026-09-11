import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient, type AdminEnvironment } from '../api/client';

const sections: Array<{ label: string; links: Array<{ to: string; label: string; end?: boolean }> }> = [
  { label: 'Workspace', links: [{ to: '/', label: 'Overview', end: true }] },
  {
    label: 'Review queues',
    links: [
      { to: '/verifications', label: 'Companion verification' },
      { to: '/customer-verifications', label: 'Booker verification' },
      { to: '/reports', label: 'Reports' },
      { to: '/no-show-claims', label: 'No-show review' },
    ],
  },
  {
    label: 'Money & people',
    links: [
      { to: '/users', label: 'Users' },
      { to: '/escrow', label: 'Escrow' },
      { to: '/payouts', label: 'Payouts' },
    ],
  },
  {
    label: 'Configuration',
    links: [
      { to: '/broadcast', label: 'Broadcast' },
      { to: '/notices', label: 'Notices' },
      { to: '/catalog', label: 'Catalog' },
      { to: '/settings', label: 'Business settings' },
      { to: '/audit-log', label: 'Audit log' },
      { to: '/design-system', label: 'Design system' },
    ],
  },
];

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const environment = apiClient.environment();

  function switchEnvironment(next: AdminEnvironment) {
    apiClient.setEnvironment(next);
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">FA</span>
          <div><h1>ForAWhile</h1><span>Operations console</span></div>
        </div>
        <label className="eyebrow" htmlFor="admin-environment">Environment</label>
        <select id="admin-environment" value={environment} onChange={(event) => switchEnvironment(event.target.value as AdminEnvironment)}>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="local">Local</option>
        </select>
        <div className="sidebar-links">
          {sections.map((section) => (
            <div className="nav-section" key={section.label}>
              <span className="eyebrow nav-section-label">{section.label}</span>
              {section.links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <button
          className="logout"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Sign out
        </button>
      </nav>
      <main className="content">
        <div className="content-topbar">
          <span className="status-dot" />
          <span>{environment === 'production' ? 'Production environment' : `${environment} environment`}</span>
          <span className="topbar-divider" />
          <span className="muted">Restricted admin access</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
