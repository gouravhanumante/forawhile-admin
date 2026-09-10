import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Login } from './routes/Login';
import { Layout } from './routes/Layout';
import { Overview } from './routes/Overview';
import { VerificationQueue } from './routes/VerificationQueue';
import { CustomerVerificationQueue } from './routes/CustomerVerificationQueue';
import { ReportsQueue } from './routes/ReportsQueue';
import { Users } from './routes/Users';
import { EscrowQueue } from './routes/EscrowQueue';
import { Payouts } from './routes/Payouts';
import { Broadcast } from './routes/Broadcast';
import { Notices } from './routes/Notices';
import { AuditLog } from './routes/AuditLog';
import { Catalog } from './routes/Catalog';
import { Settings } from './routes/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/verifications" element={<VerificationQueue />} />
          <Route path="/customer-verifications" element={<CustomerVerificationQueue />} />
          <Route path="/reports" element={<ReportsQueue />} />
          <Route path="/users" element={<Users />} />
          <Route path="/escrow" element={<EscrowQueue />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Route>
      </Route>
    </Routes>
  );
}
