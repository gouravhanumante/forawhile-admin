import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { ApiError, apiClient, type AdminEnvironment } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const PHONE_PREFIX = '+91';
const NATIONAL_NUMBER_LENGTH = 10;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function environmentLabel(environment: AdminEnvironment): string {
  switch (environment) {
    case 'staging':
      return 'Staging';
    case 'local':
      return 'Local';
    default:
      return 'Production';
  }
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nationalNumber, setNationalNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [environment, setEnvironment] = useState<AdminEnvironment>(apiClient.environment());

  const phone = `${PHONE_PREFIX}${nationalNumber}`;
  const canSubmit = nationalNumber.length === NATIONAL_NUMBER_LENGTH && password.length > 0;

  async function signIn() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.login(phone, password);
      if (!result.user.roles.includes('ADMIN')) {
        setError('This account does not have admin access.');
        return;
      }
      login(result);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeEnvironment(next: AdminEnvironment) {
    apiClient.setEnvironment(next);
    setEnvironment(next);
    setPassword('');
    setError(null);
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h2>Admin sign in</h2>
        <div className="field">
          <label htmlFor="login-environment">Environment</label>
          <select id="login-environment" value={environment} onChange={(event) => changeEnvironment(event.target.value as AdminEnvironment)}>
            <option value="production">{environmentLabel('production')}</option>
            <option value="staging">{environmentLabel('staging')}</option>
            <option value="local">{environmentLabel('local')}</option>
          </select>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit && !isSubmitting) void signIn();
          }}
        >
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <div className="phone-input">
              <span className="phone-prefix">{PHONE_PREFIX}</span>
              <input
                id="phone"
                value={nationalNumber}
                onChange={(e) => setNationalNumber(onlyDigits(e.target.value).slice(0, NATIONAL_NUMBER_LENGTH))}
                placeholder="9000000000"
                inputMode="numeric"
                autoComplete="username"
                maxLength={NATIONAL_NUMBER_LENGTH}
                autoFocus
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>      </div>
    </div>
  );
}
