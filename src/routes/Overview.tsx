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
    <div className="overview-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Today at a glance</span>
          <h2>Operations overview</h2>
          <p className="page-lede">Keep trust, safety, and payouts moving across the marketplace.</p>
        </div>
        <div className="heading-meta">
          <span className="live-indicator"><span className="status-dot" /> Live data</span>
          <span className="muted">Just now</span>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {overview && (
        <>
          <section className="attention-panel">
            <div>
              <span className="eyebrow">Priority queue</span>
              <h3>Companion verification</h3>
              <p>Identity reviews are waiting for an admin decision.</p>
            </div>
            <div className="attention-count">{overview.pendingVerifications}</div>
            <Link className="btn btn-primary" to="/verifications">Review queue <span aria-hidden="true">-&gt;</span></Link>
          </section>
          <div className="stat-grid">
          <Link className="stat-card stat-card-teal" to="/customer-verifications">
            <span className="card-kicker">Review</span>
            <div className="value">{overview.pendingCustomerVerifications}</div>
            <div className="stat-label">Pending booker verifications</div>
            <span className="stat-action">Open queue <span aria-hidden="true">-&gt;</span></span>
          </Link>
          <Link className="stat-card stat-card-coral" to="/reports">
            <span className="card-kicker">Safety</span>
            <div className="value">{overview.openReports}</div>
            <div className="stat-label">Open reports</div>
            <span className="stat-action">Investigate <span aria-hidden="true">-&gt;</span></span>
          </Link>
          <Link className="stat-card stat-card-amber" to="/escrow">
            <span className="card-kicker">Escrow</span>
            <div className="value">{overview.heldPayments}</div>
            <div className="stat-label">Held payments</div>
            <span className="stat-action">View payments <span aria-hidden="true">-&gt;</span></span>
          </Link>
          <Link className="stat-card stat-card-slate" to="/payouts">
            <span className="card-kicker">Finance</span>
            <div className="value">{overview.pendingPayments}</div>
            <div className="stat-label">Pending payments</div>
            <span className="stat-action">Open payouts <span aria-hidden="true">-&gt;</span></span>
          </Link>
          </div>
          <div className="overview-footer">
            <div><span className="eyebrow">Admin rhythm</span><strong>Review the queues from highest risk to lowest.</strong></div>
            <Link to="/audit-log">See recent admin activity <span aria-hidden="true">-&gt;</span></Link>
          </div>
        </>
      )}
    </div>
  );
}
