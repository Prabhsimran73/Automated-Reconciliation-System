# Automated Reconciliation System
### BCA Minor Project — Academic Session 2026

An automated, intelligent financial reconciliation web application built with **React.js**. The application compares raw bank transactions with general accounting ledger records, algorithmically determines matching confidence, identifies discrepancies (such as amount variances, unpresented cheques, timing differences, and unposted bank fees), and delivers an interactive analytics dashboard with full CSV reporting.

---

## 🚀 Key Features

0. **Institutional Authentication & Login Portal (`/login`)**:
   - Secure gateway for entering the system with role-based identity verification.
   - Built-in **1-Click Quick Demo Sign In** for evaluators with 3 institutional roles:
     - **Administrator**: `admin` / `admin123` (Full system configuration and engine control)
     - **Senior Auditor**: `auditor` / `audit123` (Audit reports, compliance & discrepancy verification)
     - **Finance Lead**: `manager` / `manager123` (Transaction approvals and journal adjustments)
   - Dynamic user session persistence with `localStorage`, session info in Header and Sidebar, and secure Logout action.
   - Interactive credentials help modal and custom guest evaluator login support.

1. **Fintech Dashboard Overview (`/dashboard`)**:
   - Real-time KPI summary cards: *Total Bank Transactions*, *Accounting Records*, *Matched Transactions*, *Unmatched Transactions*, *Discrepancies*, and *Match Rate (%)*.
   - Interactive charts built with **Recharts**:
     - **Reconciliation Status** (Donut / Pie chart)
     - **Monthly Activity Trends** (Bar / Line chart across Jan - Jul)
     - **Side-by-side Volume Comparison**
   - Live stream of recent reconciliation activity with colored status badges.

2. **Bank Transactions Management (`/bank-transactions`)**:
   - Filterable and paginated bank statement feed with Transaction ID, Date, Description, Amount (INR ₹), Credit/Debit Type, Reference, and Status.
   - Comprehensive multi-attribute search (by ID, description, reference), date ranges, and status filters.
   - Detailed transaction inspector modal and "Add Custom Transaction" capability for live testing.

3. **Accounting Ledger Records (`/accounting-records`)**:
   - Double-entry accounting vouchers displaying Record ID, Date, Description, Account Head, Debit (Dr), Credit (Cr), Reference, and Status.
   - Search and filter by entry type (Debit/Credit/All) and status.

4. **Automated Reconciliation Simulator (`/reconciliation`)** *(Hero Feature)*:
   - Interactive multi-stage reconciliation simulation with animated progress bar:
     1. `Preparing transactions...`
     2. `Comparing records...`
     3. `Checking amounts...`
     4. `Checking references...`
     5. `Finalizing reconciliation...`
   - Real-time heuristic scoring matrix:
     - **100% Score**: Exact Amount + Reference ID + Transaction Date.
     - **90% - 95% Score**: Exact Amount + Reference ID (cheque clearing variance).
     - **80% - 85% Score**: Exact Amount + Proximity Date (±2 days) + Description keywords.
     - **70% Score**: Fuzzy vendor description match.
   - Dynamic Confidence Threshold slider (50% – 100%) with live re-calculation and celebratory feedback!

5. **Matched Transactions Center (`/matches`)**:
   - Verified pairs matching bank statements with ledger vouchers.
   - Match Score pills (100%, 90%+, 80%+) and side-by-side transaction comparator modal.

6. **Discrepancies & Exception Management (`/discrepancies`)**:
   - Identifies specific variance reasons:
     - *Amount mismatch*
     - *Date mismatch / Timing differences*
     - *Missing accounting record (e.g. unbooked bank charges, interest credit)*
     - *Missing bank transaction (e.g. unpresented vendor cheques)*
     - *Reference mismatch*
   - Interactive **"Resolve"** workflow: choose resolution action (Journal voucher adjustment, Recognize bank charge, Timing difference write-off), enter audit remarks, and observe instant recalculation across the system.

7. **Reports & Real CSV Export (`/reports`)**:
   - Summary statistics and monthly trend graphs.
   - **Export CSV**: Generates genuine downloadable `.csv` files formatted for Microsoft Excel / Google Sheets.
   - **Generate Audit Report**: Printable, certified audit statement modal with browser print (`Ctrl+P`) support.

8. **System Settings (`/settings`)**:
   - Rule toggle switches (Amount matching, Date tolerance selector, Reference matching, Description fuzzy matching).
   - Notification preferences and a **1-click "Reset Demo Data"** button for flawless back-to-back presentation demos.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Design System**: Vanilla CSS with custom Fintech Design Tokens, Glassmorphism, and responsive drawer layout
- **Build Tool**: Vite

---

## 💻 How to Run Locally

### Prerequisites
Make sure you have **Node.js** (v18 or higher) installed on your system.

### Installation & Launch

1. Open your terminal in the project directory:
   ```bash
   cd c:\Minor-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📂 Project Architecture

```
src/
├── assets/                       # Brand icons and logo assets
├── components/
│   ├── common/
│   │   ├── EmptyState.jsx        # Polished empty query state
│   │   ├── Modal.jsx             # Accessible animated modal dialog
│   │   ├── StatCard.jsx          # KPI card with trend indicator
│   │   └── StatusBadge.jsx       # Color-coded status badge
│   ├── layout/
│   │   ├── Footer.jsx            # BCA Minor Project 2026 attribution
│   │   ├── Header.jsx            # Top navbar, quick status & notifications
│   │   └── Sidebar.jsx           # Persistent navigation & admin profile
│   └── modals/
│       ├── AddRecordModal.jsx    # Add Bank / Ledger entry for live testing
│       ├── AuditReportModal.jsx  # Printable audit statement modal
│       ├── ResolveDiscrepancyModal.jsx # Discrepancy resolution workflow
│       └── TransactionDetailModal.jsx  # Side-by-side comparison modal
├── context/
│   └── ReconciliationContext.jsx # Central state, localStorage sync & runner
├── data/
│   └── mockData.js               # 22+ Bank transactions & 20+ Ledger records (INR ₹)
├── pages/
│   ├── AccountingRecords.jsx     # General Ledger vouchers view
│   ├── BankTransactions.jsx      # Raw bank statement view
│   ├── Dashboard.jsx             # Overview cards, charts & recent feed
│   ├── Discrepancies.jsx         # Exception & variance resolution
│   ├── Matches.jsx               # Reconciled pairs & score breakdown
│   ├── Reconciliation.jsx        # Multi-step animated reconciliation simulator
│   ├── Reports.jsx               # Audit reports & CSV export
│   └── Settings.jsx              # Matching rules, threshold & reset demo
├── utils/
│   ├── exportCsv.js              # CSV file generator & downloader
│   ├── formatters.js             # Indian Currency (₹), date & number formatting
│   └── reconciliationEngine.js   # Multi-tier algorithmic scoring & matching engine
├── App.jsx                       # Router setup & routes configuration
├── index.css                     # Comprehensive Fintech Design System
└── main.jsx                      # React entry point
```

---

## 🎯 Recommended Presentation Demo Flow

1. **Dashboard (`/dashboard`)**: Highlight the KPI cards (Match Rate 94.4%, Matched 1,180, Discrepancies 20), Donut chart, and Recent Activity log.
2. **Bank Transactions (`/bank-transactions`)**: Demonstrate search, date filters, status filters, and click **"View Details"** on a transaction.
3. **Accounting Records (`/accounting-records`)**: Show the General Ledger with Debit/Credit breakdown and account heads.
4. **Reconciliation (`/reconciliation`)**: Click **"Run Reconciliation"**, observe the animated 5-step progress simulation, and review the instant results summary.
5. **Matches (`/matches`)**: Click **"Compare"** on a 100% or 92% match to display the side-by-side verification modal.
6. **Discrepancies (`/discrepancies`)**: Click **"Resolve"** on a pending discrepancy (e.g. Synergy Office Supplies), select a resolution action, submit remarks, and show that the status updates to **Resolved** and the pending counter decreases in the sidebar and dashboard.
7. **Reports (`/reports`)**: Click **"Export CSV"** to demonstrate real file download, and click **"Generate Report"** to show the printable audit statement.
8. **Settings (`/settings`)**: Demonstrate rule toggling, confidence threshold adjustments, and the **"Reset Demo Data"** button.

---

### Project Attribution
**Automated Reconciliation System | BCA Minor Project | 2026**
