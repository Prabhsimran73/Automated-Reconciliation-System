import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PlusCircle, Landmark, BookOpen } from 'lucide-react';

export const AddRecordModal = ({ isOpen, onClose, onAdd, defaultType = 'bank' }) => {
  const [recordType, setRecordType] = useState(defaultType); // 'bank' | 'accounting'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Credit'); // 'Credit' | 'Debit'
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountHead, setAccountHead] = useState('General Client Sales');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    if (recordType === 'bank') {
      onAdd('bank', {
        description,
        amount: Number(amount),
        type,
        reference: reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
        date,
        notes
      });
    } else {
      onAdd('accounting', {
        description,
        amount: Number(amount),
        type,
        reference: reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
        date,
        accountHead,
        notes
      });
    }

    // Reset form
    setDescription('');
    setAmount('');
    setReference('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Test Entry for Live Reconciliation"
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <PlusCircle size={16} />
            <span>Add Entry</span>
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Toggle Type */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`btn ${recordType === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setRecordType('bank')}
          >
            <Landmark size={16} />
            <span>Bank Transaction</span>
          </button>
          <button
            type="button"
            className={`btn ${recordType === 'accounting' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setRecordType('accounting')}
          >
            <BookOpen size={16} />
            <span>Accounting Record</span>
          </button>
        </div>

        {/* Amount & Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Amount (₹ INR) *
            </label>
            <input
              type="number"
              className="search-input"
              style={{ paddingLeft: '12px' }}
              placeholder="e.g. 25000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Entry Type
            </label>
            <select
              className="filter-select"
              style={{ width: '100%' }}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Credit">Credit (Income/Receipt)</option>
              <option value="Debit">Debit (Expense/Payment)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Description / Narration *
          </label>
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '12px' }}
            placeholder="e.g. NEFT Inward - Client Advance Payment"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Reference & Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Reference Number
            </label>
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '12px' }}
              placeholder="e.g. REF-NEFT-99120"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Date
            </label>
            <input
              type="date"
              className="search-input"
              style={{ paddingLeft: '12px' }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {recordType === 'accounting' && (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              General Ledger Account Head
            </label>
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '12px' }}
              placeholder="e.g. Technology & Infrastructure Expense"
              value={accountHead}
              onChange={(e) => setAccountHead(e.target.value)}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Notes / Audit Tag (Optional)
          </label>
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '12px' }}
            placeholder="e.g. Test entry for live presentation"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
