import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Percent,
  Play,
  RotateCw,
  TrendingUp,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TransactionDetailModal } from '../components/modals/TransactionDetailModal';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    reconciliationResults,
    recentActivities,
    monthlyHistory,
    runReconciliation,
    isReconciling,
    bankTransactions,
    accountingRecords
  } = useReconciliation();

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = reconciliationResults?.stats || {
    totalBankTransactions: 1250,
    totalAccountingRecords: 1230,
    matched: 1180,
    unmatched: 50,
    discrepancies: 20,
    matchRate: 94.4
  };

  // Pie Chart Data (Reconciliation Status)
  const statusPieData = [
    { name: 'Matched', value: stats.matched, color: '#10b981' },
    { name: 'Unmatched', value: stats.unmatched, color: '#f59e0b' },
    { name: 'Discrepancies', value: stats.discrepancies, color: '#ef4444' }
  ];

  // Transaction Comparison Data
  const comparisonData = monthlyHistory.map(item => ({
    name: item.month.substring(0, 3),
    'Bank Txns': item.bankTxns,
    'Accounting Records': item.accountingRecords,
    'Matched': item.matched
  }));

  const handleViewDetails = (item) => {
    const foundBank = bankTransactions.find(b => b.id === item.bankTxn);
    if (foundBank) {
      setSelectedTxn(foundBank);
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      {/* Top Title & Subtitle */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Automated Reconciliation Dashboard</h1>
          <p className="page-subtitle">Monitor transactions, reconciliation status and discrepancies in real-time.</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/reports')}
          >
            <span>View Full Reports</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              navigate('/reconciliation');
              runReconciliation();
            }}
            disabled={isReconciling}
          >
            {isReconciling ? (
              <>
                <RotateCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Reconciliation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (Requirement 5) */}
      <div className="stats-grid">
        <StatCard
          label="Total Bank Transactions"
          value={stats.totalBankTransactions.toLocaleString()}
          icon={Landmark}
          iconColor="blue"
          trend="+5.2%"
          trendType="positive"
          subtitle="vs last cycle"
        />

        <StatCard
          label="Accounting Records"
          value={stats.totalAccountingRecords.toLocaleString()}
          icon={BookOpen}
          iconColor="purple"
          trend="+3.8%"
          trendType="positive"
          subtitle="General ledger"
        />

        <StatCard
          label="Matched Transactions"
          value={stats.matched.toLocaleString()}
          icon={CheckCircle2}
          iconColor="green"
          trend="+8.1%"
          trendType="positive"
          subtitle="Auto-reconciled"
        />

        <StatCard
          label="Unmatched Transactions"
          value={stats.unmatched.toLocaleString()}
          icon={Clock}
          iconColor="amber"
          trend="-2.4%"
          trendType="positive"
          subtitle="Pending matching"
        />

        <StatCard
          label="Discrepancies"
          value={stats.discrepancies.toLocaleString()}
          icon={AlertTriangle}
          iconColor="red"
          trend={stats.discrepancies > 0 ? "Action Required" : "All Clear"}
          trendType={stats.discrepancies > 0 ? "negative" : "positive"}
          subtitle="Variances flagged"
        />

        <StatCard
          label="Match Rate"
          value={formatPercent(stats.matchRate)}
          icon={Percent}
          iconColor="blue"
          trend="+1.2%"
          trendType="positive"
          subtitle="High confidence"
        />
      </div>

      {/* Discrepancies Action Banner */}
      {stats.discrepancies > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#991b1b' }}>
                {stats.discrepancies} Actionable Discrepancies Ready to Solve
              </div>
              <div style={{ fontSize: '12.5px', color: '#b91c1c', marginTop: '2px' }}>
                Review variances, verify ledger entries, post journal adjustments, or unresolve anytime.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)' }}
            onClick={() => navigate('/discrepancies')}
          >
            <span>Solve Discrepancies Now</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Charts Section (Requirement 6) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Chart 1: Reconciliation Status Donut Chart */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Reconciliation Status</h3>
              <span className="panel-card-subtitle">Distribution of matched vs unmatched records</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/matches')}>
              View Matches <ArrowRight size={13} />
            </button>
          </div>
          <div className="panel-card-body" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value, name) => [`${value.toLocaleString()} records`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Reconciliation Trends */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-card-header">
            <div className="panel-card-title-wrap">
              <h3 className="panel-card-title">Monthly Reconciliation Activity</h3>
              <span className="panel-card-subtitle">Volume history across January to July</span>
            </div>
            <span className="score-pill score-high">2026 Analytics</span>
          </div>
          <div className="panel-card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="matched" name="Matched Records" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="bankTxns" name="Total Bank Txns" stroke="#065f46" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart 3: Transaction Comparison Bar */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Transaction Comparison</h3>
            <span className="panel-card-subtitle">Side-by-side comparison of Bank Transactions vs Accounting Records vs Matched</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="score-pill score-100">Match Efficiency: 94.4%</span>
          </div>
        </div>
        <div className="panel-card-body" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <RechartsTooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="Bank Txns" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Accounting Records" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Matched" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reconciliation Activity Table (Requirement 7) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Recent Reconciliation Activity</h3>
            <span className="panel-card-subtitle">Live stream of latest processed transaction pairs</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bank-transactions')}>
            View All Bank Txns <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-responsive-wrapper" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bank Transaction</th>
                <th>Accounting Record</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act.id}>
                  <td>{formatDate(act.date)}</td>
                  <td className="table-cell-mono">
                    <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>{act.bankTxn}</span>
                  </td>
                  <td className="table-cell-mono">
                    {act.accountingRecord === 'N/A' ? (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    ) : (
                      <span style={{ color: '#6b21a8', fontWeight: 600 }}>{act.accountingRecord}</span>
                    )}
                  </td>
                  <td className="table-cell-amount">
                    {formatCurrency(act.amount)}
                  </td>
                  <td>
                    <StatusBadge status={act.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewDetails(act)}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTxn}
        type="bank"
      />
    </div>
  );
};
