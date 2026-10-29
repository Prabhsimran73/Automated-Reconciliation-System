import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, CheckCircle2, FileEdit, ShieldAlert } from 'lucide-react';

export const ResolveDiscrepancyModal = ({ isOpen, onClose, discrepancy, onResolve }) => {
  const [resolutionAction, setResolutionAction] = useState('Adjust General Ledger Entry');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!discrepancy) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onResolve(discrepancy.id, {
        action: resolutionAction,
        notes: resolutionNotes || `Resolved discrepancy (${discrepancy.reason}) via ${resolutionAction}.`
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Transaction Discrepancy"
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Warning Banner */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#ef4444', marginTop: '2px' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
              {discrepancy.reason}
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>
              {discrepancy.description}
            </div>
          </div>
        </div>

        {/* Comparison Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          background: '#f8fafc',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Bank Amount ({discrepancy.bankTxnId})
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {formatCurrency(discrepancy.bankAmount)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Ledger Amount ({discrepancy.accRecordId})
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
              {formatCurrency(discrepancy.accountingAmount)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 700 }}>
              Net Variance
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
              {formatCurrency(discrepancy.difference)}
            </div>
          </div>
        </div>

        {/* Resolution Action Selector */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
            Select Resolution Action:
          </label>
          <select
            className="filter-select"
            style={{ width: '100%', padding: '10px 14px' }}
            value={resolutionAction}
            onChange={(e) => setResolutionAction(e.target.value)}
          >
            <option value="Adjust General Ledger Entry">Adjust General Ledger Entry (Book Journal Voucher)</option>
            <option value="Accept Bank Charge / Fee">Accept Bank Charge / Fee (Recognize Expense)</option>
            <option value="Mark as Timing Clearance Difference">Mark as Timing Difference (Awaiting Cheque/NEFT Clearing)</option>
            <option value="Write-off Minor Variance">Write-off Minor Variance to Round-off Account</option>
            <option value="Authorize Customer Credit/Debit Adjustment">Authorize Customer Credit/Debit Adjustment</option>
          </select>
        </div>

        {/* Resolution Notes */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
            Resolution Remarks / Audit Trail:
          </label>
          <textarea
            className="search-input"
            style={{ width: '100%', minHeight: '80px', padding: '10px 12px', resize: 'vertical' }}
            placeholder="Enter justification, approval memo reference or audit notes..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
