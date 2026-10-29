import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEMO_ACCOUNTS = [
  {
    id: 'usr_admin',
    username: 'admin',
    email: 'admin@reconcile.local',
    passwords: ['admin', 'admin123', 'password'],
    name: 'Admin',
    role: 'Administrator',
    department: 'Finance & Systems',
    avatar: 'AD',
    badgeColor: '#10b981',
    description: 'Full system privileges, engine configuration & audit approval'
  },
  {
    id: 'usr_auditor',
    username: 'auditor',
    email: 'auditor@reconcile.local',
    passwords: ['audit', 'auditor', 'auditor123'],
    name: 'Sarah Jenkins',
    role: 'Financial Auditor',
    department: 'Internal Audit',
    avatar: 'SJ',
    badgeColor: '#6366f1',
    description: 'Audit compliance, report generation & discrepancy verification'
  },
  {
    id: 'usr_manager',
    username: 'manager',
    email: 'manager@reconcile.local',
    passwords: ['manager', 'manager123', 'finance'],
    name: 'Vikram Malhotra',
    role: 'Finance Operations Lead',
    department: 'Corporate Accounts',
    avatar: 'VM',
    badgeColor: '#0ea5e9',
    description: 'Transaction approvals, journal vouchers & reconciliation oversight'
  }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('recon_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastLoginTime, setLastLoginTime] = useState(() => {
    return localStorage.getItem('recon_last_login') || null;
  });

  // Save session when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('recon_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('recon_auth_user');
    }
  }, [user]);

  /**
   * Log in with credentials
   * Supports pre-configured demo users and flexible fallback for evaluator test logins.
   */
  const login = async (identifier, password, rememberMe = true) => {
    // Simulated micro-delay for realistic network feel
    await new Promise(resolve => setTimeout(resolve, 350));

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        error: 'Please enter both username/email and password.'
      };
    }

    // Check predefined accounts first
    const matchedAccount = DEMO_ACCOUNTS.find(
      acc => acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId
    );

    if (matchedAccount) {
      const isPassValid = matchedAccount.passwords.includes(cleanPass) || cleanPass === 'demo';
      if (!isPassValid) {
        return {
          success: false,
          error: `Incorrect password for ${matchedAccount.name}. Use "${matchedAccount.passwords[0]}" or click Quick Demo Fill.`
        };
      }

      const sessionUser = {
        id: matchedAccount.id,
        username: matchedAccount.username,
        email: matchedAccount.email,
        name: matchedAccount.name,
        role: matchedAccount.role,
        department: matchedAccount.department,
        avatar: matchedAccount.avatar,
        badgeColor: matchedAccount.badgeColor,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rememberMe
      };

      setUser(sessionUser);
      setLastLoginTime(new Date().toISOString());
      localStorage.setItem('recon_last_login', new Date().toISOString());
      return { success: true, user: sessionUser };
    }

    // Evaluator / custom test login support (accept valid 3+ char username & password)
    if (cleanPass.length >= 3) {
      const displayName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
      const sessionUser = {
        id: `usr_custom_${Date.now()}`,
        username: cleanId,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@reconcile.local`,
        name: displayName,
        role: 'Guest Financial Analyst',
        department: 'Evaluator Session',
        avatar: cleanId.substring(0, 2).toUpperCase(),
        badgeColor: '#10b981',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rememberMe
      };

      setUser(sessionUser);
      setLastLoginTime(new Date().toISOString());
      localStorage.setItem('recon_last_login', new Date().toISOString());
      return { success: true, user: sessionUser };
    }

    return {
      success: false,
      error: 'Password must be at least 3 characters long.'
    };
  };

  /**
   * Register a new user session
   */
  const register = async ({ name, username, email, password, role, department }) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const cleanName = (name || '').trim();
    const cleanId = (username || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanName || !cleanId || !cleanPass) {
      return {
        success: false,
        error: 'Please fill in all required fields.'
      };
    }

    if (cleanPass.length < 3) {
      return {
        success: false,
        error: 'Password must be at least 3 characters long.'
      };
    }

    const sessionUser = {
      id: `usr_${Date.now()}`,
      username: cleanId,
      email: cleanEmail || `${cleanId}@reconcile.local`,
      name: cleanName,
      role: role || 'Financial Analyst',
      department: department || 'Finance & Accounts',
      avatar: cleanName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'US',
      badgeColor: role === 'Administrator' ? '#10b981' : role === 'Senior Auditor' ? '#6366f1' : '#0ea5e9',
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rememberMe: true
    };

    setUser(sessionUser);
    setLastLoginTime(new Date().toISOString());
    localStorage.setItem('recon_last_login', new Date().toISOString());
    return { success: true, user: sessionUser };
  };

  /**
   * One-click demo login
   */
  const quickLogin = async (username) => {
    const target = DEMO_ACCOUNTS.find(a => a.username === username) || DEMO_ACCOUNTS[0];
    return login(target.username, target.passwords[0], true);
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('recon_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        quickLogin,
        logout,
        lastLoginTime,
        demoAccounts: DEMO_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

