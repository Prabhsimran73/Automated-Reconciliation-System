import React, { useState } from 'react';
import {
  Download,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Landmark,
  BookOpen,
  Percent,
  Check,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatCard } from '../components/common/StatCard';
import { AuditReportModal } from '../components/modals/AuditReportModal';
import { formatPercent, formatCurrency, formatDate } from '../utils/formatters';
import { exportFullReconciliationReport } from '../utils/exportCsv';

export const Reports = () => {
  const {
    reconciliationResults,
    monthlyHistory,
    bankTransactions,
    accountingRecords
  } = useReconciliation();

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const stats = reconciliationResults?.stats || {
    totalProcessed: 1250,
    matched: 1180,
    unmatched: 50,
    discrepancies: 20,
    matchRate: 94.4
  };

  const matches = reconciliationResults?.matchedPairs || [];
  const discrepancies = reconciliationResults?.discrepancies || [];
  const resolvedCount = discrepancies.filter(d => d.status === 'Resolved').length;

  const handleExportCSV = () => {
    exportFullReconciliationReport(
      bankTransactions,
      accountingRecords,
      matches,
      discrepancies,
      {
        ...stats,
        resolvedDiscrepancies: resolvedCount
      }
    );
  };

  // Efficiency trend chart data
  const trendData = monthlyHistory.map(m => ({
    month: m.month.substring(0, 3),
    'Match Rate (%)': m.matchRate,
    'Discrepancies': m.discrepancies
  }));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reconciliation Reports</h1>
          <p className="page-subtitle">Generate regulatory audit summaries, variance analytics, and download CSV reports.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAuditModalOpen(true)}>
            <FileText size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Grid (Requirement 14) */}
      <div className="stats-grid">
        <StatCard
          label="Total Transactions"
          value={stats.totalProcessed.toLocaleString()}
          icon={Landmark}
          iconColor="blue"
          trend="100% Processed"
          trendType="positive"
        />

        <StatCard
          label="Matched Transactions"
          value={stats.matched.toLocaleString()}
          icon={CheckCircle2}
          iconColor="green"
          trend={`${stats.matchRate}% Rate`}
          trendType="positive"
        />

        <StatCard
          label="Unmatched Transactions"
          value={stats.unmatched.toLocaleString()}
          icon={Clock}
          iconColor="amber"
          trend="In Queue"
          trendType="neutral"
        />

        <StatCard
          label="Total Discrepancies"
          value={discrepancies.length.toLocaleString()}
          icon={AlertTriangle}
          iconColor="red"
          trend="Audit Flagged"
          trendType="negative"
        />

        <StatCard
          label="Resolved Discrepancies"
          value={resolvedCount.toLocaleString()}
          icon={Check}
          iconColor="purple"
          trend={`${discrepancies.length ? Math.round((resolvedCount / discrepancies.length) * 100) : 100}% Closed`}
          trendType="positive"
        />

        <StatCard
          label="Match Rate"
          value={formatPercent(stats.matchRate)}
          icon={Percent}
          iconColor="blue"
          trend="Target > 90%"
          trendType="positive"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Chart 1: Historical Efficiency */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Match Rate Efficiency Trend (%)</h3>
              <span className="panel-card-subtitle">Monthly percentage of auto-reconciled records</span>
            </div>
            <span className="score-pill score-100">Benchmark: &gt;92%</span>
          </div>
          <div className="panel-card-body" style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="Match Rate (%)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#rateGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Discrepancies Resolution Breakdown */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Monthly Discrepancies Volume</h3>
              <span className="panel-card-subtitle">Number of exceptions flagged by audit engine</span>
            </div>
          </div>
          <div className="panel-card-body" style={{ height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="Discrepancies" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Audit Statement Snapshot Panel */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Executive Summary & Audit Sign-off</h3>
            <span className="panel-card-subtitle">Automated ledger certification summary</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsAuditModalOpen(true)}>
            <Printer size={13} />
            <span>Printable View</span>
          </button>
        </div>

        <div className="panel-card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px'
          }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Bank Feed Reconciliation
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                {bankTransactions.length} Statements
              </div>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '4px' }}>
                ✓ {bankTransactions.filter(b => b.status === 'Matched').length} fully matched to general ledger
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                General Ledger Verification
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                {accountingRecords.length} Ledger Vouchers
              </div>
              <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '4px' }}>
                ✓ {accountingRecords.filter(a => a.status === 'Matched').length} confirmed against bank settlement
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Exception Resolution Status
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                {resolvedCount} / {discrepancies.length} Resolved
              </div>
              <div style={{ fontSize: '12.5px', color: discrepancies.length - resolvedCount > 0 ? '#b91c1c' : '#047857', marginTop: '4px' }}>
                {discrepancies.length - resolvedCount > 0 ? `⚠ ${discrepancies.length - resolvedCount} items pending auditor action` : '✓ All items reconciled and resolved'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Audit Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        stats={stats}
        matches={matches}
        discrepancies={discrepancies}
        bankTxns={bankTransactions}
        accRecords={accountingRecords}
      />
    </div>
  );
};
