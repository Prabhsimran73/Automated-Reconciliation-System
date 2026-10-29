import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Plus,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TransactionDetailModal } from '../components/modals/TransactionDetailModal';
import { AddRecordModal } from '../components/modals/AddRecordModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadCSV } from '../utils/exportCsv';

export const BankTransactions = () => {
  const { bankTransactions, addBankTransaction } = useReconciliation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return bankTransactions.filter(txn => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        txn.id.toLowerCase().includes(q) ||
        txn.description.toLowerCase().includes(q) ||
        txn.reference.toLowerCase().includes(q);

      // Status
      const matchesStatus = statusFilter === 'ALL' || txn.status.toLowerCase() === statusFilter.toLowerCase();

      // Type
      const matchesType = typeFilter === 'ALL' || txn.type.toLowerCase() === typeFilter.toLowerCase();

      // Date range
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(txn.date) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(txn.date) <= new Date(endDate);
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [bankTransactions, searchQuery, statusFilter, typeFilter, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleExport = () => {
    const headers = [
      { label: "Transaction ID", key: "id" },
      { label: "Date", key: "date" },
      { label: "Description", key: "description" },
      { label: "Amount (INR)", key: "amount" },
      { label: "Transaction Type", key: "type" },
      { label: "Reference", key: "reference" },
      { label: "Bank Account", key: "bankAccount" },
      { label: "Status", key: "status" }
    ];
    downloadCSV("Bank_Transactions_Statement.csv", filteredTransactions, headers);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bank Transactions</h1>
          <p className="page-subtitle">Inspect raw bank feed transactions, credit/debit statements, and reconciliation tags.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Bank Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="panel-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="filter-toolbar" style={{ marginBottom: 0 }}>
          {/* Search Box */}
          <div className="search-input-wrap">
            <Search className="search-icon-pos" size={17} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID, description or reference..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters */}
          <div className="filter-group">
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
              <option value="Matched">Matched</option>
              <option value="Unmatched">Unmatched</option>
              <option value="Discrepancy">Discrepancy</option>
            </select>

            {/* Type Filter */}
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Types</option>
              <option value="Credit">Credit (Inward)</option>
              <option value="Debit">Debit (Outward)</option>
            </select>

            {/* Date Filters */}
            <input
              type="date"
              className="filter-select"
              style={{ fontSize: '12.5px' }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              title="Filter from date"
            />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="filter-select"
              style={{ fontSize: '12.5px' }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              title="Filter to date"
            />

            {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || startDate || endDate) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">Statement Records ({filteredTransactions.length})</h3>
            <span className="panel-card-subtitle">Verified against connected bank account feed</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {paginatedData.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
          </span>
        </div>

        {paginatedData.length === 0 ? (
          <EmptyState
            title="No bank transactions found"
            description="No transactions match your current search and filter criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setStartDate('');
              setEndDate('');
            }}
          />
        ) : (
          <div className="table-responsive-wrapper" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((txn) => (
                  <tr key={txn.id}>
                    <td className="table-cell-mono" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                      {txn.id}
                    </td>
                    <td>{formatDate(txn.date)}</td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {txn.description}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        {txn.bankAccount}
                      </div>
                    </td>
                    <td className={`table-cell-amount ${txn.type === 'Credit' ? 'credit' : 'debit'}`}>
                      {formatCurrency(txn.amount)}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: txn.type === 'Credit' ? '#ecfdf5' : '#fef2f2',
                        color: txn.type === 'Credit' ? '#047857' : '#b91c1c'
                      }}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="table-cell-mono" style={{ fontSize: '12px', color: '#475569' }}>
                      {txn.reference}
                    </td>
                    <td>
                      <StatusBadge status={txn.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedTxn(txn);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye size={13} />
                        <span>View Details</span>
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

      {/* Transaction Details Modal */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTxn}
        type="bank"
      />

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(_, data) => addBankTransaction(data)}
        defaultType="bank"
      />
    </div>
  );
};
