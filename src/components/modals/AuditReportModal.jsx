import React from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Download, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { exportFullReconciliationReport } from '../../utils/exportCsv';

export const AuditReportModal = ({ isOpen, onClose, stats, matches, discrepancies, bankTxns, accRecords }) => {
  if (!stats) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportFullReconciliationReport(bankTxns, accRecords, matches, discrepancies, stats);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Reconciliation Audit Report"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Report Meta Header */}
        <div style={{
          borderBottom: '2px solid var(--primary-600)',
          paddingBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
              AUTOMATED RECONCILIATION AUDIT STATEMENT
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Academic Minor Project Submission (BCA 2026) | Period: Current Fiscal Month
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <div><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Status:</strong> Reconciled & Verified</div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Records Processed</span>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{stats.totalProcessed}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Successfully Matched</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{stats.matched}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Flagged Discrepancies</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>{stats.discrepancies}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Reconciliation Match Rate</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-600)', marginTop: '2px' }}>{stats.matchRate}%</div>
          </div>
        </div>

        {/* Discrepancy Breakdown Section */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span>Key Exceptions & Discrepancies Identified ({discrepancies.length})</span>
          </h4>
          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Bank Txn</th>
                  <th>Ledger Ref</th>
                  <th>Variance Amount</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.reason}</td>
                    <td className="table-cell-mono">{d.bankTxnId}</td>
                    <td className="table-cell-mono">{d.accRecordId}</td>
                    <td className="table-cell-amount debit">{formatCurrency(d.difference)}</td>
                    <td>
                      <span className={`status-badge ${d.status === 'Resolved' ? 'resolved' : 'discrepancy'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance & Sign-off Note */}
        <div style={{
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12.5px',
          color: 'var(--primary-800)',
          lineHeight: 1.5
        }}>
          <strong>Audit Certification:</strong> This computerized automated reconciliation audit report was algorithmically computed using multi-attribute matching criteria. All reconciled transactions satisfy tolerance parameters.
        </div>
      </div>
    </Modal>
  );
};
