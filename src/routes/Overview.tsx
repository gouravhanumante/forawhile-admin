import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminOverview } from '../api/admin';
import { ApiError } from '../api/client';

export function Overview() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .overview()
      .then(setOverview)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the overview.'));
  }, []);

  return (
    <div>
      <h2>Overview</h2>
      {error && <p className="error-text">{error}</p>}
      {overview && (
        <div className="stat-grid">
          <Link className="stat-card" to="/verifications">
            <div className="value">{overview.pendingVerifications}</div>
            <div className="muted">Pending companion verifications</div>
          </Link>
          <Link className="stat-card" to="/customer-verifications">
            <div className="value">{overview.pendingCustomerVerifications}</div>
            <div className="muted">Pending booker verifications</div>
          </Link>
          <Link className="stat-card" to="/reports">
            <div className="value">{overview.openReports}</div>
            <div className="muted">Open reports</div>
          </Link>
          <Link className="stat-card" to="/escrow">
            <div className="value">{overview.heldPayments}</div>
            <div className="muted">Held payments</div>
          </Link>
          <div className="stat-card">
            <div className="value">{overview.pendingPayments}</div>
            <div className="muted">Pending payments</div>
          </div>
        </div>
      )}
    </div>
  );
}
