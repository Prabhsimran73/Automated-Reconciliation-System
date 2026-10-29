import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  BookOpen,
  GitCompare,
  CheckCheck,
  AlertTriangle,
  FileBarChart2,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useReconciliation } from '../../context/ReconciliationContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { reconciliationResults } = useReconciliation();
  const { user, logout } = useAuth();
  const { matched, discrepancies } = reconciliationResults?.stats || { matched: 0, discrepancies: 0 };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bank Transactions', path: '/bank-transactions', icon: Landmark },
    { name: 'Accounting Records', path: '/accounting-records', icon: BookOpen },
    { name: 'Reconciliation', path: '/reconciliation', icon: GitCompare },
    { name: 'Matches', path: '/matches', icon: CheckCheck, badge: matched, badgeType: 'matched' },
    { name: 'Discrepancies', path: '/discrepancies', icon: AlertTriangle, badge: discrepancies, badgeType: 'discrepancy' },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the reconciliation system?')) {
      logout();
    }
  };

  return (
    <>
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo & Name */}
        <div className="sidebar-header">
          <div className="brand-logo-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">Automated Reconciliation</span>
            <span className="brand-badge">Fintech Engine 2.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <span className="nav-section-title">Main Navigation</span>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon className="nav-icon" />
                <span>{item.name}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`nav-badge-count ${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info Footer with Session Details and Logout */}
        <div className="sidebar-user-footer">
          <div
            className="user-avatar"
            style={{ backgroundColor: user?.badgeColor || '#10b981' }}
          >
            {user?.avatar ? user.avatar : <UserCheck size={18} />}
          </div>
          <div className="user-meta" style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
              {user?.department || 'Session'}
            </span>
            <span className="user-name" title={user?.name || 'Admin'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Admin'}
            </span>
            <span className="user-role" title={user?.role || 'Administrator'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.role || 'Administrator'}
            </span>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of system"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
