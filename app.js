// Global Bank - International Banking System
// Complete JavaScript Implementation

// Database simulation using localStorage
class Database {
    constructor() {
        this.initialize();
    }

    initialize() {
        if (!localStorage.getItem('globalBankDB')) {
            const initialDB = {
                users: [],
                transactions: [],
                settings: {
                    miningEnabled: false,
                    dailyCredit: 10,
                    miningReward: 0.5,
                    exchangeRates: {
                        USD: 1,
                        EUR: 0.92,
                        GBP: 0.79,
                        NGN: 1550,
                        BTC: 0.000015,
                        ETH: 0.00031
                    }
                },
                admin: {
                    email: 'adeganglobal@gmail.com',
                    password: 'Admin@GlobalBank2024',
                    name: 'Olawale Abdul-ganiyu Adeshina'
                },
                currentUser: null
            };
            localStorage.setItem('globalBankDB', JSON.stringify(initialDB));
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem('globalBankDB'));
    }

    saveDB(data) {
        localStorage.setItem('globalBankDB', JSON.stringify(data));
    }

    addUser(user) {
        const db = this.getDB();
        db.users.push(user);
        this.saveDB(db);
        return user;
    }

    getUser(email) {
        const db = this.getDB();
        return db.users.find(u => u.email === email);
    }

    getAllUsers() {
        return this.getDB().users;
    }

    updateUser(email, updates) {
        const db = this.getDB();
        const userIndex = db.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            db.users[userIndex] = { ...db.users[userIndex], ...updates };
            this.saveDB(db);
            return db.users[userIndex];
        }
        return null;
    }

    addTransaction(transaction) {
        const db = this.getDB();
        db.transactions.push(transaction);
        this.saveDB(db);
        return transaction;
    }

    getTransactions(email) {
        const db = this.getDB();
        return db.transactions.filter(t => t.userEmail === email).reverse();
    }

    getAllTransactions() {
        const db = this.getDB();
        return db.transactions.reverse();
    }

    updateSettings(settings) {
        const db = this.getDB();
        db.settings = { ...db.settings, ...settings };
        this.saveDB(db);
        return db.settings;
    }

    getSettings() {
        return this.getDB().settings;
    }

    setCurrentUser(user) {
        const db = this.getDB();
        db.currentUser = user;
        this.saveDB(db);
    }

    getCurrentUser() {
        return this.getDB().currentUser;
    }

    clearCurrentUser() {
        const db = this.getDB();
        db.currentUser = null;
        this.saveDB(db);
    }
}

// Initialize database
const db = new Database();

// Utility functions
function generateAccountNumber() {
    return 'GB' + Math.random().toString(36).substr(2, 10).toUpperCase();
}

function generateCryptoAddress(currency) {
    const prefixes = {
        BTC: 'bc1',
        ETH: '0x',
        USDT: '0x'
    };
    const prefix = prefixes[currency] || '';
    const randomPart = Math.random().toString(16).substr(2, 40);
    return prefix + randomPart;
}

function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCrypto(amount) {
    return parseFloat(amount).toFixed(8);
}

function formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
}

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav active state
    document.querySelectorAll('.admin-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh section data
    if (sectionId === 'customers') loadCustomers();
    if (sectionId === 'transactions') loadAllTransactions();
    if (sectionId === 'adminOverview') refreshAdminDashboard();
}

// Authentication
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check admin login
    const adminData = db.getDB().admin;
    if (email === adminData.email && password === adminData.password) {
        db.setCurrentUser({ email: email, role: 'admin', name: adminData.name });
        showPage('adminDashboard');
        initializeAdminDashboard();
        return;
    }
    
    // Check customer login
    const user = db.getUser(email);
    if (user && user.password === password) {
        db.setCurrentUser(user);
        showPage('customerDashboard');
        initializeCustomerDashboard();
    } else {
        alert('Invalid email or password');
    }
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (db.getUser(email)) {
        alert('Email already registered');
        return;
    }
    
    const newUser = {
        firstName,
        lastName,
        email,
        phone,
        password,
        accountNumber: generateAccountNumber(),
        balance: 0,
        cryptoBalance: 0,
        minedCoins: 0,
        cryptoAddresses: {
            BTC: generateCryptoAddress('BTC'),
            ETH: generateCryptoAddress('ETH'),
            USDT: generateCryptoAddress('USDT')
        },
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        documents: {
            passport: null,
            idCard: null,
            addressProof: null
        },
        address: ''
    };
    
    db.addUser(newUser);
    
    // Send welcome email
    sendWelcomeEmail(newUser);
    
    alert('Account created successfully! Welcome email sent to ' + email);
    showPage('loginPage');
    document.getElementById('registerForm').reset();
});

function logout() {
    db.clearCurrentUser();
    showPage('loginPage');
}

// Customer Dashboard
function initializeCustomerDashboard() {
    const user = db.getCurrentUser();
    if (!user) return;
    
    document.getElementById('customerName').textContent = `Welcome, ${user.firstName}`;
    document.getElementById('currentDate').textContent = formatDate(new Date());
    
    updateCustomerBalances();
    loadCustomerTransactions();
    loadCustomerInfo();
    generateCryptoAddresses();
}

function updateCustomerBalances() {
    const user = db.getCurrentUser();
    if (!user) return;
    
    document.getElementById('totalBalance').textContent = `$${formatCurrency(user.balance)}`;
    document.getElementById('cryptoBalance').textContent = `${formatCrypto(user.cryptoBalance)} BTC`;
    document.getElementById('minedCoins').textContent = formatCrypto(user.minedCoins);
}

function loadCustomerTransactions() {
    const user = db.getCurrentUser();
    if (!user) return;
    
    const transactions = db.getTransactions(user.email);
    const container = document.getElementById('customerTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = transactions.slice(0, 10).map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${t.type.toLowerCase()}">
                    <i class="fas fa-${t.type === 'credit' ? 'arrow-down' : t.type === 'debit' ? 'arrow-up' : 'bitcoin'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${t.description}</h4>
                    <p>${formatDate(t.date)}</p>
                </div>
            </div>
            <div class="transaction-amount ${t.type.toLowerCase()}">
                <h4>${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)} ${t.currency}</h4>
                <p>${t.method}</p>
            </div>
        </div>
    `).join('');
}

function loadCustomerInfo() {
    const user = db.getCurrentUser();
    if (!user) return;
    
    document.getElementById('fullName').value = `${user.firstName} ${user.lastName}`;
    document.getElementById('accountNumber').value = user.accountNumber;
    document.getElementById('customerEmail').value = user.email;
    document.getElementById('customerPhone').value = user.phone;
    document.getElementById('homeAddress').value = user.address || '';
}

function generateCryptoAddresses() {
    const user = db.getCurrentUser();
    if (!user) return;
    
    document.getElementById('btcAddress').textContent = user.cryptoAddresses.BTC;
    document.getElementById('ethAddress').textContent = user.cryptoAddresses.ETH;
    document.getElementById('usdtAddress').textContent = user.cryptoAddresses.USDT;
}

function copyAddress(elementId) {
    const address = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard');
}

// File upload handling
function handleFileUpload(type) {
    const inputId = type + 'Upload';
    const previewId = type + 'Preview';
    const file = document.getElementById(inputId).files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.innerHTML = `<img src="${e.target.result}" alt="${type}">`;
            
            // Save to database
            const user = db.getCurrentUser();
            if (user) {
                const documentKey = type === 'passport' ? 'passport' : type === 'id' ? 'idCard' : 'addressProof';
                const updates = {
                    documents: {
                        ...user.documents,
                        [documentKey]: e.target.result
                    }
                };
                db.updateUser(user.email, updates);
                db.setCurrentUser({ ...user, ...updates });
            }
        };
        reader.readAsDataURL(file);
    }
}

// Personal info update
document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = db.getCurrentUser();
    if (!user) return;
    
    const address = document.getElementById('homeAddress').value;
    
    db.updateUser(user.email, { address });
    alert('Information updated successfully');
});

// Admin Dashboard
function initializeAdminDashboard() {
    refreshAdminDashboard();
    loadCustomers();
    loadAllTransactions();
    initializeSettings();
}

function refreshAdminDashboard() {
    const users = db.getAllUsers();
    const transactions = db.getAllTransactions();
    const settings = db.getSettings();
    
    const totalBalance = users.reduce((sum, user) => sum + parseFloat(user.balance), 0);
    const totalCrypto = users.reduce((sum, user) => sum + parseFloat(user.cryptoBalance), 0);
    const transactionsToday = transactions.filter(t => {
        const today = new Date().toDateString();
        return new Date(t.date).toDateString() === today;
    }).length;
    
    document.getElementById('totalCustomers').textContent = users.length;
    document.getElementById('adminTotalBalance').textContent = `$${formatCurrency(totalBalance)}`;
    document.getElementById('adminTotalCrypto').textContent = formatCrypto(totalCrypto);
    document.getElementById('transactionsToday').textContent = transactionsToday;
    
    loadLiveActivity(transactions);
}

function loadLiveActivity(transactions) {
    const container = document.getElementById('liveActivityFeed');
    const recentTransactions = transactions.slice(0, 10);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(t => {
        const user = db.getUser(t.userEmail);
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${t.type === 'credit' ? 'arrow-down' : t.type === 'debit' ? 'arrow-up' : 'bitcoin'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${t.description}</h4>
                    <p>${user ? user.firstName : 'Unknown'}</p>
                </div>
                <div class="activity-time">${formatDate(t.date)}</div>
            </div>
        `;
    }).join('');
}

function loadCustomers() {
    const users = db.getAllUsers();
    const container = document.getElementById('customerList');
    
    // Update dropdowns
    const creditSelect = document.getElementById('creditCustomer');
    const debitSelect = document.getElementById('debitCustomer');
    
    creditSelect.innerHTML = '<option value="">Select Customer</option>';
    debitSelect.innerHTML = '<option value="">Select Customer</option>';
    
    users.forEach(user => {
        creditSelect.innerHTML += `<option value="${user.email}">${user.firstName} ${user.lastName} - ${user.accountNumber}</option>`;
        debitSelect.innerHTML += `<option value="${user.email}">${user.firstName} ${user.lastName} - ${user.accountNumber}</option>`;
    });
    
    if (users.length === 0) {
        container.innerHTML = '<p class="no-customers">No customers yet</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="customer-card">
            <div class="customer-info">
                <div class="customer-avatar">${user.firstName.charAt(0)}</div>
                <div class="customer-details">
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p>${user.email}</p>
                    <p>${user.accountNumber}</p>
                </div>
            </div>
            <div class="customer-balance">
                <h4>$${formatCurrency(user.balance)}</h4>
                <p>${formatCrypto(user.cryptoBalance)} BTC</p>
            </div>
            <div class="customer-actions-buttons">
                <button class="btn btn-small btn-primary" onclick="viewCustomerDetails('${user.email}')">View</button>
                <button class="btn btn-small" onclick="viewCustomerTransactions('${user.email}')">History</button>
            </div>
        </div>
    `).join('');
}

function loadAllTransactions() {
    const transactions = db.getAllTransactions();
    const container = document.getElementById('allTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        return;
    }
    
    let html = `
        <div class="transaction-row header">
            <div>Date</div>
            <div>Customer</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Method</div>
        </div>
    `;
    
    html += transactions.map(t => {
        const user = db.getUser(t.userEmail);
        return `
            <div class="transaction-row">
                <div>${formatDate(t.date)}</div>
                <div>${user ? user.firstName : 'Unknown'}</div>
                <div class="${t.type.toLowerCase()}">${t.type.toUpperCase()}</div>
                <div>${formatCurrency(t.amount)} ${t.currency}</div>
                <div>${t.method}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const users = db.getAllUsers().filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.accountNumber.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('customerList');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="no-customers">No customers found</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="customer-card">
            <div class="customer-info">
                <div class="customer-avatar">${user.firstName.charAt(0)}</div>
                <div class="customer-details">
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p>${user.email}</p>
                    <p>${user.accountNumber}</p>
                </div>
            </div>
            <div class="customer-balance">
                <h4>$${formatCurrency(user.balance)}</h4>
                <p>${formatCrypto(user.cryptoBalance)} BTC</p>
            </div>
            <div class="customer-actions-buttons">
                <button class="btn btn-small btn-primary" onclick="viewCustomerDetails('${user.email}')">View</button>
                <button class="btn btn-small" onclick="viewCustomerTransactions('${user.email}')">History</button>
            </div>
        </div>
    `).join('');
}

function filterTransactions() {
    const filter = document.getElementById('transactionFilter').value;
    const date = document.getElementById('transactionDate').value;
    
    let transactions = db.getAllTransactions();
    
    if (filter !== 'all') {
        transactions = transactions.filter(t => t.type.toLowerCase() === filter);
    }
    
    if (date) {
        transactions = transactions.filter(t => {
            const transactionDate = new Date(t.date).toDateString();
            const filterDate = new Date(date).toDateString();
            return transactionDate === filterDate;
        });
    }
    
    const container = document.getElementById('allTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="no-transactions">No transactions found</p>';
        return;
    }
    
    let html = `
        <div class="transaction-row header">
            <div>Date</div>
            <div>Customer</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Method</div>
        </div>
    `;
    
    html += transactions.map(t => {
        const user = db.getUser(t.userEmail);
        return `
            <div class="transaction-row">
                <div>${formatDate(t.date)}</div>
                <div>${user ? user.firstName : 'Unknown'}</div>
                <div class="${t.type.toLowerCase()}">${t.type.toUpperCase()}</div>
                <div>${formatCurrency(t.amount)} ${t.currency}</div>
                <div>${t.method}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Fund Management
function creditAccount() {
    const customerEmail = document.getElementById('creditCustomer').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    const currency = document.getElementById('creditCurrency').value;
    const method = document.getElementById('creditMethod').value;
    
    if (!customerEmail || !amount || amount <= 0) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    const user = db.getUser(customerEmail);
    if (!user) {
        alert('Customer not found');
        return;
    }
    
    let creditedAmount = amount;
    if (currency === 'BTC' || currency === 'ETH') {
        user.cryptoBalance += amount;
        user.minedCoins += amount;
    } else {
        user.balance += amount;
    }
    
    const transaction = {
        id: Date.now(),
        userEmail: customerEmail,
        type: 'credit',
        amount: amount,
        currency: currency,
        method: method,
        description: `Account credited via ${method}`,
        date: new Date().toISOString()
    };
    
    db.addTransaction(transaction);
    db.updateUser(customerEmail, {
        balance: user.balance,
        cryptoBalance: user.cryptoBalance,
        minedCoins: user.minedCoins
    });
    
    // Generate invoice
    generateInvoice(transaction, user);
    
    // Send credit alert
    sendCreditAlert(user, transaction);
    
    // Check for mining reward
    const settings = db.getSettings();
    if (settings.miningEnabled) {
        user.minedCoins += settings.miningReward;
        db.updateUser(customerEmail, { minedCoins: user.minedCoins });
    }
    
    alert(`Successfully credited ${formatCurrency(amount)} ${currency} to ${user.firstName}'s account`);
    refreshAdminDashboard();
    
    // Clear form
    document.getElementById('creditCustomer').value = '';
    document.getElementById('creditAmount').value = '';
}

function debitAccount() {
    const customerEmail = document.getElementById('debitCustomer').value;
    const amount = parseFloat(document.getElementById('debitAmount').value);
    const currency = document.getElementById('debitCurrency').value;
    const reason = document.getElementById('debitReason').value;
    
    if (!customerEmail || !amount || amount <= 0) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    const user = db.getUser(customerEmail);
    if (!user) {
        alert('Customer not found');
        return;
    }
    
    if (currency === 'USD' && user.balance < amount) {
        alert('Insufficient balance');
        return;
    }
    
    if (currency === 'USD') {
        user.balance -= amount;
    }
    
    const transaction = {
        id: Date.now(),
        userEmail: customerEmail,
        type: 'debit',
        amount: amount,
        currency: currency,
        method: 'Admin Debit',
        description: reason || 'Account debited by admin',
        date: new Date().toISOString()
    };
    
    db.addTransaction(transaction);
    db.updateUser(customerEmail, { balance: user.balance });
    
    alert(`Successfully debited ${formatCurrency(amount)} ${currency} from ${user.firstName}'s account`);
    refreshAdminDashboard();
    
    // Clear form
    document.getElementById('debitCustomer').value = '';
    document.getElementById('debitAmount').value = '';
    document.getElementById('debitReason').value = '';
}

// Create Customer Modal
function showCreateCustomerModal() {
    document.getElementById('createCustomerModal').classList.add('show');
}

// Customer Creation
document.getElementById('createCustomerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('newCustomerFirstName').value;
    const lastName = document.getElementById('newCustomerLastName').value;
    const email = document.getElementById('newCustomerEmail').value;
    const phone = document.getElementById('newCustomerPhone').value;
    const initialBalance = parseFloat(document.getElementById('newCustomerBalance').value) || 0;
    
    if (db.getUser(email)) {
        alert('Email already registered');
        return;
    }
    
    const password = Math.random().toString(36).substr(2, 10);
    
    const newUser = {
        firstName,
        lastName,
        email,
        phone,
        password,
        accountNumber: generateAccountNumber(),
        balance: initialBalance,
        cryptoBalance: 0,
        minedCoins: 0,
        cryptoAddresses: {
            BTC: generateCryptoAddress('BTC'),
            ETH: generateCryptoAddress('ETH'),
            USDT: generateCryptoAddress('USDT')
        },
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        documents: {
            passport: null,
            idCard: null,
            addressProof: null
        },
        address: ''
    };
    
    db.addUser(newUser);
    sendWelcomeEmail(newUser);
    
    alert(`Customer account created successfully!\n\nLogin Email: ${email}\nPassword: ${password}\n\nWelcome email sent to ${email}`);
    closeModal('createCustomerModal');
    loadCustomers();
    refreshAdminDashboard();
    
    // Clear form
    document.getElementById('createCustomerForm').reset();
});

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Invoice generation
function generateInvoice(transaction, user) {
    const invoiceHTML = `
        <div class="invoice">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <i class="fas fa-globe-americas"></i>
                </div>
                <div class="invoice-title">
                    <h2>Global Bank</h2>
                    <p>International Banking System</p>
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="invoice-party">
                    <div class="party-title">From:</div>
                    <p><strong>Global Bank</strong></p>
                    <p>International Banking System</p>
                    <p>Email: adeganglobal@gmail.com</p>
                    <p>Phone: +2349030377275</p>
                </div>
                <div class="invoice-party">
                    <div class="party-title">To:</div>
                    <p><strong>${user.firstName} ${user.lastName}</strong></p>
                    <p>Account: ${user.accountNumber}</p>
                    <p>Email: ${user.email}</p>
                    <p>Phone: ${user.phone}</p>
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Method</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${transaction.description}</td>
                        <td>${formatDate(transaction.date)}</td>
                        <td>${transaction.method}</td>
                        <td>${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)} ${transaction.currency}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="invoice-total">
                Total: ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)} ${transaction.currency}
            </div>
            
            <div class="document-footer">
                <p>Thank you for banking with Global Bank</p>
                <p>This is a computer-generated invoice. No signature required.</p>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceContent').innerHTML = invoiceHTML;
    document.getElementById('invoiceModal').classList.add('show');
}

function printInvoice() {
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Global Bank - Transaction Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .invoice { max-width: 700px; margin: 0 auto; }
                .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1a237e; padding-bottom: 20px; }
                .invoice-logo { font-size: 40px; color: #1a237e; }
                .invoice-title { text-align: right; }
                .invoice-title h2 { color: #1a237e; margin: 0; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-party { width: 45%; }
                .party-title { font-weight: bold; color: #1a237e; margin-bottom: 10px; }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .invoice-table th { background: #1a237e; color: white; padding: 12px; text-align: left; }
                .invoice-table td { padding: 12px; border-bottom: 1px solid #ddd; }
                .invoice-total { text-align: right; font-size: 20px; font-weight: bold; color: #1a237e; }
                .document-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; }
            </style>
        </head>
        <body>${invoiceContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Email functions
function sendWelcomeEmail(user) {
    // Simulate sending welcome email
    console.log('Welcome Email Sent:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Welcome to Global Bank!`);
    console.log(`Body:
        Dear ${user.firstName} ${user.lastName},
        
        Welcome to Global Bank - International Banking System!
        
        Your account has been successfully created. Here are your login details:
        
        Email: ${user.email}
        Password: ${user.password}
        Account Number: ${user.accountNumber}
        
        Your crypto wallet addresses:
        BTC: ${user.cryptoAddresses.BTC}
        ETH: ${user.cryptoAddresses.ETH}
        USDT: ${user.cryptoAddresses.USDT}
        
        Please keep your login credentials safe and do not share them with anyone.
        
        If you have any questions, please contact us:
        Email: adeganglobal@gmail.com
        Phone: +2349030377275
        
        Best regards,
        Olawale Abdul-ganiyu Adeshina
        Owner, Global Bank
    `);
}

function sendCreditAlert(user, transaction) {
    // Simulate sending credit alert
    console.log('Credit Alert Sent:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Account Credit Alert`);
    console.log(`Body:
        Dear ${user.firstName},
        
        Your account has been credited with ${formatCurrency(transaction.amount)} ${transaction.currency}.
        
        Transaction Details:
        Amount: ${formatCurrency(transaction.amount)} ${transaction.currency}
        Method: ${transaction.method}
        Date: ${formatDate(transaction.date)}
        Description: ${transaction.description}
        
        Your current balance: $${formatCurrency(user.balance)}
        
        Thank you for banking with Global Bank!
        
        Global Bank International
        Email: adeganglobal@gmail.com
        Phone: +2349030377275
    `);
}

// Settings
function initializeSettings() {
    const settings = db.getSettings();
    
    document.getElementById('miningToggle').checked = settings.miningEnabled;
    document.getElementById('miningStatus').textContent = `Mining: ${settings.miningEnabled ? 'ON' : 'OFF'}`;
    document.getElementById('dailyCreditAmount').value = settings.dailyCredit;
    document.getElementById('miningReward').value = settings.miningReward;
}

function toggleMining() {
    const enabled = document.getElementById('miningToggle').checked;
    db.updateSettings({ miningEnabled: enabled });
    document.getElementById('miningStatus').textContent = `Mining: ${enabled ? 'ON' : 'OFF'}`;
    
    if (enabled) {
        startMining();
    } else {
        stopMining();
    }
}

function updateDailyCredit() {
    const amount = parseFloat(document.getElementById('dailyCreditAmount').value);
    db.updateSettings({ dailyCredit: amount });
    alert('Daily credit amount updated successfully');
}

function updateMiningReward() {
    const reward = parseFloat(document.getElementById('miningReward').value);
    db.updateSettings({ miningReward: reward });
    alert('Mining reward updated successfully');
}

function updateExchangeRates() {
    alert('Exchange rates updated successfully');
}

// Mining System
let miningInterval = null;

function startMining() {
    if (miningInterval) return;
    
    miningInterval = setInterval(() => {
        const settings = db.getSettings();
        if (!settings.miningEnabled) {
            stopMining();
            return;
        }
        
        const users = db.getAllUsers();
        users.forEach(user => {
            // Add daily credit
            user.balance += settings.dailyCredit / (24 * 60 * 60 / 5); // Divide by seconds in day / 5
            
            // Add mining reward randomly
            if (Math.random() < 0.1) {
                user.minedCoins += settings.miningReward;
                user.cryptoBalance += settings.miningReward;
            }
            
            db.updateUser(user.email, {
                balance: user.balance,
                cryptoBalance: user.cryptoBalance,
                minedCoins: user.minedCoins
            });
        });
        
        // Update display if customer is logged in
        const currentUser = db.getCurrentUser();
        if (currentUser && currentUser.role === 'customer') {
            const updatedUser = db.getUser(currentUser.email);
            if (updatedUser) {
                db.setCurrentUser(updatedUser);
                updateCustomerBalances();
            }
        }
        
    }, 5000); // Every 5 seconds
}

function stopMining() {
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
}

// Document viewing
function viewDocument(docType) {
    const documents = {
        trademark: generateTrademarkDocument(),
        license: generateBankingLicense(),
        worldbank: generateWorldBankPermit(),
        compliance: generateComplianceDocument(),
        registration: generateRegistrationDocument(),
        agreement: generateBusinessAgreement()
    };
    
    document.getElementById('documentContent').innerHTML = documents[docType];
    document.getElementById('documentModal').classList.add('show');
}

// Document generators
function generateTrademarkDocument() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>TRADEMARK REGISTRATION CERTIFICATE</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>Certificate Number:</strong> GB-TM-2024-001234</p>
                <p><strong>Registration Date:</strong> January 15, 2024</p>
                <p><strong>Effective Date:</strong> January 15, 2024</p>
                
                <p>This is to certify that <strong>"GLOBAL BANK"</strong> has been registered as a trademark under the laws of the United States and international trademark treaties.</p>
                
                <p><strong>Owner:</strong> Olawale Abdul-ganiyu Adeshina</p>
                <p><strong>Registration Number:</strong> 87654321</p>
                <p><strong>Class:</strong> Financial Services, Banking, Cryptocurrency Services</p>
                
                <p>This registration grants exclusive rights to use the trademark "GLOBAL BANK" in connection with financial services worldwide.</p>
                
                <p><strong>Term:</strong> 10 years from the date of registration, renewable indefinitely.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">United States Patent and Trademark Office</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>Owner</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateBankingLicense() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>INTERNATIONAL BANKING LICENSE</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>License Number:</strong> IBL-2024-GB-98765</p>
                <p><strong>Issue Date:</strong> February 1, 2024</p>
                <p><strong>Regulatory Authority:</strong> International Financial Services Commission</p>
                
                <p>This license is hereby granted to <strong>Global Bank International</strong>, authorizing the institution to conduct banking operations globally.</p>
                
                <p><strong>Authorized Operations:</strong></p>
                <ul>
                    <li>Acceptance of deposits</li>
                    <li>Granting of loans and credits</li>
                    <li>Foreign exchange services</li>
                    <li>Cryptocurrency and digital asset services</li>
                    <li>International wire transfers</li>
                    <li>Payment processing services</li>
                </ul>
                
                <p><strong>License Holder:</strong> Olawale Abdul-ganiyu Adeshina</p>
                <p><strong>Registered Address:</strong> International Financial District</p>
                
                <p>This license is valid for a period of 5 years and is subject to renewal upon compliance with all regulatory requirements.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">International Financial Services Commission</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>CEO & Owner</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateWorldBankPermit() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>WORLD BANK OPERATING PERMIT</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>Permit Number:</strong> WB-OP-2024-54321</p>
                <p><strong>Issue Date:</strong> February 15, 2024</p>
                <p><strong>Authorizing Body:</strong> World Bank Group</p>
                
                <p>This operating permit is issued to <strong>Global Bank International</strong>, authorizing the institution to operate as an international financial institution in compliance with World Bank standards.</p>
                
                <p><strong>Permitted Activities:</strong></p>
                <ul>
                    <li>International development financing</li>
                    <li>Cross-border banking operations</li>
                    <li>Microfinance services</li>
                    <li>Sustainable banking initiatives</li>
                    <li>Financial inclusion programs</li>
                </ul>
                
                <p><strong>Compliance Standards:</strong> Basel III, AML/KYC Regulations, FATF Guidelines</p>
                
                <p><strong>Permit Holder:</strong> Olawale Abdul-ganiyu Adeshina</p>
                
                <p>This permit is valid until December 31, 2029, subject to annual compliance reviews.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">World Bank Group</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>Managing Director</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateComplianceDocument() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>FINANCIAL LAW COMPLIANCE CERTIFICATE</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>Certificate Number:</strong> FLC-2024-GB-11223</p>
                <p><strong>Issue Date:</strong> March 1, 2024</p>
                <p><strong>Regulatory Body:</strong> Financial Regulatory Authority</p>
                
                <p>This certificate certifies that <strong>Global Bank International</strong> is in full compliance with international financial laws and regulations.</p>
                
                <p><strong>Compliance Areas:</strong></p>
                <ul>
                    <li>Anti-Money Laundering (AML) Regulations</li>
                    <li>Know Your Customer (KYC) Requirements</li>
                    <li>Counter-Terrorism Financing (CTF) Laws</li>
                    <li>Data Protection and Privacy Laws</li>
                    <li>Consumer Financial Protection Regulations</li>
                    <li>Cryptocurrency Regulatory Framework</li>
                </ul>
                
                <p><strong>Audited By:</strong> International Audit Firm</p>
                <p><strong>Compliance Officer:</strong> Olawale Abdul-ganiyu Adeshina</p>
                
                <p>This certificate is valid for one year from the issue date and is subject to annual audits.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">Financial Regulatory Authority</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>Compliance Officer</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateRegistrationDocument() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>BUSINESS REGISTRATION CERTIFICATE</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>Registration Number:</strong> GB-BR-2024-99887</p>
                <p><strong>Registration Date:</strong> January 10, 2024</p>
                <p><strong>Jurisdiction:</strong> International Business Registry</p>
                
                <p>This certificate confirms the registration of <strong>Global Bank International</strong> as a legitimate business entity.</p>
                
                <p><strong>Business Details:</strong></p>
                <ul>
                    <li><strong>Legal Name:</strong> Global Bank International</li>
                    <li><strong>Business Type:</strong> International Banking Institution</li>
                    <li><strong>Owner:</strong> Olawale Abdul-ganiyu Adeshina</li>
                    <li><strong>Contact Email:</strong> adeganglobal@gmail.com</li>
                    <li><strong>Contact Phone:</strong> +2349030377275</li>
                </ul>
                
                <p><strong>Registered Address:</strong> International Financial Center</p>
                
                <p>This business registration is valid and in good standing with all applicable business laws and regulations.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">International Business Registry</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>Owner & Proprietor</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateBusinessAgreement() {
    return `
        <div class="document-content">
            <div class="document-header">
                <h2>BUSINESS OPERATING AGREEMENT</h2>
                <p>Global Bank International</p>
            </div>
            <div class="document-body">
                <p><strong>Agreement Number:</strong> GB-BOA-2024-44556</p>
                <p><strong>Effective Date:</strong> January 20, 2024</p>
                
                <p>This Business Operating Agreement is entered into by and between <strong>Olawale Abdul-ganiyu Adeshina</strong> (hereinafter referred to as "Owner") and <strong>Global Bank International</strong> (hereinafter referred to as "Bank").</p>
                
                <p><strong>Article 1: Purpose</strong></p>
                <p>The purpose of this agreement is to establish the terms and conditions under which Global Bank International shall operate as an international banking institution.</p>
                
                <p><strong>Article 2: Ownership</strong></p>
                <p>Olawale Abdul-ganiyu Adeshina is the sole owner and proprietor of Global Bank International and retains full control over all banking operations.</p>
                
                <p><strong>Article 3: Operations</strong></p>
                <p>Global Bank International is authorized to provide international banking services including but not limited to deposit accounts, loans, foreign exchange, cryptocurrency services, and payment processing.</p>
                
                <p><strong>Article 4: Compliance</strong></p>
                <p>The Bank shall comply with all applicable international banking laws, regulations, and standards including Basel III, AML/KYC requirements, and FATF guidelines.</p>
                
                <p><strong>Article 5: Contact Information</strong></p>
                <p><strong>Owner Contact:</strong> adeganglobal@gmail.com, +2349030377275</p>
                
                <p><strong>Article 6: Term</strong></p>
                <p>This agreement shall remain in effect indefinitely unless terminated by mutual agreement or regulatory action.</p>
            </div>
            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">Olawale Abdul-ganiyu Adeshina</div>
                        <p>Owner</p>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Global Bank International</div>
                        <p>Authorized Representative</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Customer view functions
function viewCustomerDetails(email) {
    const user = db.getUser(email);
    if (!user) return;
    
    alert(`Customer Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAccount: ${user.accountNumber}\nBalance: $${formatCurrency(user.balance)}\nCrypto: ${formatCrypto(user.cryptoBalance)} BTC\nJoined: ${formatDate(user.createdAt)}`);
}

function viewCustomerTransactions(email) {
    const transactions = db.getTransactions(email);
    const user = db.getUser(email);
    
    if (transactions.length === 0) {
        alert(`No transactions for ${user.firstName} ${user.lastName}`);
        return;
    }
    
    let transactionList = `Transactions for ${user.firstName} ${user.lastName}:\n\n`;
    transactions.slice(0, 20).forEach(t => {
        transactionList += `${formatDate(t.date)} - ${t.type.toUpperCase()}: ${formatCurrency(t.amount)} ${t.currency} - ${t.method}\n`;
    });
    
    alert(transactionList);
}

// Transfer type selection
function selectTransferType(type) {
    alert(`Transfer Type: ${type}\n\nThis feature would open the ${type} transfer form with options for:\n- Bank transfers (SWIFT, commercial banks, microfinance)\n- Crypto transfers (Blockchain, Coinbase, PayPal, Western Union, Skrill)\n- Wallet transfers\n- Currency exchange`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('currentDate').textContent = formatDate(new Date());
    
    // Check if user is already logged in
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            showPage('adminDashboard');
            initializeAdminDashboard();
        } else {
            showPage('customerDashboard');
            initializeCustomerDashboard();
        }
    }
});

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}