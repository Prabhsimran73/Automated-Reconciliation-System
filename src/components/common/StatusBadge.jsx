import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Check, HelpCircle } from 'lucide-react';

export const StatusBadge = ({ status, text, size = 'md' }) => {
  const normStatus = (status || '').toLowerCase();

  let badgeClass = 'status-badge';
  let Icon = HelpCircle;
  let label = text || status;

  if (normStatus === 'matched') {
    badgeClass += ' matched';
    Icon = CheckCircle2;
  } else if (normStatus === 'discrepancy') {
    badgeClass += ' discrepancy';
    Icon = AlertCircle;
  } else if (normStatus === 'unmatched') {
    badgeClass += ' unmatched';
    Icon = Clock;
  } else if (normStatus === 'pending') {
    badgeClass += ' pending';
    Icon = Clock;
  } else if (normStatus === 'resolved') {
    badgeClass += ' resolved';
    Icon = Check;
  }

  return (
    <span className={`${badgeClass} ${size === 'sm' ? 'text-xs py-0.5' : ''}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
    </span>
  );
};
