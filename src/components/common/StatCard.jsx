import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'blue',
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className={`stat-icon-wrap ${iconColor}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`stat-badge-trend ${trendType}`}>
            {trendType === 'positive' && <TrendingUp size={12} />}
            {trendType === 'negative' && <TrendingDown size={12} />}
            {trendType === 'neutral' && <Minus size={12} />}
            <span>{trend}</span>
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};
