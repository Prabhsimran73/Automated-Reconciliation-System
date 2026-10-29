import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportMatchedTransactionsCSV } from '../utils/exportCsv';

export const Matches = () => {
  const { reconciliationResults } = useReconciliation();
  const matchedPairs = reconciliationResults?.matchedPairs || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedPair, setSelectedPair] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering
  const filteredMatches = useMemo(() => {
    return matchedPairs.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        m.bankTxnId.toLowerCase().includes(q) ||
        m.accRecordId.toLowerCase().includes(q) ||
        m.bankDescription.toLowerCase().includes(q) ||
        m.bankReference.toLowerCase().includes(q);

      let matchesScore = true;
      if (scoreFilter === '100') {
        matchesScore = m.matchScore === 100;
      } else if (scoreFilter === 'HIGH') {
        matchesScore = m.matchScore >= 90 && m.matchScore < 100;
      } else if (scoreFilter === 'MED') {
        matchesScore = m.matchScore < 90;
      }

      return matchesSearch && matchesScore;
    });
  }, [matchedPairs, searchQuery, scoreFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage) || 1;
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMatches.slice(start, start + itemsPerPage);
  }, [filteredMatches, currentPage]);

  const handleExport = () => {
    exportMatchedTransactionsCSV(filteredMatches);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Matched Transactions</h1>
          <p className="page-subtitle">Verified transaction pairs reconciling bank statements with accounting ledger vouchers.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} />
            <span>Export Matched CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="panel-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="filter-toolbar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <Search className="search-icon-pos" size={17} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Bank ID, Ledger ID, description or reference..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={scoreFilter}
              onChange={(e) => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Confidence Scores</option>
              <option value="100">Exact Matches (100%)</option>
              <option value="HIGH">High Confidence (90% - 95%)</option>
              <option value="MED">Heuristic Matches (&lt; 90%)</option>
            </select>

            {(searchQuery || scoreFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setScoreFilter('ALL');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Matched Pairs Table (Requirement 12) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Successfully Reconciled Pairs ({filteredMatches.length})</h3>
            <span className="panel-card-subtitle">Transactions matching across amount, date, and reference keys</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {paginatedMatches.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredMatches.length)} of {filteredMatches.length}
          </span>
        </div>

        {paginatedMatches.length === 0 ? (
          <EmptyState
            title="No matched transactions found"
            description="No transactions match your current search criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setScoreFilter('ALL');
            }}
          />
        ) : (
          <div className="table-responsive-wrapper" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Accounting ID</th>
                  <th>Bank Amount</th>
                  <th>Accounting Amount</th>
                  <th>Match Score</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMatches.map((m) => (
                  <tr key={m.id}>
                    <td className="table-cell-mono" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                      {m.bankTxnId}
                    </td>
                    <td className="table-cell-mono" style={{ color: '#6b21a8', fontWeight: 700 }}>
                      {m.accRecordId}
                    </td>
                    <td className="table-cell-amount">
                      {formatCurrency(m.bankAmount)}
                    </td>
                    <td className="table-cell-amount">
                      {formatCurrency(m.accountingAmount)}
                    </td>
                    <td>
                      <span className={`score-pill ${m.matchScore === 100 ? 'score-100' : m.matchScore >= 90 ? 'score-high' : 'score-med'}`}>
                        {m.matchScore}%
                      </span>
                    </td>
                    <td>{formatDate(m.date)}</td>
                    <td>
                      <StatusBadge status="Matched" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedPair(m);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye size={13} />
                        <span>Compare</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-light)',
            background: '#ffffff'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Match Comparison Modal */}
      {selectedPair && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Matched Transaction Pair Verification"
          size="lg"
          footer={
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Score Pill Banner */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>
                  Reconciliation Match Score: {selectedPair.matchScore}%
                </span>
              </div>
              <span style={{ fontSize: '12.5px', color: '#065f46' }}>
                Criteria: <strong>{selectedPair.matchCriteria}</strong>
              </span>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {/* Bank Statement Side */}
              <div style={{
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Bank Statement
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-700)', marginBottom: '12px' }}>
                  {selectedPair.bankTxnId}
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
                  <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(selectedPair.bankAmount)}</strong>
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                  <strong>{formatDate(selectedPair.bankDate)}</strong>
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reference: </span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedPair.bankReference}</strong>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Description: </span>
                  <div>{selectedPair.bankDescription}</div>
                </div>
              </div>

              {/* General Ledger Side */}
              <div style={{
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: 'var(--radius-lg)',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  General Ledger Entry
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'monospace', color: '#6b21a8', marginBottom: '12px' }}>
                  {selectedPair.accRecordId}
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
                  <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(selectedPair.accountingAmount)}</strong>
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                  <strong>{formatDate(selectedPair.accDate)}</strong>
                </div>

                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reference: </span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedPair.accReference}</strong>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Description: </span>
                  <div>{selectedPair.accDescription}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
