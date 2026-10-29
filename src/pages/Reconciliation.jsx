import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { formatPercent, formatDate } from '../utils/formatters';

export const Reconciliation = () => {
  const navigate = useNavigate();
  const {
    runReconciliation,
    isReconciling,
    reconciliationProgress,
    currentStepIndex,
    reconciliationSteps,
    reconciliationResults,
    lastReconciliationDate,
    settings,
    updateSettings
  } = useReconciliation();

  const [activeThreshold, setActiveThreshold] = useState(settings.matchingThreshold || 80);
  const [completedNotification, setCompletedNotification] = useState(false);

  const stats = reconciliationResults?.stats || {
    totalProcessed: 1250,
    matched: 1180,
    unmatched: 50,
    discrepancies: 20,
    matchRate: 94.4
  };

  const handleStartRecon = async () => {
    setCompletedNotification(false);
    await runReconciliation({
      ...settings,
      matchingThreshold: activeThreshold
    });
    setCompletedNotification(true);
  };

  return (
    <div>
      {/* Hero Banner (Requirement 10) */}
      <div className="recon-hero-card">
        <div className="recon-hero-content">
          <div className="recon-hero-badge">
            <Sparkles size={14} />
            <span>AI-Assisted Financial Engine</span>
          </div>

          <h1 className="recon-hero-title">Automated Reconciliation</h1>
          <p className="recon-hero-desc">
            The system automatically compares bank transactions with accounting records based on transaction amount, date, reference number and description.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              className="recon-run-btn"
              onClick={handleStartRecon}
              disabled={isReconciling}
            >
              {isReconciling ? (
                <>
                  <RotateCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processing Engine...</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>Run Reconciliation</span>
                </>
              )}
            </button>

            <span style={{ fontSize: '13px', color: '#c7d2fe' }}>
              Last executed: {lastReconciliationDate ? formatDate(lastReconciliationDate) : 'Today'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Live Multi-Step Simulation (Requirement 10 & 19) */}
      {isReconciling && (
        <div className="sim-progress-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <RotateCw size={22} color="var(--primary-600)" style={{ animation: 'spin 1.2s linear infinite' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
              {reconciliationSteps[currentStepIndex]?.name || 'Reconciling Data Feeds...'}
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {reconciliationSteps[currentStepIndex]?.detail || 'Executing multi-criteria heuristic matching'}
          </p>

          {/* Progress Bar */}
          <div className="sim-progress-bar-wrap">
            <div
              className="sim-progress-bar-fill"
              style={{ width: `${reconciliationProgress}%` }}
            />
          </div>

          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-700)' }}>
            {reconciliationProgress}% Completed
          </div>

          {/* Step Sequence Badges */}
          <div className="sim-step-list">
            {reconciliationSteps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`sim-step-item ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '2px', color: isDone ? '#047857' : isCurrent ? 'var(--primary-700)' : '#64748b' }}>
                    Step {idx + 1}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                    {step.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Banner (Requirement 10) */}
      {!isReconciling && (
        <div className="panel-card" style={{ borderColor: '#a7f3d0', background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', marginBottom: '24px' }}>
          <div className="panel-card-header" style={{ background: 'transparent', borderBottom: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#065f46' }}>
                  Reconciliation Completed Successfully
                </h3>
                <span style={{ fontSize: '13px', color: '#047857' }}>
                  All bank feeds and accounting ledgers have been synchronized and audited.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/matches')}>
                <span>View Matches</span>
                <ArrowRight size={13} />
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => navigate('/discrepancies')}>
                <span>Review Discrepancies</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Results Summary Metrics (Requirement 10) */}
          <div className="panel-card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ background: '#ffffff', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Records Processed</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                  {stats.totalProcessed.toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '12.5px', color: '#047857', fontWeight: 600 }}>Matched</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {stats.matched.toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid #fef3c7' }}>
                <span style={{ fontSize: '12.5px', color: '#92400e', fontWeight: 600 }}>Unmatched</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                  {stats.unmatched.toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '12.5px', color: '#991b1b', fontWeight: 600 }}>Discrepancies</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  {stats.discrepancies.toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--primary-800)', fontWeight: 600 }}>Match Rate</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-600)', marginTop: '4px' }}>
                  {formatPercent(stats.matchRate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matching Logic Criteria Matrix (Requirement 11) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Matching Engine Logic & Confidence Tiers</h3>
            <span className="panel-card-subtitle">Automated multi-attribute scoring model utilized during reconciliation</span>
          </div>
          <span className="score-pill score-100">Algorithmic Scoring</span>
        </div>

        <div className="panel-card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {/* Criteria 1 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Exact Match Tier</span>
                <span className="score-pill score-100">100% Match</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Exact transaction amount + Exact reference number + Identical clearance date.
              </p>
              <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600, marginTop: '8px' }}>
                ✓ Auto-reconciled with zero manual review needed.
              </div>
            </div>

            {/* Criteria 2 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Reference Match Tier</span>
                <span className="score-pill score-high">90% - 95% Match</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Exact amount + Reference match with slight date variance (cheque / NEFT clearing gap).
              </p>
              <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600, marginTop: '8px' }}>
                ✓ High confidence match within date tolerance window.
              </div>
            </div>

            {/* Criteria 3 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Date Proximity Tier</span>
                <span className="score-pill score-med">80% - 85% Match</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Exact amount + Date within ±2 days + Partial description keyword overlap.
              </p>
              <div style={{ fontSize: '11.5px', color: '#854d0e', fontWeight: 600, marginTop: '8px' }}>
                ✓ Matched via heuristic proximity analysis.
              </div>
            </div>

            {/* Criteria 4 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Fuzzy Description Tier</span>
                <span className="score-pill score-med">70% Match</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Partial description / vendor name match without matching reference code.
              </p>
              <div style={{ fontSize: '11.5px', color: '#854d0e', fontWeight: 600, marginTop: '8px' }}>
                ✓ Flagged for secondary audit verification.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Tuner */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Live Confidence Threshold Slider</h3>
            <span className="panel-card-subtitle">Adjust minimum score required for auto-matching</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-600)' }}>
            Threshold: {activeThreshold}%
          </span>
        </div>

        <div className="panel-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={activeThreshold}
              onChange={(e) => setActiveThreshold(Number(e.target.value))}
              style={{ flex: 1, minWidth: '240px', accentColor: 'var(--primary-600)' }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleStartRecon}
            >
              <RefreshCw size={13} />
              <span>Re-run with {activeThreshold}% Threshold</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
