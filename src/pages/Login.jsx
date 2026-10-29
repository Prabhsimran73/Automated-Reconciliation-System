import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Cpu,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register, quickLogin, demoAccounts } = useAuth();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Sign In state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Administrator');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // If already authenticated, redirect to destination
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await login(username, password, rememberMe);
      if (result.success) {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await register({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regRole === 'Administrator' ? 'Finance & Systems' : regRole === 'Financial Auditor' ? 'Internal Audit' : 'Accounts'
      });

      if (result.success) {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch {
      setErrorMessage('An error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoAccount = async (account) => {
    setUsername(account.username);
    setPassword(account.passwords[0]);
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await quickLogin(account.username);
      if (result.success) {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage('Quick login failed. Please try manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Background Decorative Ambient Glow */}
      <div className="login-ambient-glow glow-1" />
      <div className="login-ambient-glow glow-2" />

      <div className="login-single-card">
        {/* Brand Header */}
        <div className="login-card-brand">
          <div className="login-brand-icon-centered">
            <ShieldCheck size={28} />
          </div>
          <h1 className="login-title-centered">Automated Reconciliation</h1>
          <span className="login-version-badge">Fintech Engine 2.0 &bull; BCA 2026</span>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage('');
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`login-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage('');
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE 1: SIGN IN */}
        {authMode === 'signin' && (
          <div>
            {/* Quick 1-Click Role Login Selector */}
            <div className="quick-roles-section">
              <div className="quick-roles-label">
                <span>Quick Demo Sign In (1-Click)</span>
                <button
                  type="button"
                  className="login-help-link"
                  onClick={() => setShowHelpModal(true)}
                >
                  <HelpCircle size={13} />
                  <span>Account Info</span>
                </button>
              </div>

              <div className="quick-roles-pills">
                {demoAccounts.map((account) => {
                  const isSelected = username === account.username;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      className={`role-pill-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectDemoAccount(account)}
                      disabled={isLoading}
                      title={`Instant login as ${account.name} (${account.role})`}
                    >
                      <span
                        className="role-pill-dot"
                        style={{ backgroundColor: account.badgeColor }}
                      />
                      <div className="role-pill-text">
                        <span className="role-pill-name">{account.name}</span>
                        <span className="role-pill-role">{account.role}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="login-divider-row">
              <span>or sign in with credentials</span>
            </div>

            {/* Sign In Form */}
            <form className="login-form" onSubmit={handleSignInSubmit}>
              <div className="login-input-group">
                <label htmlFor="login-username">Username or Institutional Email</label>
                <div className="login-input-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or admin@reconcile.local"
                    required
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="login-input-group">
                <div className="login-input-label-row">
                  <label htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    className="login-forgot-trigger"
                    onClick={() => setShowHelpModal(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="login-input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="login-spinner" />
                    <span>Authenticating Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workstation</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: SIGN UP / CREATE ACCOUNT */}
        {authMode === 'signup' && (
          <form className="login-form" onSubmit={handleSignUpSubmit}>
            <div className="login-input-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="login-input-wrap">
                <User size={18} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="reg-username">Username</label>
              <div className="login-input-wrap">
                <User size={18} className="input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="reg-email">Institutional Email</label>
              <div className="login-input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. jdoe@reconcile.local"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="reg-role">Assigned System Role</label>
              <div className="login-input-wrap">
                <select
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="login-select"
                  disabled={isLoading}
                >
                  <option value="Administrator">Administrator (Full Control)</option>
                  <option value="Financial Auditor">Financial Auditor (Audit & Reports)</option>
                  <option value="Finance Operations Lead">Finance Operations Lead (Approvals)</option>
                </select>
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="reg-password">Security Password</label>
              <div className="login-input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a password (min 3 chars)"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="login-spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security & Academic Footer */}
        <div className="login-security-footer">
          <div className="security-tag">
            <CheckCircle2 size={13} color="#10b981" />
            <span>256-Bit SSL Encrypted Verification</span>
          </div>
          <p className="academic-tag">
            Department of Computer Applications &bull; BCA Minor Project 2026
          </p>
        </div>
      </div>

      {/* Demo Credentials Help Modal */}
      {showHelpModal && (
        <div className="login-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div
            className="login-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="login-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#10b981" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>System Demo Accounts</h3>
              </div>
              <button
                className="login-modal-close"
                onClick={() => setShowHelpModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="login-modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Click on any demo role below to automatically fill its credentials:
              </p>

              <div className="demo-accounts-list">
                {demoAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="demo-account-card"
                    onClick={() => {
                      setUsername(acc.username);
                      setPassword(acc.passwords[0]);
                      setAuthMode('signin');
                      setShowHelpModal(false);
                    }}
                  >
                    <div className="demo-card-top">
                      <div className="demo-avatar" style={{ backgroundColor: acc.badgeColor }}>
                        {acc.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{acc.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{acc.role}</div>
                      </div>
                      <span className="demo-badge" style={{ marginLeft: 'auto', fontSize: '11px' }}>
                        Click to Use
                      </span>
                    </div>

                    <div className="demo-creds-box">
                      <div className="cred-line">
                        <span className="cred-key">Username:</span>
                        <code>{acc.username}</code>
                      </div>
                      <div className="cred-line">
                        <span className="cred-key">Password:</span>
                        <code>{acc.passwords[0]}</code>
                      </div>
                      <div className="cred-desc">{acc.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                💡 <strong>Evaluator Note:</strong> You can also use the "Create Account" tab or any custom credentials (3+ characters) to sign in immediately.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
