import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useReconciliation } from '../context/ReconciliationContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TransactionDetailModal } from '../components/modals/TransactionDetailModal';
import { AddRecordModal } from '../components/modals/AddRecordModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadCSV } from '../utils/exportCsv';

export const AccountingRecords = () => {
  const { accountingRecords, addAccountingRecord } = useReconciliation();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entryTypeFilter, setEntryTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return accountingRecords.filter(rec => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        rec.id.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        rec.reference.toLowerCase().includes(q) ||
        (rec.accountHead && rec.accountHead.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || rec.status.toLowerCase() === statusFilter.toLowerCase();

      let matchesType = true;
      if (entryTypeFilter === 'Debit') {
        matchesType = rec.debit > 0;
      } else if (entryTypeFilter === 'Credit') {
        matchesType = rec.credit > 0;
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [accountingRecords, searchQuery, statusFilter, entryTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleExport = () => {
    const headers = [
      { label: "Record ID", key: "id" },
      { label: "Date", key: "date" },
      { label: "Description", key: "description" },
      { label: "Debit (INR)", key: "debit" },
      { label: "Credit (INR)", key: "credit" },
      { label: "Reference", key: "reference" },
      { label: "Account Head", key: "accountHead" },
      { label: "Status", key: "status" }
    ];
    downloadCSV("General_Ledger_Accounting_Records.csv", filteredRecords, headers);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting Records</h1>
          <p className="page-subtitle">General ledger vouchers, journal entries, accounts payable & receivable records.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Ledger Record</span>
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
              placeholder="Search ledger by description, ID or account head..."
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

            <select
              className="filter-select"
              value={entryTypeFilter}
              onChange={(e) => {
                setEntryTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Ledger Entries</option>
              <option value="Debit">Debit Entries (Expenses/Assets)</option>
              <option value="Credit">Credit Entries (Revenue/Liabilities)</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || entryTypeFilter !== 'ALL') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setEntryTypeFilter('ALL');
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="panel-card">
        <div className="panel-card-header">
          <div className="panel-card-title-wrap">
            <h3 className="panel-card-title">General Ledger Entries ({filteredRecords.length})</h3>
            <span className="panel-card-subtitle">Double-entry accounting records recorded in ERP</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {paginatedData.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
          </span>
        </div>

        {paginatedData.length === 0 ? (
          <EmptyState
            title="No accounting records found"
            description="No ledger records match your current filter parameters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setEntryTypeFilter('ALL');
            }}
          />
        ) : (
          <div className="table-responsive-wrapper" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Date</th>
                  <th>Description & Account Head</th>
                  <th>Debit (Dr)</th>
                  <th>Credit (Cr)</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((rec) => (
                  <tr key={rec.id}>
                    <td className="table-cell-mono" style={{ color: '#6b21a8', fontWeight: 700 }}>
                      {rec.id}
                    </td>
                    <td>{formatDate(rec.date)}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {rec.description}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {rec.accountHead}
                      </div>
                    </td>
                    <td className="table-cell-amount debit">
                      {rec.debit > 0 ? formatCurrency(rec.debit) : '—'}
                    </td>
                    <td className="table-cell-amount credit">
                      {rec.credit > 0 ? formatCurrency(rec.credit) : '—'}
                    </td>
                    <td className="table-cell-mono" style={{ fontSize: '12px', color: '#475569' }}>
                      {rec.reference}
                    </td>
                    <td>
                      <StatusBadge status={rec.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedRecord(rec);
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

      {/* Record Details Modal */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedRecord}
        type="accounting"
      />

      {/* Add Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(_, data) => addAccountingRecord(data)}
        defaultType="accounting"
      />
    </div>
  );
};
