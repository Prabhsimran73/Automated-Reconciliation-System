import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Try adjusting your search query or filter options.',
  actionText,
  onAction
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        color: '#64748b'
      }}>
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ fontSize: 13.5, maxWidth: 360, margin: '0 auto 18px auto', color: 'var(--text-muted)' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
