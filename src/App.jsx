import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReconciliationProvider } from './context/ReconciliationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BankTransactions } from './pages/BankTransactions';
import { AccountingRecords } from './pages/AccountingRecords';
import { Reconciliation } from './pages/Reconciliation';
import { Matches } from './pages/Matches';
import { Discrepancies } from './pages/Discrepancies';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App = () => {
  return (
    <AuthProvider>
      <ReconciliationProvider>
        <Router>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Application Routes with Sidebar & Header Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bank-transactions" element={<BankTransactions />} />
                <Route path="/accounting-records" element={<AccountingRecords />} />
                <Route path="/reconciliation" element={<Reconciliation />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/discrepancies" element={<Discrepancies />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ReconciliationProvider>
    </AuthProvider>
  );
};

export default App;
