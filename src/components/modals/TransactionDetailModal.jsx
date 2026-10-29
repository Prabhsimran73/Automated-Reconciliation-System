import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Landmark, BookOpen, CheckCircle2, AlertTriangle, Hash, Calendar, Layers } from 'lucide-react';

export const TransactionDetailModal = ({ isOpen, onClose, transaction, type = 'bank' }) => {
  if (!transaction) return null;

  const isBank = type === 'bank';
  const amount = isBank ? transaction.amount : (transaction.credit || transaction.debit);
  const txnType = isBank ? transaction.type : (transaction.credit > 0 ? 'Credit' : 'Debit');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isBank ? 'Bank Transaction' : 'Accounting Record'} Details`}
      size="lg"
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Summary Banner */}
        <div style={{
          background: isBank ? 'var(--primary-50)' : '#f0fdf4',
          border: `1px solid ${isBank ? 'var(--primary-200)' : '#bbf7d0'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isBank ? 'var(--primary-600)' : '#16a34a',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {isBank ? <Landmark size={24} /> : <BookOpen size={24} />}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {isBank ? 'Transaction Identifier' : 'Ledger Voucher ID'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {transaction.id}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Transaction Amount
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: txnType === 'Credit' ? 'var(--success-text)' : 'var(--danger-text)'
            }}>
              {formatCurrency(amount)}
              <span style={{ fontSize: '13px', marginLeft: '6px', fontWeight: 600 }}>({txnType})</span>
            </div>
          </div>
        </div>

        {/* Detailed Key-Value Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          background: 'var(--bg-app)',
          padding: '18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} /> Date
            </span>
            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '3px' }}>
              {formatDate(transaction.date)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Hash size={13} /> Reference ID
            </span>
            <p style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace', marginTop: '3px', color: 'var(--primary-700)' }}>
              {transaction.reference}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={13} /> {isBank ? 'Bank Account' : 'Account Head / Category'}
            </span>
            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '3px' }}>
              {isBank ? transaction.bankAccount : transaction.accountHead}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Reconciliation Status
            </span>
            <div style={{ marginTop: '5px' }}>
              <StatusBadge status={transaction.status} />
            </div>
          </div>
        </div>

        {/* Description & Audit Notes */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Description / Narration
          </h4>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            color: 'var(--text-main)'
          }}>
            {transaction.description}
          </div>
        </div>

        {transaction.notes && (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Audit Remarks & Matching Notes
            </h4>
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13.5px',
              color: '#92400e'
            }}>
              {transaction.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
