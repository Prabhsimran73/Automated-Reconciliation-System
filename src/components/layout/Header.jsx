import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  LogOut,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useReconciliation } from '../../context/ReconciliationContext';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    markAllNotificationsRead,
    runReconciliation,
    isReconciling,
    reconciliationResults
  } = useReconciliation();

  const { user, logout } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Map route to title
  const getRouteTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/bank-transactions': return 'Bank Statement Transactions';
      case '/accounting-records': return 'General Ledger & Accounting Records';
      case '/reconciliation': return 'Automated Reconciliation Engine';
      case '/matches': return 'Matched Transactions';
      case '/discrepancies': return 'Discrepancy Resolution Center';
      case '/reports': return 'Reconciliation Reports & Audit Logs';
      case '/settings': return 'System Settings & Matching Rules';
      default: return 'Automated Reconciliation System';
    }
  };

  // Close notifications & user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickRun = () => {
    navigate('/reconciliation');
    runReconciliation();
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    if (window.confirm('Are you sure you want to log out of the reconciliation system?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-toggle" onClick={onOpenMobile} aria-label="Open Navigation Menu">
          <Menu size={20} />
        </button>
        <div className="header-breadcrumbs">
          <span className="header-title-active">{getRouteTitle()}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Live Engine Status */}
        <div className="recon-status-pill">
          <span className="status-dot-pulse" />
          <span>Match Rate: <strong style={{ color: 'var(--text-main)' }}>{reconciliationResults?.stats?.matchRate || 94.4}%</strong></span>
        </div>

        {/* Quick Action: Run Reconciliation */}
        <button
          className="header-btn primary"
          onClick={handleQuickRun}
          disabled={isReconciling}
          title="Trigger automated reconciliation engine"
        >
          {isReconciling ? (
            <>
              <RotateCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" />
              <span>Run Recon</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="header-icon-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge-indicator" />}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Notifications</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={markAllNotificationsRead}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <Check size={12} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
                      <div style={{ marginTop: '2px' }}>
                        {notif.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
                        {notif.type === 'warning' && <AlertTriangle size={16} color="#f59e0b" />}
                        {notif.type === 'info' && <Info size={16} color="var(--primary-600)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                          {notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            className="header-user-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User Profile Menu"
          >
            <div
              className="header-user-avatar"
              style={{ backgroundColor: user?.badgeColor || 'var(--primary-600)' }}
            >
              {user?.avatar || 'AD'}
            </div>
            <div className="header-user-text">
              <span className="header-user-name">{user?.name || 'Admin'}</span>
              <span className="header-user-role">{user?.role || 'Administrator'}</span>
            </div>
            <ChevronDown size={14} className="header-user-arrow" />
          </button>

          {isUserMenuOpen && (
            <div className="user-dropdown-menu">
              <div className="user-dropdown-header">
                <div
                  className="user-dropdown-avatar"
                  style={{ backgroundColor: user?.badgeColor || 'var(--primary-600)' }}
                >
                  {user?.avatar || 'AD'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="user-dropdown-name">{user?.name || 'Administrator'}</div>
                  <div className="user-dropdown-email">{user?.email || 'admin@reconcile.local'}</div>
                  <div className="user-dropdown-badge">{user?.role || 'Administrator'}</div>
                </div>
              </div>

              <div className="user-dropdown-divider" />

              <div className="user-dropdown-meta-row">
                <span className="meta-label">Active Session:</span>
                <span className="meta-value">Authenticated</span>
              </div>
              <div className="user-dropdown-meta-row">
                <span className="meta-label">Department:</span>
                <span className="meta-value">{user?.department || 'Finance & Systems'}</span>
              </div>

              <div className="user-dropdown-divider" />

              <button
                className="user-dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out of System</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
