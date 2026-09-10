import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiClient, type AdminEnvironment } from '../api/client';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/verifications', label: 'Verifications' },
  { to: '/customer-verifications', label: 'Booker verifications' },
  { to: '/reports', label: 'Reports' },
  { to: '/users', label: 'Users' },
  { to: '/escrow', label: 'Escrow' },
  { to: '/payouts', label: 'Payouts' },
  { to: '/broadcast', label: 'Broadcast' },
  { to: '/notices', label: 'Notices' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/settings', label: 'Business settings' },
  { to: '/audit-log', label: 'Audit log' },
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
        <h1>ForAWhile Admin</h1>
        <label className="muted" htmlFor="admin-environment">Environment</label>
        <select id="admin-environment" value={environment} onChange={(event) => switchEnvironment(event.target.value as AdminEnvironment)}>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="local">Local</option>
        </select>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            {link.label}
          </NavLink>
        ))}
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
        <Outlet />
      </main>
    </div>
  );
}
