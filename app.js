/* unified Premium SaaS ERP Scripts - app.js */

const state = {
    theme: 'dark',
    sidebarCollapsed: false,
    currentView: 'dashboard',
    activeSubmenu: null,
    
    // Workflow States
    workflows: [
        {
            name: "End-of-Day Checkout Pipeline",
            steps: [
                ["Ledger Master", "Customer Master"], // Step 1
                ["Sales Invoice", "FuelStation Order"], // Step 2
                ["Daybook", "Sales Vat Register"]     // Step 3
            ]
        }
    ],
    activeWorkflow: {
        name: null,
        steps: [],
        currentStepIdx: 0,
        running: false
    },
    
    // Temporary configurator workspace
    configSteps: [], // Array of arrays of screen names

    // User Role Tracking & HUD Auto-Mapping Options
    roleTrackingEnabled: true,
    autoMapSuggestions: true,
    currentUserRole: 'Accounting Clerk',
    roleNavigationData: {
        'System Administrator': { 'General Config': 4, 'Workflow Config': 3 },
        'Accounting Clerk': { 'Day Book': 5, 'Trial Balance': 3, 'Ledger Master': 2 },
        'Sales Agent': { 'Sales Invoice': 8, 'Customer Master': 4 },
        'Inventory Controller': { 'Product Master': 5, 'Stock Summary': 4 }
    }
};

// Complete Search Index of the entire Enterprise ERP 2.0 Sitemap (50+ screens)
const sitemap = [
    // Accounts & Financials
    { name: 'Daybook', type: 'report', group: 'Financials', description: 'Lists chronological transaction entries for the day.' },
    { name: 'Daybook Summary', type: 'report', group: 'Financials', description: 'Aggregated summaries of cash, bank, and journal vouchers.' },
    { name: 'General Ledger Voucher', type: 'report', group: 'Financials', description: 'Search and audit general double-entry journal vouchers.' },
    { name: 'Multiple Ledger Voucher', type: 'report', group: 'Financials', description: 'View multiple general ledger transactions simultaneously.' },
    { name: 'Sub Ledger Voucher', type: 'report', group: 'Financials', description: 'Audit subsidiary double-entry transaction ledgers.' },
    { name: 'Income Expenditure', type: 'report', group: 'Financials', description: 'Summarize income and operating expenditures.' },
    { name: 'Trial Balance', type: 'report', group: 'Financials', description: 'Consolidated debit and credit balances for all accounts.' },
    { name: 'Profit & Loss', type: 'report', group: 'Financials', description: 'Verify revenue margins, cost of goods, and net profit.' },
    { name: 'Balance Sheet', type: 'report', group: 'Financials', description: 'Review assets, liabilities, and owner equity balances.' },
    
    // Outstanding Reports
    { name: 'Receivables Summary', type: 'report', group: 'Outstanding', description: 'Summary of total outstanding customer dues (A/R).' },
    { name: 'A/R Ageing', type: 'report', group: 'Outstanding', description: 'Analyze customer receivables by ageing buckets.' },
    { name: 'Bill wise Dues (A/R)', type: 'report', group: 'Outstanding', description: 'Detailed pending customer invoices.' },
    { name: 'Payables Summary', type: 'report', group: 'Outstanding', description: 'Summary of outstanding supplier balances (A/P).' },
    { name: 'A/P Ageing', type: 'report', group: 'Outstanding', description: 'Analyze supplier payables by ageing intervals.' },
    { name: 'Bill wise Dues (A/P)', type: 'report', group: 'Outstanding', description: 'Detailed pending supplier bills.' },
    
    // Sales Reports
    { name: 'Sales Summary', type: 'report', group: 'Sales', description: 'Overview of total sales invoicing by item/group.' },
    { name: 'Sales Analysis', type: 'report', group: 'Sales', description: 'Breakdown of sales margins, trends, and classifications.' },
    { name: 'Sales Vat Register', type: 'report', group: 'Sales', description: 'Auditable VAT registry for customer invoice records.' },
    { name: 'Sales Return Vat Register', type: 'report', group: 'Sales', description: 'Auditable VAT registry for credit notes.' },
    { name: 'One Lakh Above Sales', type: 'report', group: 'Sales', description: 'Track high-value invoice records.' },
    { name: 'Pending Sales Quotation', type: 'report', group: 'Sales', description: 'Quotation records waiting for client confirmations.' },
    { name: 'Pending Sales Order', type: 'report', group: 'Sales', description: 'Client sales orders pending invoicing.' },
    { name: 'Pending Delivery Note', type: 'report', group: 'Sales', description: 'Dispatched stock items awaiting final invoicing.' },
    { name: 'Delivery Analysis', type: 'report', group: 'Sales', description: 'Audit dispatch dates and fulfillment rates.' },
    { name: 'Customer Master', type: 'form', group: 'Sales', description: 'Register customer contact details, credit limits, and billing terms.' },

    // Purchase Reports
    { name: 'Purchase Summary', type: 'report', group: 'Purchases', description: 'Overview of total procurements by item/group.' },
    { name: 'Purchase Analysis', type: 'report', group: 'Purchases', description: 'Breakdown of procurement costs and vendor rates.' },
    { name: 'Purchase Vat Register', type: 'report', group: 'Purchases', description: 'Auditable VAT registry for vendor bills.' },
    { name: 'Purchase Return Vat Register', type: 'report', group: 'Purchases', description: 'Auditable VAT registry for debit notes.' },
    { name: 'One Lakh Above Purchase', type: 'report', group: 'Purchases', description: 'Track high-value procurement entries.' },
    { name: 'Pending Purchase Order', type: 'report', group: 'Purchases', description: 'Vendor POs awaiting fulfillment.' },
    { name: 'Pending Receipt Note', type: 'report', group: 'Purchases', description: 'Received stock notes pending bill registration.' },
    { name: 'Receipt Note Analysis', type: 'report', group: 'Purchases', description: 'Audit delivery timescales and differences.' },
    { name: 'Voucher wise Costing', type: 'report', group: 'Purchases', description: 'Calculate landed costs for goods.' },

    // Cash & Bank
    { name: 'Cash/Bank Book', type: 'report', group: 'Cash & Bank', description: 'Consolidated cash vault and bank balance listings.' },
    { name: 'Cash/Bank Voucher', type: 'report', group: 'Cash & Bank', description: 'Track receipts, payments, and contra entries.' },
    { name: 'Bank Reconciliation', type: 'report', group: 'Cash & Bank', description: 'Verify bank statements against general ledgers.' },
    { name: 'Cheque Book Register', type: 'report', group: 'Cash & Bank', description: 'Log issue status of checkbooks.' },

    // Inventory Reports
    { name: 'Product Master', type: 'form', group: 'Inventory', description: 'Create and configure products, stock codes, and tax rates.' },
    { name: 'Stock Summary', type: 'report', group: 'Inventory', description: 'Inventory stock level listings.' },
    { name: 'Product Voucher', type: 'report', group: 'Inventory', description: 'Audit stock movements of products.' },
    { name: 'Product Ageing', type: 'report', group: 'Inventory', description: 'Analyze stock holding intervals.' },
    { name: 'Near Expiry Check', type: 'report', group: 'Inventory', description: 'Identify products nearing shelf-life end.' },
    { name: 'Price List Master', type: 'report', group: 'Inventory', description: 'Configure item pricing lists.' },
    { name: 'Consumption List', type: 'report', group: 'Inventory', description: 'Summarize product/material consumption logs.' },
    { name: 'Stock Transfer Register', type: 'report', group: 'Inventory', description: 'Log inter-warehouse stock movements.' },

    // Tax & Compliance
    { name: 'Annex 10 Registry', type: 'report', group: 'Tax', description: 'Generate Annex 10 compliance tables.' },
    { name: 'Annex 13 Summary', type: 'report', group: 'Tax', description: 'Generate Annex 13 purchase registries.' },
    { name: 'Annex 14 Materialized', type: 'report', group: 'Tax', description: 'Generate Annex 14 materialized sales views.' },
    { name: 'TDS Report', type: 'report', group: 'Tax', description: 'Summarize tax deducted at source listings.' },
    { name: 'Excise Register', type: 'report', group: 'Tax', description: 'Audit duty-paid product movements.' },
    { name: 'Vat Summary', type: 'report', group: 'Tax', description: 'Unified VAT tax summary statistics.' },

    // Audit Logs
    { name: 'Audit Trail Report', type: 'report', group: 'Audit', description: 'Track historical modifications, edits, and deletions.' },
    { name: 'Login Logs', type: 'report', group: 'Audit', description: 'Track active user logins.' },
    { name: 'Web API Log', type: 'report', group: 'Audit', description: 'Audit integration requests.' },

    // Setup & Configuration
    { name: 'General Configuration', type: 'form', group: 'Setup', description: 'Configure default compliance settings.' },
    { name: 'Fiscal Year Setup', type: 'form', group: 'Setup', description: 'Manage accounting fiscal cycles.' },
    { name: 'Import Data (Excel)', type: 'form', group: 'Setup', description: 'Import ledgers or products via spreadsheets.' },

    // Special Modules
    { name: 'FuelStation Order', type: 'form', group: 'Fuel Station', description: 'Log petrol pump distribution orders.' },
    { name: 'FuelStation Invoice', type: 'form', group: 'Fuel Station', description: 'Record fuel sales invoicing.' },
    { name: 'Meter Reading', type: 'form', group: 'Fuel Station', description: 'Track pump nozzle nozzle meter logs.' },
    { name: 'Agri Logistics Purchase', type: 'form', group: 'Industrial Logistics', description: 'Record milk collection details.' },
    { name: 'Agri Logistics Sales', type: 'form', group: 'Industrial Logistics', description: 'Record pasteurized product distributions.' },
    { name: 'Tea Purchase', type: 'form', group: 'Industrial Logistics', description: 'Record bulk tea leaf procurements.' }
];

// Key listener for Ctrl+K search focus
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.key === 'Meta') && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('commandInput').focus();
    }
});

// Populate the Command Search results list initially
function initSearchIndex() {
    const searchPanel = document.getElementById('searchResults');
    searchPanel.innerHTML = '';
    
    // Core routes
    let html = `
        <div class="results-section-header">Dashboard & Core Screens</div>
        <div class="result-item" onmousedown="executeSearchResult('dashboard', 'view')">
            <div class="result-item-left"><i class="fa-solid fa-chart-line"></i> <span>Dashboard Hub</span></div>
            <span class="result-item-badge">System</span>
        </div>
        <div class="result-item" onmousedown="executeSearchResult('sales-invoice', 'view')">
            <div class="result-item-left"><i class="fa-solid fa-file-invoice"></i> <span>Sales Invoice Creator</span></div>
            <span class="result-item-badge">Transactions</span>
        </div>
        <div class="result-item" onmousedown="executeSearchResult('daybook', 'view')">
            <div class="result-item-left"><i class="fa-solid fa-book"></i> <span>Day Book Report</span></div>
            <span class="result-item-badge">Reports</span>
        </div>
        <div class="result-item" onmousedown="executeSearchResult('ledger-master', 'view')">
            <div class="result-item-left"><i class="fa-solid fa-address-book"></i> <span>Ledger Master Account Creator</span></div>
            <span class="result-item-badge">Master</span>
        </div>
        <div class="results-section-header">All Sitemap Modules</div>
    `;
    
    sitemap.forEach((item, idx) => {
        let icon = item.type === 'report' ? 'fa-solid fa-file-invoice-dollar' : 'fa-solid fa-file-pen';
        html += `
            <div class="result-item" onmousedown="executeSearchResult('${item.name}', '${item.type}')">
                <div class="result-item-left"><i class="${icon}"></i> <span>${item.name}</span></div>
                <span class="result-item-badge">${item.group}</span>
            </div>
        `;
    });
    
    searchPanel.innerHTML = html;
}

// 1. Authentication
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const db = document.getElementById('dbname').value;

    if (user === 'admin' && pass === '123@Login') {
        showToast('Login Successful', 'Connected to: ' + db, 'success');
        
        const loginView = document.getElementById('loginView');
        const mainApp = document.getElementById('mainApp');
        
        loginView.style.transition = 'opacity 0.4s ease';
        loginView.style.opacity = '0';
        
        setTimeout(() => {
            loginView.style.display = 'none';
            mainApp.style.display = 'grid';
            mainApp.style.opacity = '0';
            
            setTimeout(() => {
                mainApp.style.opacity = '1';
                initSearchIndex();
                renderWorkflowsList();
                if (typeof renderCreatedWorkflowsTable === 'function') renderCreatedWorkflowsTable();
                addConfigStepBox(); // Add first configuration step dynamically
                recalculateInvoiceTotals();
            }, 50);
        }, 400);
    } else {
        showToast('Access Denied', 'Invalid credentials! Use admin / 123@Login', 'error');
    }
}

// 2. Routing Switcher
function switchView(viewId) {
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    
    // Auto-track role navigation behavior
    let friendlyName = viewId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (friendlyName === 'Daybook') friendlyName = 'Day Book';
    if (typeof trackScreenVisit === 'function') trackScreenVisit(friendlyName);
    
    if (viewId === 'workflow-config' && typeof syncRoleMappingUI === 'function') {
        syncRoleMappingUI();
        if (typeof renderCreatedWorkflowsTable === 'function') renderCreatedWorkflowsTable();
    }
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    const target = document.getElementById('view-' + viewId);
    if (target) {
        target.classList.add('active');
        state.currentView = viewId;
    }
    
    const sidebarLink = document.getElementById('link-' + viewId);
    if (sidebarLink) {
        sidebarLink.classList.add('active');
    }
    
    // Hide dropdown list
    document.getElementById('searchResults').classList.remove('open');
}

// 3. Navigation Controls
function toggleSidebar() {
    const container = document.getElementById('appContainer');
    state.sidebarCollapsed = !state.sidebarCollapsed;
    container.classList.toggle('sidebar-collapsed');
}

function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    const isOpen = submenu.classList.contains('open');
    
    document.querySelectorAll('.menu-submenu').forEach(sub => sub.classList.remove('open'));
    
    if (!isOpen) {
        submenu.classList.add('open');
        state.activeSubmenu = id;
    } else {
        state.activeSubmenu = null;
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    showToast('Theme Change', 'Applied ' + state.theme + ' theme mode.', 'success');
}

function toggleSupportPanel() {
    document.getElementById('supportPanel').classList.toggle('open');
}

function toggleMegaMenu() {
    document.getElementById('megaMenu').classList.toggle('open');
}

function closeMegaMenuOutside(event) {
    if (event.target.id === 'megaMenu') {
        toggleMegaMenu();
    }
}

function clearSystemCache() {
    showToast('Clearing Cache', 'ERP local system cache cleared.', 'success');
}

function changeBranch(val) {
    showToast('Branch Redirect', 'Branch set to ' + val, 'success');
}

// 4. Omnisearch Engine
function showResults() {
    document.getElementById('searchResults').classList.add('open');
}

function hideResults() {
    setTimeout(() => {
        document.getElementById('searchResults').classList.remove('open');
    }, 200);
}

function handleCommandSearch() {
    const query = document.getElementById('commandInput').value.toLowerCase();
    const items = document.querySelectorAll('.result-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

function executeSearchResult(targetName, type) {
    document.getElementById('megaMenu').classList.remove('open');
    
    if (type === 'view') {
        switchView(targetName);
    } else {
        renderDynamicView(targetName, type);
    }
    
    document.getElementById('commandInput').value = '';
    showToast('Navigation Complete', 'Navigated to ' + targetName, 'success');
}

function triggerNavAction(name) {
    const formatted = name.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
    const staticViews = ['dashboard', 'sales-invoice', 'daybook', 'ledger-master', 'workflow-config'];
    
    if (staticViews.includes(formatted)) {
        switchView(formatted);
        return;
    }

    // Fuzzy find sitemap item using lowercase mapping, spaces-to-dashes and substring matching
    let item = sitemap.find(s => s.name.toLowerCase() === name.toLowerCase() || 
                                 s.name.toLowerCase().replace(/\s+/g, '-') === formatted ||
                                 s.name.toLowerCase().replace(/\s+/g, '').includes(formatted.replace(/-/g, '')) ||
                                 formatted.replace(/-/g, '').includes(s.name.toLowerCase().replace(/\s+/g, '')));
    if (item) {
        executeSearchResult(item.name, item.type);
    } else {
        // Fallback dynamic renderer
        executeSearchResult(name, name.toLowerCase().includes('report') ? 'report' : 'form');
    }
}

function triggerAction(actionName) {
    showToast('Vat Compliance', actionName, 'success');
}

// 5. Dynamic Page Generator
function renderDynamicView(name, type) {
    let item = sitemap.find(s => s.name === name);
    if (!item) {
        const isReport = name.toLowerCase().includes('report') || name.toLowerCase().includes('summary') || name.toLowerCase().includes('book') || name.toLowerCase().includes('register') || name.toLowerCase().includes('ageing') || name.toLowerCase().includes('balance') || name.toLowerCase().includes('analysis');
        item = {
            name: name,
            type: type || (isReport ? 'report' : 'form'),
            group: 'Dynamic Module',
            description: 'Operational enterprise management interface.'
        };
    }
    
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    const container = document.getElementById('view-dynamic-container');
    container.classList.add('active');
    state.currentView = name.toLowerCase().replace(/\s+/g, '-');
    
    // Auto-track role navigation behavior
    if (typeof trackScreenVisit === 'function') trackScreenVisit(name);
    
    document.getElementById('dynamicTitle').textContent = item.name;
    document.getElementById('dynamicSubtitle').textContent = `${item.group} Section — ${item.description}`;
    
    const block = document.getElementById('dynamicContentBlock');
    block.innerHTML = '';
    
    const lowerName = name.toLowerCase();
    
    // 1. Voucher Input (GL Voucher, Multiple Ledger Voucher, Cash/Bank Voucher, etc.)
    if (lowerName.includes('voucher') && item.type === 'form') {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
                <h4 style="font-weight:700; color:var(--text-primary);">New Journal Transaction</h4>
                <div style="display:flex; gap:12px;">
                    <span style="font-size:0.85rem; display:flex; align-items:center;">Ref ID: <strong class="ml-1 text-white">JV-${Date.now().toString().slice(-6)}</strong></span>
                    <span style="font-size:0.85rem; display:flex; align-items:center; margin-left:16px;">Voucher Date: <input type="date" class="form-control" style="width:140px; padding:4px 8px; margin-left:6px;" value="2026-06-07"></span>
                </div>
            </div>
            <div class="table-container">
                <table class="grid-table">
                    <thead>
                        <tr>
                            <th style="width: 5%">S.N.</th>
                            <th style="width: 35%">Ledger Master Account</th>
                            <th style="width: 12%">Dr / Cr</th>
                            <th style="width: 18%">Amount ($)</th>
                            <th style="width: 25%">Narration / Remarks</th>
                            <th style="width: 5%"></th>
                        </tr>
                    </thead>
                    <tbody id="voucherItemRows">
                        <tr>
                            <td style="text-align:center;">1</td>
                            <td>
                                <select class="grid-input">
                                    <option value="primary_bank" selected>Primary Operating Bank Account</option>
                                    <option value="cash">Cash In Hand Office</option>
                                    <option value="sales">Sales Account Revenue</option>
                                    <option value="purchases">Purchase Raw Materials</option>
                                </select>
                            </td>
                            <td>
                                <select class="grid-input" onchange="window.toggleVoucherDrCr(this)">
                                    <option value="dr" selected>Dr</option>
                                    <option value="cr">Cr</option>
                                </select>
                            </td>
                            <td><input type="number" class="grid-input voucher-amount" value="50000" min="0" oninput="window.recalculateVoucherTotals()"></td>
                            <td><input type="text" class="grid-input" value="Invoice payment collection receipt" placeholder="Line remarks..."></td>
                            <td><button class="btn-icon" onclick="this.closest('tr').remove(); window.recalculateVoucherTotals();"><i class="fa-solid fa-trash"></i></button></td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">2</td>
                            <td>
                                <select class="grid-input">
                                    <option value="receivables" selected>Accounts Receivable - Bhatbhateni</option>
                                    <option value="cash">Cash In Hand Office</option>
                                    <option value="sales">Sales Account Revenue</option>
                                    <option value="purchases">Purchase Raw Materials</option>
                                </select>
                            </td>
                            <td>
                                <select class="grid-input" onchange="window.toggleVoucherDrCr(this)">
                                    <option value="dr">Dr</option>
                                    <option value="cr" selected>Cr</option>
                                </select>
                            </td>
                            <td><input type="number" class="grid-input voucher-amount" value="50000" min="0" oninput="window.recalculateVoucherTotals()"></td>
                            <td><input type="text" class="grid-input" value="Settlement of invoice outstanding" placeholder="Line remarks..."></td>
                            <td><button class="btn-icon" onclick="this.closest('tr').remove(); window.recalculateVoucherTotals();"><i class="fa-solid fa-trash"></i></button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
                <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="window.addVoucherRow()"><i class="fa-solid fa-plus mr-2"></i> Add Entry Row</button>
                <div style="display:flex; gap:24px; align-items:center; font-size:0.95rem;">
                    <div>Total Dr: <strong id="voucherTotalDr" style="color:var(--color-success)">$50,000.00</strong></div>
                    <div>Total Cr: <strong id="voucherTotalCr" style="color:var(--color-success)">$50,000.00</strong></div>
                    <div id="voucherBalanceStatus"><span class="badge success"><i class="fa-solid fa-check mr-1"></i> Balanced</span></div>
                </div>
            </div>
            
            <div class="form-group" style="margin-top:20px;">
                <label>Overall Transaction Narration</label>
                <textarea class="form-control" style="padding-left:16px; height:60px; resize:none;" placeholder="Narration notes..."></textarea>
            </div>
            
            <div class="action-row" style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <button class="btn-secondary" style="width:auto; padding:10px 20px;" onclick="switchView('dashboard')">Cancel</button>
                <button class="btn-primary" id="voucherSubmitBtn" style="width:auto; padding:10px 24px;" onclick="showToast('Voucher Posted', 'Double-entry audit log committed.', 'success'); switchView('dashboard');">Post Double-Entry Voucher</button>
            </div>
        `;
        return;
    }
    
    // 2. Trial Balance Financial Statement
    if (lowerName.includes('trial balance')) {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
                <div style="display:flex; gap:12px; align-items:center;">
                    <label>As of Date:</label>
                    <input type="date" class="form-control" style="width:160px; padding:6px 12px;" value="2026-06-07">
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="showToast('Excel Export', 'Trial Balance exported.', 'success')"><i class="fa-solid fa-file-excel mr-2"></i> Export Excel</button>
                    <button class="btn-primary" style="width:auto; padding:8px 16px; background-color:var(--secondary);" onclick="window.print()"><i class="fa-solid fa-print mr-2"></i> Print</button>
                </div>
            </div>
            <div class="table-container">
                <table class="app-table">
                    <thead>
                        <tr>
                            <th>Ledger Master Account Classification</th>
                            <th style="text-align: right;">Opening Debit ($)</th>
                            <th style="text-align: right;">Opening Credit ($)</th>
                            <th style="text-align: right;">Transactions Debit ($)</th>
                            <th style="text-align: right;">Transactions Credit ($)</th>
                            <th style="text-align: right;">Closing Debit ($)</th>
                            <th style="text-align: right;">Closing Credit ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Capital & Equity</strong></td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right; color:var(--text-muted);">2,500,000.00</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right; color:var(--text-primary);">2,500,000.00</td>
                        </tr>
                        <tr>
                            <td><strong>Primary Operating Bank Account</strong></td>
                            <td style="text-align: right; color:var(--text-muted);">1,200,000.00</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right; color:var(--color-success);">450,000.00</td>
                            <td style="text-align: right; color:var(--color-danger);">100,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">1,550,000.00</td>
                            <td style="text-align: right;">-</td>
                        </tr>
                        <tr>
                            <td><strong>Office Cash Reserve</strong></td>
                            <td style="text-align: right; color:var(--text-muted);">50,000.00</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right; color:var(--color-success);">20,000.00</td>
                            <td style="text-align: right; color:var(--color-danger);">30,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">40,000.00</td>
                            <td style="text-align: right;">-</td>
                        </tr>
                        <tr>
                            <td><strong>Accounts Receivable - Customers</strong></td>
                            <td style="text-align: right; color:var(--text-muted);">980,000.00</td>
                            <td style="text-align: right;">-</td>
                            <td style="text-align: right; color:var(--color-success);">570,000.00</td>
                            <td style="text-align: right; color:var(--color-danger);">600,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">950,000.00</td>
                            <td style="text-align: right;">-</td>
                        </tr>
                        <tr style="border-top:2px solid var(--border-color); font-weight:700; background-color:rgba(255,255,255,0.02)">
                            <td style="color:var(--text-primary);">Grand Trial Totals</td>
                            <td style="text-align: right; color:var(--text-primary);">$2,230,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">$2,500,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">$1,040,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">$730,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">$2,540,000.00</td>
                            <td style="text-align: right; color:var(--text-primary);">$2,540,000.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        return;
    }
    
    // 3. Balance Sheet Financial Statement
    if (lowerName.includes('balance sheet')) {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <div>As of Fiscal Period Setup: <strong class="text-white">2026/27</strong></div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="showToast('Excel Export', 'Balance Sheet exported.', 'success')"><i class="fa-solid fa-file-excel mr-2"></i> Export Excel</button>
                    <button class="btn-primary" style="width:auto; padding:8px 16px; background-color:var(--secondary);" onclick="window.print()"><i class="fa-solid fa-print mr-2"></i> Print</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <!-- Capital & Liabilities -->
                <div class="card" style="padding:20px;">
                    <h4 style="font-weight:700; color:var(--color-brand); border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:16px;">Capital & Liabilities</h4>
                    <div style="display:flex; flex-direction:column; gap:12px; font-size:0.9rem;">
                        <div style="display:flex; justify-content:space-between;"><span>Capital Reserve Account</span> <strong>$2,500,000.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Retained Earning Surplus</span> <strong>$414,200.00</strong></div>
                        <div style="display:flex; justify-content:space-between; padding-left:16px; color:var(--text-muted);"><span>Current Net Income</span> <span>$180,500.00</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Accounts Payable - Suppliers</span> <strong>$921,450.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>TDS Liabilities Accrued</span> <strong>$21,300.00</strong></div>
                        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:12px; font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-top:40px;">
                            <span>Total Capital & Liabilities</span> <span>$3,856,950.00</span>
                        </div>
                    </div>
                </div>
                <!-- Assets -->
                <div class="card" style="padding:20px;">
                    <h4 style="font-weight:700; color:var(--color-success); border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:16px;">Assets</h4>
                    <div style="display:flex; flex-direction:column; gap:12px; font-size:0.9rem;">
                        <div style="display:flex; justify-content:space-between;"><span>Primary Operating Bank Reserves</span> <strong>$1,550,000.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Cash In Hand Reserve</span> <strong>$40,000.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Accounts Receivable - Client Dues</span> <strong>$1,450,200.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Inventory Asset Valuation</span> <strong>$621,450.00</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Fixed Assets (Office & Land)</span> <strong>$195,300.00</strong></div>
                        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:12px; font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-top:40px;">
                            <span>Total Assets</span> <span>$3,856,950.00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // 4. Profit & Loss Financial Statement
    if (lowerName.includes('profit & loss') || lowerName.includes('profit and loss')) {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <div>Fiscal Year: <strong class="text-white">2026/27</strong> | Current Period: <strong class="text-white">As of Today</strong></div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="showToast('Excel Export', 'P&L exported.', 'success')"><i class="fa-solid fa-file-excel mr-2"></i> Export Excel</button>
                    <button class="btn-primary" style="width:auto; padding:8px 16px; background-color:var(--secondary);" onclick="window.print()"><i class="fa-solid fa-print mr-2"></i> Print</button>
                </div>
            </div>
            <div class="card" style="max-width:700px; margin:0 auto; padding:32px;">
                <h3 style="font-weight:700; color:var(--text-primary); text-align:center; margin-bottom:24px;">Operating Profit & Loss Statement</h3>
                <div style="display:flex; flex-direction:column; gap:14px; font-size:0.95rem;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px; font-weight:600; color:var(--text-primary);">
                        <span>Sales Operating Revenue</span> <span>$8,421,950.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-left:16px;">
                        <span>Less: Cost of Sales (COGS)</span> <span style="color:var(--color-danger);">- $5,230,400.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px; font-weight:700; color:var(--text-primary); margin-top:8px;">
                        <span>Gross Operating Profit Margin</span> <span>$3,191,550.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-left:16px;">
                        <span>Less: Office & Admin Salary Costs</span> <span style="color:var(--color-danger);">- $1,450,000.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-left:16px;">
                        <span>Less: Depot Fuel & Logistics</span> <span style="color:var(--color-danger);">- $842,000.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-left:16px;">
                        <span>Less: Depreciation Fixed Assets</span> <span style="color:var(--color-danger);">- $42,500.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px; font-weight:600; color:var(--text-primary); margin-top:8px;">
                        <span>Earnings Before Tax & Interests</span> <span>$857,050.00</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding-left:16px;">
                        <span>Less: Income Tax Deductions (25%)</span> <span style="color:var(--color-danger);">- $214,262.50</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:2px solid var(--color-brand); padding-top:12px; font-weight:800; font-size:1.1rem; color:var(--color-brand); margin-top:16px;">
                        <span>Net Surplus Earnings (PAT)</span> <span>$642,787.50</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // 5. Stock Summary Report
    if (lowerName.includes('stock summary')) {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
                <div style="display:flex; gap:12px; align-items:center;">
                    <label>Filter Warehouse:</label>
                    <select class="form-control" style="width:180px; padding:6px 12px;">
                        <option>All Warehouses</option>
                        <option>Central Warehouse</option>
                        <option>Secondary Branch Store</option>
                    </select>
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="showToast('Excel Export', 'Stock Summary exported.', 'success')"><i class="fa-solid fa-file-excel mr-2"></i> Export Excel</button>
                    <button class="btn-primary" style="width:auto; padding:8px 16px; background-color:var(--secondary);" onclick="window.print()"><i class="fa-solid fa-print mr-2"></i> Print</button>
                </div>
            </div>
            <div class="table-container">
                <table class="app-table">
                    <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Product Name Description</th>
                            <th>Category Group</th>
                            <th style="text-align: right;">Opening Stock</th>
                            <th style="text-align: right;">Inwards (Qty)</th>
                            <th style="text-align: right;">Outwards (Qty)</th>
                            <th style="text-align: right;">Closing Balance</th>
                            <th>Units</th>
                            <th style="text-align: right;">Avg Cost Rate</th>
                            <th style="text-align: right;">Asset Valuation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>PRD-GHE-001</strong></td>
                            <td>Premium Item Alpha (Pack of 10)</td>
                            <td>Industrial Logistics</td>
                            <td style="text-align: right;">120</td>
                            <td style="text-align: right; color:var(--color-success);">250</td>
                            <td style="text-align: right; color:var(--color-danger);">210</td>
                            <td style="text-align: right;"><strong>160</strong></td>
                            <td>PCS</td>
                            <td style="text-align: right;">$250.00</td>
                            <td style="text-align: right; color:var(--color-success);">$40,000.00</td>
                        </tr>
                        <tr>
                            <td><strong>PRD-TEA-082</strong></td>
                            <td>Standard Item Beta (Pack of 5)</td>
                            <td>Industrial Logistics</td>
                            <td style="text-align: right;">450</td>
                            <td style="text-align: right; color:var(--color-success);">100</td>
                            <td style="text-align: right; color:var(--color-danger);">350</td>
                            <td style="text-align: right;"><strong>200</strong></td>
                            <td>PCS</td>
                            <td style="text-align: right;">$120.00</td>
                            <td style="text-align: right; color:var(--color-success);">$24,000.00</td>
                        </tr>
                        <tr>
                            <td><strong>PRD-PET-091</strong></td>
                            <td>Industrial Lubricant Bulk</td>
                            <td>Fuel Station</td>
                            <td style="text-align: right;">12,000</td>
                            <td style="text-align: right; color:var(--color-success);">25,000</td>
                            <td style="text-align: right; color:var(--color-danger);">22,000</td>
                            <td style="text-align: right;"><strong>15,000</strong></td>
                            <td>Ltr</td>
                            <td style="text-align: right;">$140.00</td>
                            <td style="text-align: right; color:var(--color-success);">$2,100,000.00</td>
                        </tr>
                        <tr style="border-top:2px solid var(--border-color); font-weight:700;">
                            <td colspan="3">Stock Valuations Total</td>
                            <td style="text-align: right;">12,570</td>
                            <td style="text-align: right;">25,350</td>
                            <td style="text-align: right;">22,560</td>
                            <td style="text-align: right;">15,360</td>
                            <td></td>
                            <td></td>
                            <td style="text-align: right; color:var(--color-brand);">$2,164,000.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        return;
    }
    
    // 6. Excel Data Importer Setup
    if (lowerName.includes('import data')) {
        block.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
                <div style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 50px 30px; text-align: center; background-color: rgba(255,255,255,0.01); transition:var(--transition);" ondragover="event.preventDefault(); this.style.borderColor='var(--primary)';" ondragleave="this.style.borderColor='var(--border-color)';" ondrop="event.preventDefault(); this.style.borderColor='var(--border-color)'; showToast('Spreadsheet Loaded', 'Analyzing schema layouts.', 'success');">
                    <i class="fa-solid fa-cloud-arrow-up" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h3 style="font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Drag & Drop Excel Spreadsheet</h3>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 24px;">Supported files: xls, xlsx, csv (Max size 15MB)</p>
                    
                    <input type="file" id="excelFileSelect" style="display:none;" onchange="showToast('Spreadsheet Loaded', 'Uploaded ' + this.files[0].name, 'success');">
                    <button class="btn-primary" style="width:auto; padding:10px 24px;" onclick="document.getElementById('excelFileSelect').click()">Select Local File</button>
                </div>
                
                <div style="margin-top: 30px;" class="card">
                    <h4 style="font-weight:700; margin-bottom:12px; color:var(--text-primary);">Excel Templates Downloads</h4>
                    <p style="font-size:0.85rem; margin-bottom:16px;">Download structured spreadsheet formats to map accounts properly without mapping schema errors.</p>
                    <div style="display:flex; gap:12px;">
                        <button class="btn-primary" style="background-color: var(--bg-base); border: 1px solid var(--border-color); color:var(--text-primary); width:auto; padding:8px 16px;" onclick="showToast('Downloading Template', 'Ledger master template offline.', 'success')"><i class="fa-solid fa-file-invoice mr-2"></i> Ledger Excel Template</button>
                        <button class="btn-primary" style="background-color: var(--bg-base); border: 1px solid var(--border-color); color:var(--text-primary); width:auto; padding:8px 16px;" onclick="showToast('Downloading Template', 'Product inventory template offline.', 'success')"><i class="fa-solid fa-boxes-stacked mr-2"></i> Product Excel Template</button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // 7. General System Configurations
    if (lowerName.includes('general config') || lowerName.includes('general settings')) {
        block.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:20px; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="config-tab-btn active hud-step-button" onclick="window.showConfigTab('company')">Company Profile</button>
                    <button type="button" class="config-tab-btn hud-step-button" onclick="window.showConfigTab('tax')">Tax & VAT Setup</button>
                    <button type="button" class="config-tab-btn hud-step-button" onclick="window.showConfigTab('theme')">UI Branding & Themes</button>
                    <button type="button" class="config-tab-btn hud-step-button" onclick="window.showConfigTab('sidebar')">Sidebar Menu Config</button>
                </div>
                
                <form onsubmit="event.preventDefault(); showToast('Config Saved', 'System configurations locked.', 'success'); switchView('dashboard');">
                    <!-- Tab 1: Company Profile -->
                    <div id="config-panel-company" class="config-tab-panel">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label>Company Legal Registered Name</label>
                                <input type="text" class="form-control" style="padding-left:16px;" value="Enterprise Corp Pvt. Ltd.">
                            </div>
                            <div class="form-group">
                                <label>Tax Registry Number (PAN / VAT)</label>
                                <input type="text" class="form-control" style="padding-left:16px;" value="TAX-987654321">
                            </div>
                            <div class="form-group">
                                <label>State Region / Zone Address</label>
                                <input type="text" class="form-control" style="padding-left:16px;" value="Ward-03, Central HQ">
                            </div>
                            <div class="form-group">
                                <label>Default Currency Symbol</label>
                                <select class="form-control" style="padding-left:16px;">
                                    <option selected>USD ($) - US Dollar</option>
                                    <option>USD ($) - US Dollars</option>
                                    <option>INR (₹) - Indian Rupee</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:20px;" class="card">
                            <h4 style="font-weight:700; color:var(--text-primary);">Operational Feature Flags</h4>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <h5 style="font-weight:600; color:white;">Enable Double-Entry Validation Alerts</h5>
                                    <p style="font-size:0.8rem; color:var(--text-body);">Throw error popups if Debits and Credits are unbalanced when saving.</p>
                                </div>
                                <input type="checkbox" checked style="width:20px; height:20px; cursor:pointer;">
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <h5 style="font-weight:600; color:white;">Enable Auto Negative Stock Warn</h5>
                                    <p style="font-size:0.8rem; color:var(--text-body);">Alert billing clerks if a sales invoice exceeds warehouse quantity assets.</p>
                                </div>
                                <input type="checkbox" checked style="width:20px; height:20px; cursor:pointer;">
                            </div>
                        </div>
                    </div>

                    <!-- Tab 2: Tax & Compliance Settings -->
                    <div id="config-panel-tax" class="config-tab-panel" style="display:none;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label>Standard VAT Rate (%)</label>
                                <input type="number" class="form-control" style="padding-left:16px;" value="13">
                            </div>
                            <div class="form-group">
                                <label>Excise Duty Tariff Code</label>
                                <input type="text" class="form-control" style="padding-left:16px;" value="CD-2026-EXC">
                            </div>
                            <div class="form-group">
                                <label>Standard TDS Rate - Service Contracts (%)</label>
                                <input type="number" step="0.1" class="form-control" style="padding-left:16px;" value="1.5">
                            </div>
                            <div class="form-group">
                                <label>Tax Compliance Reporting Cycle</label>
                                <select class="form-control" style="padding-left:16px;">
                                    <option selected>Monthly (Annex 13 / 14)</option>
                                    <option>Quarterly (Consolidated)</option>
                                    <option>Annual Audit Settlement</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 3: UI Theme Palette Configurator -->
                    <div id="config-panel-theme" class="config-tab-panel" style="display:none;">
                        <h4 style="font-weight:700; color:var(--text-primary); margin-bottom:8px; font-size:1rem;">Professional ERP Color Themes</h4>
                        <p style="font-size:0.85rem; margin-bottom:20px; color:var(--text-body);">Apply enterprise-grade, high-contrast palettes instantly across the system workspace.</p>
                        
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:20px;">
                            <!-- Default Theme -->
                            <div class="card theme-select-card" style="cursor:pointer; border:1px solid var(--border-color); padding:16px;" onclick="window.applyColorPalette('default')">
                                <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Amethyst Slate (Default)</h5>
                                <div style="display:flex; gap:8px;">
                                    <span style="background-color:#8b5cf6; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
                                    <span style="background-color:#06b6d4; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
                                    <span style="background-color:#068abf; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">Modern Fintech SaaS accents</p>
                            </div>
                            
                            <!-- Sapphire Blue Theme -->
                            <div class="card theme-select-card" style="cursor:pointer; border:1px solid var(--border-color); padding:16px;" onclick="window.applyColorPalette('sapphire')">
                                <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Sapphire & Steel Blue</h5>
                                <div style="display:flex; gap:8px;">
                                    <span style="background-color:#0066cc; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
                                    <span style="background-color:#00b3b3; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
                                    <span style="background-color:#0052a3; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">Classic financial & banking layout</p>
                            </div>
                            
                            <!-- Emerald Green Theme -->
                            <div class="card theme-select-card" style="cursor:pointer; border:1px solid var(--border-color); padding:16px;" onclick="window.applyColorPalette('emerald')">
                                <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Emerald Mint & Forest</h5>
                                <div style="display:flex; gap:8px;">
                                    <span style="background-color:#10b981; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
                                    <span style="background-color:#059669; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
                                    <span style="background-color:#047857; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">Agro-chemical & logistics theme</p>
                            </div>
                            
                            <!-- Industrial Amber Theme -->
                            <div class="card theme-select-card" style="cursor:pointer; border:1px solid var(--border-color); padding:16px;" onclick="window.applyColorPalette('industrial')">
                                <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Nordic Charcoal & Amber</h5>
                                <div style="display:flex; gap:8px;">
                                    <span style="background-color:#f59e0b; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
                                    <span style="background-color:#d97706; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
                                    <span style="background-color:#b45309; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">Industrial stocks & factory theme</p>
                            </div>

                            <!-- Slate Theme -->
                            <div class="card theme-select-card" style="cursor:pointer; border:1px solid var(--border-color); padding:16px;" onclick="window.applyColorPalette('charcoal')">
                                <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Slate & Steel Grey</h5>
                                <div style="display:flex; gap:8px;">
                                    <span style="background-color:#64748b; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
                                    <span style="background-color:#475569; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
                                    <span style="background-color:#334155; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
                                </div>
                                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">High-security audit & book minimal</p>
                            </div>
                            </div>

                        <!-- Typography Settings -->
                        <h4 style="font-weight:700; color:var(--text-primary); margin-top:30px; margin-bottom:12px; font-size:1rem;">Enterprise Typography Configuration</h4>
                        <p style="font-size:0.85rem; margin-bottom:16px; color:var(--text-body);">Select the system typeface used across all accounting ledgers, command panels, and transaction modules.</p>
                        
                        <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
                            <button type="button" class="btn-primary" style="background-color:var(--bg-base); border:1px solid var(--border-color); color:var(--text-primary); width:auto; padding:10px 16px; font-family:'Plus Jakarta Sans', sans-serif; font-size:0.85rem;" onclick="window.applyFontFamily('Plus Jakarta Sans')">Plus Jakarta Sans</button>
                            <button type="button" class="btn-primary" style="background-color:var(--bg-base); border:1px solid var(--border-color); color:var(--text-primary); width:auto; padding:10px 16px; font-family:'Poppins', sans-serif; font-size:0.85rem;" onclick="window.applyFontFamily('Poppins')">Poppins</button>
                            <button type="button" class="btn-primary" style="background-color:var(--bg-base); border:1px solid var(--border-color); color:var(--text-primary); width:auto; padding:10px 16px; font-family:'Inter', sans-serif; font-size:0.85rem;" onclick="window.applyFontFamily('Inter')">Inter UI</button>
                            <button type="button" class="btn-primary" style="background-color:var(--bg-base); border:1px solid var(--border-color); color:var(--text-primary); width:auto; padding:10px 16px; font-family:'Roboto', sans-serif; font-size:0.85rem;" onclick="window.applyFontFamily('Roboto')">Roboto Ledger</button>
                            <button type="button" class="btn-primary" style="background-color:var(--bg-base); border:1px solid var(--border-color); color:var(--text-primary); width:auto; padding:10px 16px; font-family:'Outfit', sans-serif; font-size:0.85rem;" onclick="window.applyFontFamily('Outfit')">Outfit Sans</button>
                        </div>

                        <!-- Custom Theme Creator -->
                        <h4 style="font-weight:700; color:var(--text-primary); margin-top:30px; margin-bottom:12px; font-size:1rem;">Custom Branding Workspace Theme Creator</h4>
                        <p style="font-size:0.85rem; margin-bottom:16px; color:var(--text-body);">Design your own custom corporate branding theme. Pick your primary/secondary colors and background levels.</p>
                        
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:16px; margin-bottom:20px;" id="customThemeCreator">
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Primary Accent</label>
                                <input type="color" id="custPrimary" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#8b5cf6">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Secondary Accent</label>
                                <input type="color" id="custSecondary" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#06b6d4">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Brand Corporate</label>
                                <input type="color" id="custBrand" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#068abf">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Base Background</label>
                                <input type="color" id="custBgBase" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#060913">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Card/Sidebar Bg</label>
                                <input type="color" id="custBgCard" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#0f1424">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.75rem; font-weight:600;">Sidebar Link Hover</label>
                                <input type="color" id="custBgSidebarHover" class="form-control" style="padding:4px; height:40px; cursor:pointer;" value="#171e35">
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end;">
                            <button type="button" class="btn-primary" style="width:auto; padding:10px 20px; background-color:var(--secondary);" onclick="window.saveCustomTheme()"><i class="fa-solid fa-floppy-disk mr-2"></i> Save & Apply Custom Theme</button>
                        </div>
                    </div>
                    
                    <!-- Tab 4: Sidebar Menu Config -->
                    <div id="config-panel-sidebar" class="config-tab-panel" style="display:none;">
                        <h4 style="font-weight:700; color:var(--text-primary); margin-bottom:16px; font-size:0.95rem;">Create Custom Sidebar Menu Group</h4>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                            <div class="form-group">
                                <label>Menu Group Name</label>
                                <input type="text" id="customGroupName" class="form-control" style="padding-left:16px;" placeholder="e.g. Operations">
                            </div>
                            <div class="form-group">
                                <label>Choose Menu Icon</label>
                                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;" id="customIconSelector">
                                    <span class="custom-icon-option active" data-icon="fa-solid fa-layer-group" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Layer Group"><i class="fa-solid fa-layer-group"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-boxes-packing" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Logistics"><i class="fa-solid fa-boxes-packing"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-chart-line" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Chart"><i class="fa-solid fa-chart-line"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-credit-card" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Payments"><i class="fa-solid fa-credit-card"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-truck-ramp-box" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Shipping"><i class="fa-solid fa-truck-ramp-box"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-warehouse" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Warehouse"><i class="fa-solid fa-warehouse"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-file-invoice-dollar" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Billing"><i class="fa-solid fa-file-invoice-dollar"></i></span>
                                    <span class="custom-icon-option" data-icon="fa-solid fa-shield-halved" onclick="window.selectCustomIcon(this)" style="cursor:pointer; padding:8px 12px; border:1px solid var(--border-color); border-radius:4px; display:inline-block; transition:var(--transition);" title="Security"><i class="fa-solid fa-shield-halved"></i></span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="margin-bottom:8px; display:block;">Select Modules / Screens to Group</label>
                            <div style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:4px; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:10px; background-color:var(--bg-base);" class="custom-scrollbar" id="customGroupModulesList">
                                <!-- Populated dynamically -->
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end;">
                            <button type="button" id="saveSidebarGroupBtn" class="btn-primary" style="width:auto; padding:10px 20px; background-color:var(--secondary);" onclick="window.saveCustomSidebarGroup()"><i class="fa-solid fa-circle-plus mr-2"></i> Add Module Group</button>
                        </div>

                        <!-- Configured Groups List -->
                        <div style="margin-top:32px; border-top:1px solid var(--border-color); padding-top:20px;">
                            <h4 style="font-weight:700; color:var(--text-primary); margin-bottom:16px; font-size:0.95rem;">Active Sidebar Menu Groups</h4>
                            <div id="configuredSidebarGroupsList" style="display:flex; flex-direction:column; gap:12px;">
                                <!-- Dynamically populated list -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-row" style="display:flex; justify-content:flex-end; border-top:1px solid var(--border-color); padding-top:20px; margin-top:20px;">
                        <button type="submit" class="btn-primary" style="width:auto; padding:12px 24px;">Save Settings Configuration</button>
                    </div>
                </form>
            </div>
        `;
        
        // Dynamically populate checklists of sitemap screens
        const modulesListContainer = document.getElementById('customGroupModulesList');
        if (modulesListContainer && typeof sitemap !== 'undefined') {
            let listHtml = '';
            sitemap.forEach((item) => {
                listHtml += `
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.82rem; color:var(--text-body); margin: 2px 0;">
                        <input type="checkbox" class="custom-group-module-checkbox" value="${item.name}" style="width:14px; height:14px; cursor:pointer;">
                        <span>${item.name} <small style="color:var(--text-muted); font-size:0.7rem;">(${item.group})</small></span>
                    </label>
                `;
            });
            modulesListContainer.innerHTML = listHtml;
        }

        // Dynamically populate active groups list
        if (typeof window.renderConfiguredSidebarGroupsList === 'function') {
            setTimeout(() => window.renderConfiguredSidebarGroupsList(), 50);
        }
        return;
    }
    
    // DEFAULT REPORT / FORM RENDERER (Fallback)
    if (item.type === 'report') {
        block.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:16px;">
                <div style="display:flex; gap:12px; align-items:center;">
                    <label style="font-size:0.85rem;">Date range:</label>
                    <input type="date" class="form-control" style="width:160px; padding:6px 12px;" value="2026-06-01">
                    <span style="font-size:0.85rem;">to</span>
                    <input type="date" class="form-control" style="width:160px; padding:6px 12px;" value="2026-06-07">
                </div>
                <div style="display:flex; gap:12px;">
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="showToast('Excel Export', 'Spreadsheet generated.', 'success')"><i class="fa-solid fa-file-excel mr-2"></i> Export Excel</button>
                    <button class="btn-primary" style="width:auto; padding:8px 16px; background-color:var(--secondary);" onclick="window.print()"><i class="fa-solid fa-print mr-2"></i> Print Report</button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="app-table">
                    <thead>
                        <tr>
                            <th>S.N.</th>
                            <th>Reference Number</th>
                            <th>Description Detail</th>
                            <th style="text-align: right;">Amount Dues ($)</th>
                            <th>Status Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>REF-2026-981</td>
                            <td>Compliance ledger entries for ${item.name}</td>
                            <td style="text-align: right; color: var(--color-success)">$182,500.00</td>
                            <td><span class="badge success">Audited</span></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>REF-2026-982</td>
                            <td>General allocations and operational costs</td>
                            <td style="text-align: right; color: var(--color-success)">$45,000.00</td>
                            <td><span class="badge success">Audited</span></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>REF-2026-983</td>
                            <td>Discrepancies adjustments and returns</td>
                            <td style="text-align: right; color: var(--color-danger)">$12,000.00</td>
                            <td><span class="badge danger">Flagged</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    } else {
        block.innerHTML = `
            <form id="dynamicForm" onsubmit="event.preventDefault(); showToast('Form Saved', '${item.name} registry locked.', 'success'); switchView('dashboard');">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                    <div class="form-group">
                        <label>Transaction Reference ID</label>
                        <input type="text" class="form-control" style="padding-left:16px;" value="TXN-${Date.now().toString().slice(-6)}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Input Category Group</label>
                        <input type="text" class="form-control" style="padding-left:16px;" value="${item.group}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Item Name/Master</label>
                        <input type="text" class="form-control" style="padding-left:16px;" placeholder="Input description..." required>
                    </div>
                    <div class="form-group">
                        <label>Amount ($)</label>
                        <input type="number" class="form-control" style="padding-left:16px;" placeholder="0.00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Internal Audit Narration Notes</label>
                    <textarea class="form-control" style="padding-left:16px; height:80px; resize:none;" placeholder="Notes..."></textarea>
                </div>
                <div class="action-row" style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn-primary" style="width:auto; padding:12px 24px;">Post ${item.name} Record</button>
                </div>
            </form>
        `;
    }
}

// 6. Workflow Engine Logic

// Configurator Builder: Add Step Box DOM Node
function addConfigStepBox() {
    const container = document.getElementById('configStepsContainer');
    const stepIdx = state.configSteps.length;
    
    // Add empty array representing the step's screens
    state.configSteps.push([]);
    
    const stepBox = document.createElement('div');
    stepBox.className = 'config-step-box';
    stepBox.id = `config-step-${stepIdx}`;
    
    stepBox.innerHTML = `
        <div class="step-num-badge">${stepIdx + 1}</div>
        <div style="padding-left: 15px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">Step ${stepIdx + 1} Core Screens</label>
            <div id="stepChips-${stepIdx}" style="margin-top:8px; display:flex; flex-wrap:wrap;"></div>
            
            <!-- Selector search -->
            <div style="position:relative; margin-top:8px; width:300px;">
                <input type="text" class="form-control" style="padding: 6px 12px; font-size:0.8rem;" placeholder="Search & add screen..." oninput="filterStepSearch(${stepIdx}, this)" onfocus="showStepSearch(${stepIdx})" onblur="hideStepSearch(${stepIdx})">
                <div id="stepSearchResults-${stepIdx}" class="search-results-panel" style="top:34px; max-height:180px;"></div>
            </div>
        </div>
    `;
    
    container.appendChild(stepBox);
}

// Step Search selectors
function showStepSearch(idx) {
    const panel = document.getElementById(`stepSearchResults-${idx}`);
    panel.classList.add('open');
    filterStepSearch(idx, { value: '' }); // Initial list populate
}

function hideStepSearch(idx) {
    setTimeout(() => {
        document.getElementById(`stepSearchResults-${idx}`).classList.remove('open');
    }, 200);
}

function filterStepSearch(idx, input) {
    const query = input.value.toLowerCase();
    const panel = document.getElementById(`stepSearchResults-${idx}`);
    panel.innerHTML = '';
    
    // Get list of matching screens from sitemap + handcrafted views
    const options = [
        { name: 'Dashboard' },
        { name: 'Sales Invoice' },
        { name: 'Day Book' },
        { name: 'Ledger Master' },
        ...sitemap
    ];
    
    let html = '';
    options.forEach(opt => {
        if (opt.name.toLowerCase().includes(query)) {
            html += `
                <div class="result-item" onmousedown="selectScreenForStep(${idx}, '${opt.name}')" style="padding:6px 12px; font-size:0.8rem;">
                    <span>${opt.name}</span>
                </div>
            `;
        }
    });
    
    panel.innerHTML = html;
}

function selectScreenForStep(stepIdx, screenName) {
    // Check duplicate
    if (state.configSteps[stepIdx].includes(screenName)) return;
    
    state.configSteps[stepIdx].push(screenName);
    updateStepChips(stepIdx);
}

function removeScreenFromStep(stepIdx, screenName) {
    state.configSteps[stepIdx] = state.configSteps[stepIdx].filter(s => s !== screenName);
    updateStepChips(stepIdx);
}

function updateStepChips(stepIdx) {
    const container = document.getElementById(`stepChips-${stepIdx}`);
    container.innerHTML = '';
    
    state.configSteps[stepIdx].forEach(screenName => {
        const chip = document.createElement('span');
        chip.className = 'screen-badge-chip';
        chip.innerHTML = `${screenName} <i class="fa-solid fa-times" onclick="removeScreenFromStep(${stepIdx}, '${screenName}')"></i>`;
        container.appendChild(chip);
    });
}

// Save Workflow Config Form
function saveWorkflow(event) {
    event.preventDefault();
    const name = document.getElementById('workflowName').value.trim();
    const role = document.getElementById('workflowRole').value || '';
    
    // Filter out steps with no screens
    const steps = state.configSteps.filter(s => s.length > 0);
    
    if (steps.length === 0) {
        showToast('Config Error', 'You must add at least one screen to one step.', 'error');
        return;
    }
    
    state.workflows.push({ name, role, steps });
    showToast('Workflow Configured', 'Added workflow pipeline: ' + name, 'success');
    
    // Reset configurator
    document.getElementById('workflowConfigForm').reset();
    document.getElementById('configStepsContainer').innerHTML = '';
    state.configSteps = [];
    addConfigStepBox(); // Re-initialize first step box
    
    if (typeof renderCreatedWorkflowsTable === 'function') renderCreatedWorkflowsTable();
    renderWorkflowsList();
    switchView('workflows-list');
}

// Render available Workflows Launch grid
function renderWorkflowsList() {
    const grid = document.getElementById('workflowsLaunchGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Filter workflows by current session user role
    const activeRole = state.currentUserRole;
    
    state.workflows.forEach((wf, idx) => {
        // Show if assigned to "All Roles" (no role) OR if it matches active session role
        if (!wf.role || wf.role === activeRole) {
            const card = document.createElement('div');
            card.className = 'launch-card';
            card.onclick = () => startWorkflow(idx);
            
            const roleBadge = wf.role ? `<span class="badge warning" style="margin-top:6px; display:inline-block; font-size:0.7rem; padding:2px 6px;">${wf.role}</span>` : '';
            
            card.innerHTML = `
                <div class="launch-icon"><i class="fa-solid fa-route"></i></div>
                <div class="launch-details">
                    <h4>${wf.name}</h4>
                    <p>Steps: ${wf.steps.length} | Items: ${wf.steps.flat().length}</p>
                    ${roleBadge}
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

// 7. Workflow Execution Runner (Wizard HUD Router)
function startWorkflow(idx) {
    const wf = state.workflows[idx];
    
    state.activeWorkflow = {
        name: wf.name,
        steps: wf.steps,
        currentStepIdx: 0,
        running: true
    };
    
    // Activate workflow HUD layout
    document.getElementById('workflowHUD').classList.add('active');
    document.getElementById('hudWorkflowName').textContent = wf.name;
    
    showToast('Workflow Started', 'Active pipeline wizard locked.', 'success');
    
    // Route to the first screen of Step 1 automatically
    const firstScreen = wf.steps[0][0];
    routeToWorkflowScreen(firstScreen);
    updateHUD();
}

function updateHUD() {
    const active = state.activeWorkflow;
    document.getElementById('hudStepLabel').textContent = `Step ${active.currentStepIdx + 1} of ${active.steps.length}`;
    
    // Toggle Back button display
    const backBtn = document.getElementById('hudBackButton');
    if (backBtn) {
        backBtn.style.display = active.currentStepIdx > 0 ? 'inline-block' : 'none';
    }
    
    // Toggle Next button label
    const nextBtn = document.getElementById('hudNextButton');
    if (nextBtn) {
        nextBtn.textContent = (active.currentStepIdx === active.steps.length - 1) ? 'Complete Workflow' : 'Complete Step & Next';
    }
    
    const container = document.getElementById('hudActionsContainer');
    container.innerHTML = '';
    
    // Add clickable options for all items selected in the current step index
    const screens = active.steps[active.currentStepIdx];
    screens.forEach(screen => {
        const btn = document.createElement('button');
        btn.className = 'hud-step-button';
        btn.textContent = screen;
        
        // Normalize for active matching
        const normalizedView = screen.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
        const normalizedCurrent = state.currentView.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
        
        // Highlight if we are currently viewing this screen
        if (normalizedCurrent === normalizedView) {
            btn.classList.add('active');
        }
        
        btn.onclick = () => routeToWorkflowScreen(screen);
        container.appendChild(btn);
    });

    // Dynamic HUD Auto-Mapping (Augment suggestions based on role behavior)
    if (state.autoMapSuggestions) {
        const role = state.currentUserRole;
        const roleData = state.roleNavigationData[role] || {};
        const suggested = Object.entries(roleData)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0])
            .filter(screen => !screens.includes(screen))
            .slice(0, 2);

        if (suggested.length > 0) {
            const separator = document.createElement('span');
            separator.style.cssText = 'color: var(--text-muted); font-size: 0.8rem; margin: 0 8px; font-weight:700; display:flex; align-items:center;';
            separator.textContent = '| Suggested:';
            container.appendChild(separator);

            suggested.forEach(screen => {
                const btn = document.createElement('button');
                btn.className = 'hud-step-button';
                btn.style.cssText = 'border-color: var(--primary); color: var(--primary); display:flex; align-items:center; gap:4px;';
                btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles" style="font-size:0.75rem;"></i>${screen}`;

                const normalizedView = screen.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
                const normalizedCurrent = state.currentView.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
                if (normalizedCurrent === normalizedView) {
                    btn.classList.add('active');
                }
                btn.onclick = () => routeToWorkflowScreen(screen);
                container.appendChild(btn);
            });
        }
    }
}

function routeToWorkflowScreen(name) {
    const staticViews = ['dashboard', 'sales-invoice', 'daybook', 'ledger-master'];
    const formatted = name.toLowerCase().replace(/\s+/g, '-').replace('day-book', 'daybook');
    
    if (staticViews.includes(formatted)) {
        switchView(formatted);
    } else {
        // Find sitemap item and render dynamic template
        let item = sitemap.find(s => s.name.toLowerCase() === name.toLowerCase() || s.name.toLowerCase().replace(/\s+/g, '-') === formatted || s.name.toLowerCase().replace(/\s+/g, '') === formatted.replace(/-/g, ''));
        if (!item) {
            // Robust fallback if name is not explicitly indexed in the static sitemap array
            const isReport = name.toLowerCase().includes('report') || name.toLowerCase().includes('summary') || name.toLowerCase().includes('book') || name.toLowerCase().includes('register') || name.toLowerCase().includes('ageing') || name.toLowerCase().includes('balance') || name.toLowerCase().includes('analysis');
            item = {
                name: name,
                type: isReport ? 'report' : 'form',
                group: 'Dynamic Module',
                description: 'Operational enterprise management interface.'
            };
        }
        renderDynamicView(item.name, item.type);
    }
    
    updateHUD();
}

function goToPreviousStep() {
    const active = state.activeWorkflow;
    if (active.currentStepIdx > 0) {
        active.currentStepIdx--;
        showToast('Back to Previous Step', 'Viewing Step ' + (active.currentStepIdx + 1), 'success');
        
        // Auto-navigate to first screen of previous step
        const firstScreen = active.steps[active.currentStepIdx][0];
        routeToWorkflowScreen(firstScreen);
        updateHUD();
    }
}

function finalizeCurrentStep() {
    const active = state.activeWorkflow;
    const nextIdx = active.currentStepIdx + 1;
    
    if (nextIdx < active.steps.length) {
        active.currentStepIdx = nextIdx;
        showToast('Step Finalized', 'Proceeding to Step ' + (nextIdx + 1), 'success');
        
        // Auto-navigate to first screen of next step
        const firstScreen = active.steps[nextIdx][0];
        routeToWorkflowScreen(firstScreen);
        updateHUD();
    } else {
        showToast('Workflow Complete', 'All steps of ' + active.name + ' finished.', 'success');
        exitWorkflowHUD();
        switchView('dashboard');
    }
}

function exitWorkflowHUD() {
    state.activeWorkflow = { name: null, steps: [], currentStepIdx: 0, running: false };
    document.getElementById('workflowHUD').classList.remove('active');
}

// 8. Grid Invoice Auto Math
function updateRowCalculations(element) {
    const row = element.closest('tr');
    const selectProduct = row.querySelector('select');
    const qtyInput = row.querySelector('input[type="number"]:nth-of-type(1)');
    const rateInput = row.querySelector('input[type="number"]:nth-of-type(2)');
    const discInput = row.querySelector('input[type="number"]:nth-of-type(3)');
    const totalInput = row.querySelector('.row-total');
    
    if (element.tagName === 'SELECT') {
        const rate = selectProduct.options[selectProduct.selectedIndex].getAttribute('data-rate');
        rateInput.value = rate;
    }
    
    const qty = parseFloat(qtyInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const disc = parseFloat(discInput.value) || 0;
    
    let total = qty * rate * (1 - (disc / 100));
    totalInput.value = Math.max(0, Math.round(total * 100) / 100);
    
    recalculateInvoiceTotals();
}

function addInvoiceRow() {
    const tableBody = document.getElementById('invoiceItemRows');
    const rowCount = tableBody.rows.length + 1;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="text-align: center;">${rowCount}</td>
        <td>
            <select class="grid-input" onchange="updateRowCalculations(this)">
                <option value="250" data-rate="250" selected>Premium Item Alpha (Pack of 10)</option>
                <option value="120" data-rate="120">Standard Item Beta (Pack of 5)</option>
            </select>
        </td>
        <td><input type="number" class="grid-input" value="1" min="1" oninput="updateRowCalculations(this)"></td>
        <td><input type="number" class="grid-input" value="250" oninput="updateRowCalculations(this)"></td>
        <td><input type="number" class="grid-input" value="0" min="0" max="100" oninput="updateRowCalculations(this)"></td>
        <td><input type="number" class="grid-input row-total" value="250" readonly></td>
        <td><button class="btn-icon" onclick="deleteInvoiceRow(this)"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tableBody.appendChild(row);
    recalculateInvoiceTotals();
    showToast('Invoice Updated', 'Added row item ' + rowCount, 'success');
}

function deleteInvoiceRow(button) {
    const row = button.closest('tr');
    row.remove();
    recalculateInvoiceTotals();
    
    const rows = document.querySelectorAll('#invoiceItemRows tr');
    rows.forEach((r, idx) => {
        r.cells[0].textContent = idx + 1;
    });
    showToast('Invoice Updated', 'Row item deleted.', 'success');
}

function recalculateInvoiceTotals() {
    const totals = document.querySelectorAll('.row-total');
    let subtotal = 0;
    
    totals.forEach(tot => {
        subtotal += parseFloat(tot.value) || 0;
    });
    
    const tax = subtotal * 0.13;
    const grand = subtotal + tax;
    
    document.getElementById('invoiceSubtotal').textContent = '$' + subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('invoiceTax').textContent = '$' + tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('invoiceGrandTotal').textContent = '$' + grand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function submitInvoice() {
    showToast('Invoice Posted', 'Sales Invoice printed & transactions locked.', 'success');
    setTimeout(() => {
        switchView('dashboard');
    }, 1000);
}

// 9. Ledger Master Submit
function handleLedgerSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('ledgerName').value;
    showToast('Ledger Master Created', 'Ledger "' + name + '" registered successfully.', 'success');
    document.getElementById('ledgerForm').reset();
    setTimeout(() => {
        switchView('dashboard');
    }, 1000);
}

// 10. Custom Toast Notifications
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastTitle = document.getElementById('notificationTitle');
    const toastMsg = document.getElementById('notificationMsg');
    const toastIcon = document.getElementById('notificationIcon');
    
    toastTitle.textContent = title;
    toastMsg.textContent = message;
    
    toast.style.borderLeftColor = 'var(--color-brand)';
    toastIcon.className = 'fa-solid fa-info-circle text-info';
    
    if (type === 'success') {
        toast.style.borderLeftColor = 'var(--color-success)';
        toastIcon.className = 'fa-solid fa-circle-check text-success';
    } else if (type === 'error') {
        toast.style.borderLeftColor = 'var(--color-danger)';
        toastIcon.className = 'fa-solid fa-triangle-exclamation text-danger';
    }
    
    toast.style.display = 'flex';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// 11. Dynamic Voucher Grid Calculation Helpers
window.addVoucherRow = function() {
    const tableBody = document.getElementById('voucherItemRows');
    if (!tableBody) return;
    const rowCount = tableBody.rows.length + 1;
    const row = document.createElement('tr');
    row.innerHTML = `
        <td style="text-align: center;">${rowCount}</td>
        <td>
            <select class="grid-input">
                <option value="primary_bank">Primary Operating Bank Account</option>
                <option value="cash">Cash In Hand Office</option>
                <option value="sales">Sales Account Revenue</option>
                <option value="purchases">Purchase Raw Materials</option>
                <option value="receivables">Accounts Receivable - Bhatbhateni</option>
            </select>
        </td>
        <td>
            <select class="grid-input" onchange="window.toggleVoucherDrCr(this)">
                <option value="dr">Dr</option>
                <option value="cr">Cr</option>
            </select>
        </td>
        <td><input type="number" class="grid-input voucher-amount" value="0" min="0" oninput="window.recalculateVoucherTotals()"></td>
        <td><input type="text" class="grid-input" placeholder="Line remarks..."></td>
        <td><button class="btn-icon" onclick="this.closest('tr').remove(); window.recalculateVoucherTotals();"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tableBody.appendChild(row);
    window.recalculateVoucherTotals();
};

window.toggleVoucherDrCr = function(select) {
    window.recalculateVoucherTotals();
};

window.recalculateVoucherTotals = function() {
    const rows = document.querySelectorAll('#voucherItemRows tr');
    let totalDr = 0;
    let totalCr = 0;
    
    rows.forEach((r, idx) => {
        // Recalculate Row Numbers
        r.cells[0].textContent = idx + 1;
        
        const type = r.querySelector('select:nth-of-type(2)').value;
        const amount = parseFloat(r.querySelector('.voucher-amount').value) || 0;
        if (type === 'dr') {
            totalDr += amount;
        } else {
            totalCr += amount;
        }
    });
    
    const drSpan = document.getElementById('voucherTotalDr');
    const crSpan = document.getElementById('voucherTotalCr');
    const statusDiv = document.getElementById('voucherBalanceStatus');
    const submitBtn = document.getElementById('voucherSubmitBtn');
    
    if (drSpan) drSpan.textContent = '$' + totalDr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (crSpan) crSpan.textContent = '$' + totalCr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (statusDiv) {
        if (totalDr === 0 && totalCr === 0) {
            statusDiv.innerHTML = '<span class="badge warning">Enter rows</span>';
            if (submitBtn) submitBtn.disabled = true;
        } else if (totalDr === totalCr) {
            statusDiv.innerHTML = '<span class="badge success"><i class="fa-solid fa-check mr-1"></i> Balanced</span>';
            if (submitBtn) submitBtn.disabled = false;
        } else {
            const diff = Math.abs(totalDr - totalCr);
            statusDiv.innerHTML = `<span class="badge danger"><i class="fa-solid fa-circle-exclamation mr-1"></i> Unbalanced Diff: $${diff.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            if (submitBtn) submitBtn.disabled = true;
        }
    }
};

// 12. UI Color Palette Configurator
const colorPalettes = {
    default: {
        primary: '#8b5cf6',
        primaryGlow: 'rgba(139, 92, 246, 0.15)',
        secondary: '#06b6d4',
        secondaryGlow: 'rgba(6, 182, 212, 0.15)',
        brand: '#068abf',
        brandLight: 'rgba(6, 138, 191, 0.12)',
        bgBase: '#060913',
        bgCard: '#0f1424',
        bgSidebar: '#0f1424',
        bgSidebarHover: '#171e35',
        textPrimary: '#ffffff',
        textBody: '#94a3b8',
        textMuted: '#4f5e7b'
    },
    sapphire: {
        primary: '#0066cc',
        primaryGlow: 'rgba(0, 102, 204, 0.15)',
        secondary: '#00b3b3',
        secondaryGlow: 'rgba(0, 179, 179, 0.15)',
        brand: '#0052a3',
        brandLight: 'rgba(0, 82, 163, 0.12)',
        bgBase: '#0a1128',
        bgCard: '#101f42',
        bgSidebar: '#09122c',
        bgSidebarHover: '#142554',
        textPrimary: '#ffffff',
        textBody: '#93c5fd',
        textMuted: '#475569'
    },
    emerald: {
        primary: '#10b981',
        primaryGlow: 'rgba(16, 185, 129, 0.15)',
        secondary: '#059669',
        secondaryGlow: 'rgba(5, 150, 105, 0.15)',
        brand: '#047857',
        brandLight: 'rgba(4, 120, 87, 0.12)',
        bgBase: '#051612',
        bgCard: '#0b2520',
        bgSidebar: '#03110e',
        bgSidebarHover: '#0e352e',
        textPrimary: '#ffffff',
        textBody: '#a7f3d0',
        textMuted: '#4b5563'
    },
    industrial: {
        primary: '#f59e0b',
        primaryGlow: 'rgba(245, 158, 11, 0.15)',
        secondary: '#d97706',
        secondaryGlow: 'rgba(217, 119, 6, 0.15)',
        brand: '#b45309',
        brandLight: 'rgba(180, 83, 9, 0.12)',
        bgBase: '#0f0f10',
        bgCard: '#18181b',
        bgSidebar: '#111112',
        bgSidebarHover: '#222225',
        textPrimary: '#ffffff',
        textBody: '#fde68a',
        textMuted: '#52525b'
    },
    charcoal: {
        primary: '#64748b',
        primaryGlow: 'rgba(100, 116, 139, 0.15)',
        secondary: '#475569',
        secondaryGlow: 'rgba(71, 85, 105, 0.15)',
        brand: '#334155',
        brandLight: 'rgba(51, 65, 85, 0.12)',
        bgBase: '#0f172a',
        bgCard: '#1e293b',
        bgSidebar: '#0f172a',
        bgSidebarHover: '#1e293b',
        textPrimary: '#ffffff',
        textBody: '#e2e8f0',
        textMuted: '#64748b'
    }
};

window.showConfigTab = function(tabName) {
    document.querySelectorAll('.config-tab-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.querySelectorAll('.config-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetPanel = document.getElementById('config-panel-' + tabName);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
};

window.applyColorPalette = function(paletteKey) {
    const pal = colorPalettes[paletteKey];
    if (!pal) return;
    
    document.documentElement.style.setProperty('--primary', pal.primary);
    document.documentElement.style.setProperty('--primary-glow', pal.primaryGlow);
    document.documentElement.style.setProperty('--secondary', pal.secondary);
    document.documentElement.style.setProperty('--secondary-glow', pal.secondaryGlow);
    document.documentElement.style.setProperty('--color-brand', pal.brand);
    document.documentElement.style.setProperty('--color-brand-light', pal.brandLight);
    
    if (pal.bgBase) document.documentElement.style.setProperty('--bg-base', pal.bgBase);
    if (pal.bgCard) document.documentElement.style.setProperty('--bg-card', pal.bgCard);
    if (pal.bgSidebar) document.documentElement.style.setProperty('--bg-sidebar', pal.bgSidebar);
    if (pal.bgSidebarHover) document.documentElement.style.setProperty('--bg-sidebar-hover', pal.bgSidebarHover);
    
    if (pal.textPrimary) document.documentElement.style.setProperty('--text-primary', pal.textPrimary);
    if (pal.textBody) document.documentElement.style.setProperty('--text-body', pal.textBody);
    if (pal.textMuted) document.documentElement.style.setProperty('--text-muted', pal.textMuted);
    
    // Save in session state
    state.activePalette = paletteKey;
    showToast('Theme Updated', 'Applied ' + paletteKey + ' color configuration.', 'success');
};

window.applyFontFamily = function(fontName) {
    document.documentElement.style.setProperty('--font-sans', `'${fontName}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`);
    showToast('Font Applied', 'Face updated to ' + fontName, 'success');
};

// 13. Custom Theme Creator Actions
window.saveCustomTheme = function() {
    const primary = document.getElementById('custPrimary').value;
    const secondary = document.getElementById('custSecondary').value;
    const brand = document.getElementById('custBrand').value;
    const bgBase = document.getElementById('custBgBase').value;
    const bgCard = document.getElementById('custBgCard').value;
    const bgSidebarHover = document.getElementById('custBgSidebarHover').value;
    
    // Default high-contrast text configurations
    const textPrimary = '#ffffff';
    const textBody = '#cbd5e1';
    const textMuted = '#64748b';
    
    // Auto generate opacity glow shades for variables
    const primaryGlow = hexToRgba(primary, 0.15);
    const secondaryGlow = hexToRgba(secondary, 0.15);
    const brandLight = hexToRgba(brand, 0.12);
    
    const paletteKey = 'custom_' + Date.now();
    colorPalettes[paletteKey] = {
        primary,
        primaryGlow,
        secondary,
        secondaryGlow,
        brand,
        brandLight,
        bgBase,
        bgCard,
        bgSidebar: bgCard,
        bgSidebarHover,
        textPrimary,
        textBody,
        textMuted
    };
    
    // Append a new selection card to the configurations list dynamically
    addCustomThemeCard(paletteKey, primary, secondary, brand);
    
    // Apply changes instantly
    window.applyColorPalette(paletteKey);
    showToast('Theme Created', 'Custom corporate theme saved and applied.', 'success');
};

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function addCustomThemeCard(key, primary, secondary, brand) {
    // Locate the themes flex grid selector
    const grids = document.querySelectorAll('.config-tab-panel div[style*="grid-template-columns"]');
    if (grids.length === 0) return;
    
    // Target the themes grid specifically
    const themesGrid = grids[0];
    
    const card = document.createElement('div');
    card.className = 'card theme-select-card';
    card.style.cssText = 'cursor:pointer; border:1px solid var(--border-color); padding:16px;';
    card.onclick = () => window.applyColorPalette(key);
    
    card.innerHTML = `
        <h5 style="font-weight:700; color:white; margin-bottom:10px; font-size:0.9rem;">Custom User Palette</h5>
        <div style="display:flex; gap:8px;">
            <span style="background-color:${primary}; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Primary Accent"></span>
            <span style="background-color:${secondary}; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Secondary Accent"></span>
            <span style="background-color:${brand}; width:22px; height:22px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.1);" title="Brand Corporate"></span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">Custom created layout</p>
    `;
    themesGrid.appendChild(card);
}

// Explicitly bind core functions to window to ensure double_sidebar_app.js can intercept them
window.switchView = switchView;
window.renderDynamicView = renderDynamicView;
window.triggerNavAction = triggerNavAction;
window.executeSearchResult = executeSearchResult;
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.toggleSupportPanel = toggleSupportPanel;
window.toggleMegaMenu = toggleMegaMenu;
window.clearSystemCache = clearSystemCache;
window.goToPreviousStep = goToPreviousStep;
window.finalizeCurrentStep = finalizeCurrentStep;
window.exitWorkflowHUD = exitWorkflowHUD;
window.handleLogin = handleLogin;
window.handleCommandSearch = handleCommandSearch;
window.showResults = showResults;
window.hideResults = hideResults;
window.changeBranch = typeof changeBranch !== 'undefined' ? changeBranch : undefined;




// --- Intelligent Role Behavior Tracking Helper Functions ---
function trackScreenVisit(screenName) {
    if (!state.roleTrackingEnabled || !screenName) return;
    const role = state.currentUserRole;
    if (!state.roleNavigationData[role]) {
        state.roleNavigationData[role] = {};
    }
    state.roleNavigationData[role][screenName] = (state.roleNavigationData[role][screenName] || 0) + 1;
    updateConfigRoleLog();
}

function updateConfigRoleLog() {
    const tableBody = document.getElementById('roleBehaviorLogBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    const role = state.currentUserRole;
    const data = state.roleNavigationData[role] || {};
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-muted" style="text-align:center;">No activity recorded yet for this role.</td></tr>`;
        return;
    }
    
    sorted.forEach(([screen, count]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${screen}</td>
            <td style="text-align:right; font-weight:700; color:var(--primary)">${count} visits</td>
        `;
        tableBody.appendChild(row);
    });
}

function syncRoleMappingUI() {
    const trackingBox = document.getElementById('trackingToggle');
    const suggestionsBox = document.getElementById('suggestionsToggle');
    const roleSelect = document.getElementById('userRoleSelector');
    
    if (trackingBox) trackingBox.checked = state.roleTrackingEnabled;
    if (suggestionsBox) suggestionsBox.checked = state.autoMapSuggestions;
    if (roleSelect) roleSelect.value = state.currentUserRole;
    
    updateConfigRoleLog();
}

function toggleRoleTracking(checked) {
    state.roleTrackingEnabled = checked;
    showToast('Tracking Updated', 'Role behavior recording is now ' + (checked ? 'enabled' : 'disabled'), 'success');
}

function toggleAutoMapSuggestions(checked) {
    state.autoMapSuggestions = checked;
    showToast('HUD Suggestions Updated', 'HUD auto-mapping is now ' + (checked ? 'enabled' : 'disabled'), 'success');
    if (state.activeWorkflow && state.activeWorkflow.running) {
        updateHUD();
    }
}

function changeUserRole(role) {
    state.currentUserRole = role;
    showToast('Role Swapped', 'Switched active session to ' + role, 'success');
    updateConfigRoleLog();
    renderWorkflowsList();
    if (state.activeWorkflow && state.activeWorkflow.running) {
        updateHUD();
    }
}

// Bind to window to allow HTML onclick/onchange handlers to access them
window.trackScreenVisit = trackScreenVisit;
window.updateConfigRoleLog = updateConfigRoleLog;
window.syncRoleMappingUI = syncRoleMappingUI;
window.toggleRoleTracking = toggleRoleTracking;
window.toggleAutoMapSuggestions = toggleAutoMapSuggestions;
window.changeUserRole = changeUserRole;

function showWorkflowConfigTab(tabName) {
    document.querySelectorAll('.wf-tab-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.querySelectorAll('.wf-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetPanel = document.getElementById('wf-panel-' + tabName);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

window.showWorkflowConfigTab = showWorkflowConfigTab;

function renderCreatedWorkflowsTable() {
    const tableBody = document.getElementById('createdWorkflowsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    state.workflows.forEach((wf, idx) => {
        const row = document.createElement('tr');
        const roleLabel = wf.role ? `<span class="badge warning" style="font-size:0.75rem;">${wf.role}</span>` : `<span class="badge success" style="font-size:0.75rem;">All Roles</span>`;
        
        row.innerHTML = `
            <td><strong>${wf.name}</strong></td>
            <td>${roleLabel}</td>
            <td>${wf.steps.length} Steps (${wf.steps.flat().length} items)</td>
            <td style="text-align: right;">
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button class="btn-primary" style="width:auto; padding:6px 12px; font-size:0.8rem; height:32px; display:flex; align-items:center; gap:4px;" onclick="startWorkflow(${idx})"><i class="fa-solid fa-play"></i> Run</button>
                    <button class="btn-icon" style="background-color:var(--color-danger-light); color:var(--color-danger); border:none; height:32px; width:32px;" onclick="window.deleteWorkflow(${idx})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteWorkflow(idx) {
    const name = state.workflows[idx].name;
    state.workflows.splice(idx, 1);
    showToast('Workflow Deleted', 'Removed ' + name, 'success');
    renderCreatedWorkflowsTable();
    renderWorkflowsList();
}

window.renderCreatedWorkflowsTable = renderCreatedWorkflowsTable;
window.deleteWorkflow = deleteWorkflow;
