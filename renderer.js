const { ipcRenderer } = require('electron');

// Current user state
let currentUser = null;
let allUsers = [];
let allTransactions = [];

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
    
    // Refresh section data
    if (sectionId === 'customers') loadCustomers();
    if (sectionId === 'transactions') loadAllTransactions();
    if (sectionId === 'overview') refreshDashboard();
}

// Authentication
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await ipcRenderer.invoke('login', { email, password });
    
    if (result.success) {
        currentUser = result.user;
        if (currentUser.role === 'admin') {
            showPage('adminDashboard');
            initializeAdminDashboard();
        } else {
            alert('Customer dashboard not implemented in desktop version. Use web version.');
        }
    } else {
        alert(result.message || 'Invalid email or password');
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
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
    
    const result = await ipcRenderer.invoke('register', {
        firstName,
        lastName,
        email,
        phone,
        password
    });
    
    if (result.success) {
        alert('Account created successfully! Welcome email sent to ' + email);
        showPage('loginPage');
        document.getElementById('registerForm').reset();
    } else {
        alert(result.message || 'Registration failed');
    }
});

function logout() {
    currentUser = null;
    showPage('loginPage');
}

// Admin Dashboard
function initializeAdminDashboard() {
    refreshDashboard();
    loadCustomers();
    loadAllTransactions();
    initializeSettings();
    
    // Listen for mining updates
    ipcRenderer.on('mining-update', (event, data) => {
        allUsers = data.users;
        refreshDashboard();
    });
}

function refreshDashboard() {
    ipcRenderer.invoke('get-users').then(users => {
        allUsers = users;
        
        const totalBalance = users.reduce((sum, user) => sum + parseFloat(user.balance), 0);
        const totalCrypto = users.reduce((sum, user) => sum + parseFloat(user.cryptoBalance), 0);
        
        document.getElementById('totalCustomers').textContent = users.length;
        document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
        document.getElementById('totalCrypto').textContent = totalCrypto.toFixed(8);
    });
    
    ipcRenderer.invoke('get-transactions').then(transactions => {
        allTransactions = transactions;
        
        const today = new Date().toDateString();
        const transactionsToday = transactions.filter(t => {
            return new Date(t.date).toDateString() === today;
        }).length;
        
        document.getElementById('transactionsToday').textContent = transactionsToday;
        
        loadLiveActivity(transactions);
    });
}

function loadLiveActivity(transactions) {
    const container = document.getElementById('liveActivityFeed');
    const recentTransactions = transactions.slice(0, 10);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(t => {
        const user = allUsers.find(u => u.email === t.userEmail);
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${t.type === 'credit' ? 'arrow-down' : t.type === 'debit' ? 'arrow-up' : 'bitcoin'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${t.description}</h4>
                    <p>${user ? user.firstName : 'Unknown'}</p>
                </div>
                <div class="activity-time">${new Date(t.date).toLocaleString()}</div>
            </div>
        `;
    }).join('');
}

function loadCustomers() {
    ipcRenderer.invoke('get-users').then(users => {
        allUsers = users;
        
        // Update dropdowns
        const creditSelect = document.getElementById('creditCustomer');
        const debitSelect = document.getElementById('debitCustomer');
        
        creditSelect.innerHTML = '<option value="">Select Customer</option>';
        debitSelect.innerHTML = '<option value="">Select Customer</option>';
        
        users.forEach(user => {
            creditSelect.innerHTML += `<option value="${user.email}">${user.firstName} ${user.lastName} - ${user.accountNumber}</option>`;
            debitSelect.innerHTML += `<option value="${user.email}">${user.firstName} ${user.lastName} - ${user.accountNumber}</option>`;
        });
        
        displayCustomers(users);
    });
}

function displayCustomers(users) {
    const container = document.getElementById('customerList');
    
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
                <h4>$${user.balance.toFixed(2)}</h4>
                <p>${user.cryptoBalance.toFixed(8)} BTC</p>
            </div>
            <div class="customer-actions-buttons">
                <button class="btn btn-small btn-primary" onclick="viewCustomerDetails('${user.email}')">View</button>
                <button class="btn btn-small" onclick="viewCustomerTransactions('${user.email}')">History</button>
            </div>
        </div>
    `).join('');
}

function loadAllTransactions() {
    ipcRenderer.invoke('get-transactions').then(transactions => {
        allTransactions = transactions;
        displayTransactions(transactions);
    });
}

function displayTransactions(transactions) {
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
        const user = allUsers.find(u => u.email === t.userEmail);
        return `
            <div class="transaction-row">
                <div>${new Date(t.date).toLocaleString()}</div>
                <div>${user ? user.firstName : 'Unknown'}</div>
                <div class="${t.type}">${t.type.toUpperCase()}</div>
                <div>${t.amount.toFixed(2)} ${t.currency}</div>
                <div>${t.method}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const filteredUsers = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.accountNumber.toLowerCase().includes(searchTerm)
    );
    
    displayCustomers(filteredUsers);
}

function filterTransactions() {
    const filter = document.getElementById('transactionFilter').value;
    const date = document.getElementById('transactionDate').value;
    
    let filteredTransactions = allTransactions;
    
    if (filter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filter);
    }
    
    if (date) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date).toDateString();
            const filterDate = new Date(date).toDateString();
            return transactionDate === filterDate;
        });
    }
    
    displayTransactions(filteredTransactions);
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
    
    ipcRenderer.invoke('credit-account', {
        userEmail: customerEmail,
        amount,
        currency,
        method
    }).then(result => {
        if (result.success) {
            alert(`Successfully credited ${amount.toFixed(2)} ${currency}`);
            refreshDashboard();
            loadCustomers();
            
            // Clear form
            document.getElementById('creditCustomer').value = '';
            document.getElementById('creditAmount').value = '';
        } else {
            alert(result.message || 'Credit failed');
        }
    });
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
    
    ipcRenderer.invoke('debit-account', {
        userEmail: customerEmail,
        amount,
        currency,
        reason
    }).then(result => {
        if (result.success) {
            alert(`Successfully debited ${amount.toFixed(2)} ${currency}`);
            refreshDashboard();
            loadCustomers();
            
            // Clear form
            document.getElementById('debitCustomer').value = '';
            document.getElementById('debitAmount').value = '';
            document.getElementById('debitReason').value = '';
        } else {
            alert(result.message || 'Debit failed');
        }
    });
}

// Create Customer Modal
function showCreateCustomerModal() {
    document.getElementById('createCustomerModal').classList.add('show');
}

// Customer Creation
document.getElementById('createCustomerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('newCustomerFirstName').value;
    const lastName = document.getElementById('newCustomerLastName').value;
    const email = document.getElementById('newCustomerEmail').value;
    const phone = document.getElementById('newCustomerPhone').value;
    const initialBalance = parseFloat(document.getElementById('newCustomerBalance').value) || 0;
    
    const password = Math.random().toString(36).substr(2, 10);
    
    const result = await ipcRenderer.invoke('register', {
        firstName,
        lastName,
        email,
        phone,
        password
    });
    
    if (result.success) {
        // Set initial balance
        if (initialBalance > 0) {
            await ipcRenderer.invoke('credit-account', {
                userEmail: email,
                amount: initialBalance,
                currency: 'USD',
                method: 'Initial Deposit'
            });
        }
        
        alert(`Customer account created successfully!\n\nLogin Email: ${email}\nPassword: ${password}\n\nWelcome email sent to ${email}`);
        closeModal('createCustomerModal');
        loadCustomers();
        refreshDashboard();
        
        // Clear form
        document.getElementById('createCustomerForm').reset();
    } else {
        alert(result.message || 'Failed to create customer');
    }
});

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Settings
function initializeSettings() {
    ipcRenderer.invoke('get-settings').then(settings => {
        document.getElementById('miningToggle').checked = settings.miningEnabled;
        document.getElementById('miningStatus').textContent = `Mining: ${settings.miningEnabled ? 'ON' : 'OFF'}`;
        document.getElementById('dailyCreditAmount').value = settings.dailyCredit;
        document.getElementById('miningReward').value = settings.miningReward;
    });
}

function toggleMining() {
    const enabled = document.getElementById('miningToggle').checked;
    
    ipcRenderer.invoke('toggle-mining', enabled).then(result => {
        if (result.success) {
            document.getElementById('miningStatus').textContent = `Mining: ${enabled ? 'ON' : 'OFF'}`;
        }
    });
}

function updateDailyCredit() {
    const amount = parseFloat(document.getElementById('dailyCreditAmount').value);
    
    ipcRenderer.invoke('update-settings', { dailyCredit: amount }).then(result => {
        if (result.success) {
            alert('Daily credit amount updated successfully');
        }
    });
}

function updateMiningReward() {
    const reward = parseFloat(document.getElementById('miningReward').value);
    
    ipcRenderer.invoke('update-settings', { miningReward: reward }).then(result => {
        if (result.success) {
            alert('Mining reward updated successfully');
        }
    });
}

function updateExchangeRates() {
    alert('Exchange rates updated successfully');
}

// Document viewing
function viewDocument(docType) {
    ipcRenderer.invoke('view-document', docType).then(result => {
        if (result.success) {
            document.getElementById('documentContent').innerHTML = result.content;
            document.getElementById('documentModal').classList.add('show');
        }
    });
}

// Customer view functions
function viewCustomerDetails(email) {
    const user = allUsers.find(u => u.email === email);
    if (!user) return;
    
    alert(`Customer Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAccount: ${user.accountNumber}\nBalance: $${user.balance.toFixed(2)}\nCrypto: ${user.cryptoBalance.toFixed(8)} BTC\nJoined: ${new Date(user.createdAt).toLocaleString()}`);
}

function viewCustomerTransactions(email) {
    const transactions = allTransactions.filter(t => t.userEmail === email);
    const user = allUsers.find(u => u.email === email);
    
    if (transactions.length === 0) {
        alert(`No transactions for ${user.firstName} ${user.lastName}`);
        return;
    }
    
    let transactionList = `Transactions for ${user.firstName} ${user.lastName}:\n\n`;
    transactions.slice(0, 20).forEach(t => {
        transactionList += `${new Date(t.date).toLocaleString()} - ${t.type.toUpperCase()}: ${t.amount.toFixed(2)} ${t.currency} - ${t.method}\n`;
    });
    
    alert(transactionList);
}

// IPC event listeners for menu actions
ipcRenderer.on('show-create-customer', () => {
    showCreateCustomerModal();
});

ipcRenderer.on('toggle-mining', () => {
    const toggle = document.getElementById('miningToggle');
    toggle.checked = !toggle.checked;
    toggleMining();
});

ipcRenderer.on('generate-report', () => {
    alert('Report generation feature coming soon!');
});

ipcRenderer.on('view-documents', () => {
    showSection('documents');
});

ipcRenderer.on('export-transactions', () => {
    alert('Transaction export feature coming soon!');
});

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (persistent login could be added)
    // For now, always show login page
});