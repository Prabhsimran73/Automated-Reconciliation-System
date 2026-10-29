import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  RotateCcw,
  Check,
  Shield,
  Save,
  CheckCircle2,
  Cpu,
  Calendar,
  Hash,
  FileText,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { settings, updateSettings, resetDemoData } = useReconciliation();
  const { user, logout, quickLogin, demoAccounts } = useAuth();

  const [formState, setFormState] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key) => {
    setFormState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNotifToggle = (key) => {
    setFormState(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all bank transactions, ledger records, and settings back to original demo values?")) {
      resetDemoData();
      setFormState(settings);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure heuristic reconciliation parameters, tolerance windows, and notification alerts.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={15} />
            <span>Reset Demo Data</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saveSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{saveSuccess ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          color: '#047857',
          fontWeight: 600,
          fontSize: '13.5px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>Settings successfully applied to the automated reconciliation engine.</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Section 1: Reconciliation Rules (Requirement 15) */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Reconciliation Matching Rules</h3>
              <span className="panel-card-subtitle">Enable or disable specific heuristic scoring criteria</span>
            </div>
            <span className="score-pill score-high">Core Engine</span>
          </div>

          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Amount Matching */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Amount Matching
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Strict mathematical equality between bank credit/debit and accounting ledger amounts.
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input
                  type="checkbox"
                  checked={formState.amountMatching}
                  onChange={() => handleToggle('amountMatching')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  backgroundColor: formState.amountMatching ? 'var(--primary-600)' : '#cbd5e1',
                  borderRadius: 24, transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: 18, width: 18, left: formState.amountMatching ? 23 : 3, bottom: 3,
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            {/* Date Matching & Tolerance */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Date Matching & Clearance Tolerance
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Allow clearance timing gap between bank settlement date and ledger entry date.
                </div>
                {formState.dateMatching && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Tolerance window:</span>
                    <select
                      className="filter-select"
                      style={{ padding: '4px 10px', fontSize: '12.5px' }}
                      value={formState.dateToleranceDays}
                      onChange={(e) => setFormState(prev => ({ ...prev, dateToleranceDays: Number(e.target.value) }))}
                    >
                      <option value="0">0 Days (Same Date Only)</option>
                      <option value="1">± 1 Day</option>
                      <option value="2">± 2 Days (Standard)</option>
                      <option value="3">± 3 Days</option>
                      <option value="5">± 5 Days (Cheque Clearing)</option>
                      <option value="7">± 7 Days (Weekend Buffer)</option>
                    </select>
                  </div>
                )}
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input
                  type="checkbox"
                  checked={formState.dateMatching}
                  onChange={() => handleToggle('dateMatching')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  backgroundColor: formState.dateMatching ? 'var(--primary-600)' : '#cbd5e1',
                  borderRadius: 24, transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: 18, width: 18, left: formState.dateMatching ? 23 : 3, bottom: 3,
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            {/* Reference Matching */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Reference Number Matching
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Cross-verify NEFT/RTGS UTR numbers, UPI IDs, and Cheque serials.
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input
                  type="checkbox"
                  checked={formState.referenceMatching}
                  onChange={() => handleToggle('referenceMatching')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  backgroundColor: formState.referenceMatching ? 'var(--primary-600)' : '#cbd5e1',
                  borderRadius: 24, transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: 18, width: 18, left: formState.referenceMatching ? 23 : 3, bottom: 3,
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            {/* Description Matching */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Fuzzy Description & Narration Matching
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Use natural language token similarity for vendor names and remarks.
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input
                  type="checkbox"
                  checked={formState.descriptionMatching}
                  onChange={() => handleToggle('descriptionMatching')}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', inset: 0,
                  backgroundColor: formState.descriptionMatching ? 'var(--primary-600)' : '#cbd5e1',
                  borderRadius: 24, transition: '0.2s'
                }}>
                  <span style={{
                    position: 'absolute', content: '', height: 18, width: 18, left: formState.descriptionMatching ? 23 : 3, bottom: 3,
                    backgroundColor: 'white', borderRadius: '50%', transition: '0.2s'
                  }} />
                </span>
              </label>
            </div>

            {/* Matching Threshold Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Matching Confidence Threshold</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>{formState.matchingThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={formState.matchingThreshold}
                onChange={(e) => setFormState(prev => ({ ...prev, matchingThreshold: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--primary-600)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>50% (Loose Matching)</span>
                <span>80% (Recommended)</span>
                <span>100% (Strict Exact Match)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Notification Settings (Requirement 15) */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Notification Settings</h3>
              <span className="panel-card-subtitle">Manage automated auditor alerts and event dispatches</span>
            </div>
            <Bell size={18} color="#64748b" />
          </div>

          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Notif 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Reconciliation Completed</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Send notification badge when batch reconciliation finishes.</div>
              </div>
              <input
                type="checkbox"
                checked={formState.notifications?.reconciliationCompleted}
                onChange={() => handleNotifToggle('reconciliationCompleted')}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

            {/* Notif 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px' }}>New Discrepancy Detected</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Trigger warning alert when amount or date variance exceeds thresholds.</div>
              </div>
              <input
                type="checkbox"
                checked={formState.notifications?.newDiscrepancyDetected}
                onChange={() => handleNotifToggle('newDiscrepancyDetected')}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

            {/* Notif 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Report Generated</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Alert when monthly audit and reconciliation statements are ready.</div>
              </div>
              <input
                type="checkbox"
                checked={formState.notifications?.reportGenerated}
                onChange={() => handleNotifToggle('reportGenerated')}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
            </div>

          </div>
        </div>

        {/* Section 3: Active User Session & Access Control */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="panel-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="panel-title">Active Security Session & Role</h3>
              <p className="panel-desc">Manage the currently authenticated institutional user account and privileges.</p>
            </div>
          </div>

          <div className="panel-card-body">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: user?.badgeColor || 'var(--primary-600)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  {user?.avatar || 'AD'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                    {user?.name || 'Administrator'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {user?.email || 'admin@reconcile.local'} &bull; <strong style={{ color: 'var(--primary-700)' }}>{user?.role || 'Administrator'}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    Department: {user?.department || 'Finance & Systems'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>
                  Switch Role:
                </div>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '11.5px',
                      padding: '4px 10px',
                      borderColor: user?.username === acc.username ? acc.badgeColor : undefined,
                      fontWeight: user?.username === acc.username ? 700 : 500
                    }}
                    onClick={() => quickLogin(acc.username)}
                  >
                    {acc.name.split(' ')[0]}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: '12px', padding: '6px 12px', marginLeft: '6px' }}
                  onClick={() => {
                    if (window.confirm('Sign out of system?')) {
                      logout();
                    }
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Project Meta Details */}
        <div className="panel-card" style={{ background: '#f8fafc' }}>
          <div className="panel-card-body">
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Project Information</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div><strong>Project Title:</strong> Automated Reconciliation System</div>
              <div><strong>Academic Scope:</strong> BCA Minor Project 2026</div>
              <div><strong>Architecture:</strong> Single-Page React Web Application (Client-Side Heuristic Reconciliation Engine)</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
