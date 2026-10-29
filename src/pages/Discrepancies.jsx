import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ResolveDiscrepancyModal } from '../components/modals/ResolveDiscrepancyModal';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportDiscrepanciesCSV } from '../utils/exportCsv';

export const Discrepancies = () => {
  const {
    reconciliationResults,
    resolveDiscrepancy,
    unresolveDiscrepancy,
    unresolveAllDiscrepancies
  } = useReconciliation();
  const discrepancies = reconciliationResults?.discrepancies || [];

  // Automatically unresolve all discrepancies whenever the discrepancy page is opened
  // if all of them are currently resolved, so the user can always solve them!
  useEffect(() => {
    if (discrepancies.length > 0 && discrepancies.every(d => d.status === 'Resolved')) {
      unresolveAllDiscrepancies();
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected item for Resolution or Viewing
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter logic
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        d.bankTxnId.toLowerCase().includes(q) ||
        d.accRecordId.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);

      const matchesReason = reasonFilter === 'ALL' || d.reason === reasonFilter;
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchesSearch && matchesReason && matchesStatus;
    });
  }, [discrepancies, searchQuery, reasonFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDiscrepancies.length / itemsPerPage) || 1;
  const paginatedDiscrepancies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDiscrepancies.slice(start, start + itemsPerPage);
  }, [filteredDiscrepancies, currentPage]);

  const handleExport = () => {
    exportDiscrepanciesCSV(filteredDiscrepancies);
  };

  const handleResolveClick = (d) => {
    setSelectedDiscrepancy(d);
    setIsResolveModalOpen(true);
  };

  const handleViewClick = (d) => {
    setSelectedDiscrepancy(d);
    setIsViewModalOpen(true);
  };

  const pendingCount = discrepancies.filter(d => d.status === 'Pending').length;
  const resolvedCount = discrepancies.filter(d => d.status === 'Resolved').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Discrepancies & Exceptions</h1>
          <p className="page-subtitle">Identify, audit, and resolve accounting variances between bank statements and books.</p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={unresolveAllDiscrepancies}
            title="Reset all discrepancies back to Pending so you can solve them again"
          >
            <RotateCcw size={15} />
            <span>Unresolve All</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} />
            <span>Export Exceptions CSV</span>
          </button>
        </div>
      </div>

      {/* Re-open Banner if all are resolved */}
      {pendingCount === 0 && discrepancies.length > 0 && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, color: '#047857', fontSize: '14px' }}>
                All Discrepancies Currently Resolved!
              </div>
              <div style={{ fontSize: '12.5px', color: '#065f46' }}>
                Want to solve discrepancies again? Click "Unresolve All" to restore all exceptions back to Pending.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={unresolveAllDiscrepancies}
          >
            <RotateCcw size={14} />
            <span>Unresolve All (Solve Again)</span>
          </button>
        </div>
      )}

      {/* Discrepancy Status KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Action Required
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>
              {pendingCount} Pending
            </div>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #c7d2fe',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Audited & Closed
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>
              {resolvedCount} Resolved
            </div>
          </div>
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
              placeholder="Search discrepancies by ID, reason, or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            {/* Reason Filter */}
            <select
              className="filter-select"
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Discrepancy Reasons</option>
              <option value="Amount Mismatch">Amount Mismatch</option>
              <option value="Date Mismatch">Date Mismatch</option>
              <option value="Missing Accounting Record">Missing Accounting Record</option>
              <option value="Missing Bank Transaction">Missing Bank Transaction</option>
              <option value="Reference Mismatch">Reference Mismatch</option>
            </select>

            {/* Status Filter */}
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>

            {(searchQuery || reasonFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setReasonFilter('ALL');
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discrepancies Table (Requirement 13) */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Discrepancy Exception Log ({filteredDiscrepancies.length})</h3>
            <span className="panel-card-subtitle">Items requiring auditor review, journal voucher adjustment, or investigation</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {paginatedDiscrepancies.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredDiscrepancies.length)} of {filteredDiscrepancies.length}
          </span>
        </div>

        {paginatedDiscrepancies.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No discrepancies found"
            description="Great news! All items match criteria or all discrepancies are resolved."
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setReasonFilter('ALL');
              setStatusFilter('ALL');
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
                  <th>Difference</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDiscrepancies.map((d) => (
                  <tr key={d.id}>
                    <td className="table-cell-mono">
                      {d.bankTxnId === 'N/A' ? (
                        <span style={{ color: '#94a3b8' }}>Unbanked</span>
                      ) : (
                        <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>{d.bankTxnId}</span>
                      )}
                    </td>
                    <td className="table-cell-mono">
                      {d.accRecordId === 'N/A' ? (
                        <span style={{ color: '#94a3b8' }}>Unposted</span>
                      ) : (
                        <span style={{ color: '#6b21a8', fontWeight: 700 }}>{d.accRecordId}</span>
                      )}
                    </td>
                    <td className="table-cell-amount">
                      {d.bankAmount > 0 ? formatCurrency(d.bankAmount) : '—'}
                    </td>
                    <td className="table-cell-amount">
                      {d.accountingAmount > 0 ? formatCurrency(d.accountingAmount) : '—'}
                    </td>
                    <td className="table-cell-amount debit">
                      {formatCurrency(d.difference)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '13px' }}>
                        {d.reason}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {d.description.length > 40 ? `${d.description.substring(0, 40)}...` : d.description}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: '6px' }}
                        onClick={() => handleViewClick(d)}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>

                      {d.status === 'Pending' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleResolveClick(d)}
                        >
                          <Check size={12} />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: '#b91c1c',
                            borderColor: '#fca5a5',
                            backgroundColor: '#fef2f2',
                            fontWeight: 600
                          }}
                          onClick={() => unresolveDiscrepancy(d.id)}
                          title="Undo resolution and set back to Pending"
                        >
                          <RotateCcw size={12} />
                          <span>Unresolve</span>
                        </button>
                      )}
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

      {/* Resolve Discrepancy Modal */}
      <ResolveDiscrepancyModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        discrepancy={selectedDiscrepancy}
        onResolve={resolveDiscrepancy}
      />

      {/* View Discrepancy Details Modal */}
      {selectedDiscrepancy && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Discrepancy Investigation Details"
          size="md"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>
              {selectedDiscrepancy.status === 'Pending' ? (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsResolveModalOpen(true);
                  }}
                >
                  <Check size={14} />
                  <span>Resolve Discrepancy</span>
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  style={{
                    color: '#b91c1c',
                    borderColor: '#fca5a5',
                    backgroundColor: '#fef2f2',
                    fontWeight: 600
                  }}
                  onClick={() => {
                    unresolveDiscrepancy(selectedDiscrepancy.id);
                    setIsViewModalOpen(false);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Unresolve (Set to Pending)</span>
                </button>
              )}
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Classification
                </span>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#991b1b' }}>
                  {selectedDiscrepancy.reason}
                </h4>
              </div>
              <StatusBadge status={selectedDiscrepancy.status} />
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Full Description / Root Cause:
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-main)', fontWeight: 500 }}>
                {selectedDiscrepancy.description}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              textAlign: 'center',
              padding: '12px',
              background: '#f1f5f9',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bank Amount</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatCurrency(selectedDiscrepancy.bankAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ledger Amount</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatCurrency(selectedDiscrepancy.accountingAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#dc2626' }}>Difference</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>{formatCurrency(selectedDiscrepancy.difference)}</div>
              </div>
            </div>

            {selectedDiscrepancy.resolutionAction && (
              <div style={{
                background: 'var(--primary-50)',
                border: '1px solid var(--primary-200)',
                padding: '14px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '2px' }}>
                  Resolution Applied: {selectedDiscrepancy.resolutionAction}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--primary-700)' }}>
                  {selectedDiscrepancy.resolutionNotes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
