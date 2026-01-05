const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Global Bank Configuration
const CONFIG = {
    name: 'Global Bank International',
    version: '2.0.0',
    owner: 'Olawale Abdul-ganiyu Adeshina',
    email: 'adeganglobal@gmail.com',
    phone: '+2349030377275',
    apiUrl: 'https://api.globalbank.international/v3/',
    dailyCredit: 10,
    miningReward: 0.5,
    miningInterval: 5000
};

// Database simulation
let database = {
    users: [],
    transactions: [],
    settings: {
        miningEnabled: false,
        dailyCredit: 10,
        miningReward: 0.5
    },
    admin: {
        email: 'adeganglobal@gmail.com',
        password: 'Admin@GlobalBank2024',
        name: 'Olawale Abdul-ganiyu Adeshina'
    }
};

let mainWindow;
let miningInterval = null;

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        title: CONFIG.name
    });

    mainWindow.loadFile('index.html');

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Customer',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('show-create-customer')
                },
                {
                    label: 'Export Transactions',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow.webContents.send('export-transactions')
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Toggle Mining',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => mainWindow.webContents.send('toggle-mining')
                },
                {
                    label: 'Generate Report',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.webContents.send('generate-report')
                },
                {
                    label: 'View Documents',
                    click: () => mainWindow.webContents.send('view-documents')
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Global Bank',
                            message: CONFIG.name,
                            detail: `Version: ${CONFIG.version}\nOwner: ${CONFIG.owner}\nEmail: ${CONFIG.email}\nPhone: ${CONFIG.phone}\n\nInternational Banking System\n© 2024 Global Bank International`
                        });
                    }
                },
                {
                    label: 'Contact Support',
                    click: () => {
                        shell.openExternal(`mailto:${CONFIG.email}?subject=Global Bank Support`);
                    }
                },
                {
                    label: 'Visit Website',
                    click: () => {
                        shell.openExternal('https://globalbank.international');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    
    // Start mining if enabled
    if (database.settings.miningEnabled) {
        startMining();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('login', async (event, { email, password }) => {
    // Check admin login
    if (email === database.admin.email && password === database.admin.password) {
        return { success: true, user: { ...database.admin, role: 'admin' } };
    }
    
    // Check customer login
    const user = database.users.find(u => u.email === email && u.password === password);
    if (user) {
        user.lastLogin = new Date().toISOString();
        user.isOnline = true;
        return { success: true, user };
    }
    
    return { success: false, message: 'Invalid credentials' };
});

ipcMain.handle('register', async (event, userData) => {
    if (database.users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        ...userData,
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
        lastLogin: null,
        isOnline: false,
        documents: {
            passport: null,
            idCard: null,
            addressProof: null
        },
        address: ''
    };
    
    database.users.push(newUser);
    
    // Send welcome email (simulated)
    console.log('Welcome email sent to:', newUser.email);
    
    return { success: true, user: newUser };
});

ipcMain.handle('get-users', async () => {
    return database.users;
});

ipcMain.handle('get-transactions', async () => {
    return database.transactions.reverse();
});

ipcMain.handle('credit-account', async (event, { userEmail, amount, currency, method }) => {
    const user = database.users.find(u => u.email === userEmail);
    if (!user) return { success: false, message: 'User not found' };
    
    if (currency === 'BTC' || currency === 'ETH') {
        user.cryptoBalance += amount;
        user.minedCoins += amount;
    } else {
        user.balance += amount;
    }
    
    const transaction = {
        id: Date.now().toString(),
        userEmail,
        type: 'credit',
        amount,
        currency,
        method,
        description: `Account credited via ${method}`,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    database.transactions.push(transaction);
    
    // Generate invoice PDF
    generateInvoicePDF(transaction, user);
    
    return { success: true, transaction, updatedBalance: user.balance };
});

ipcMain.handle('debit-account', async (event, { userEmail, amount, currency, reason }) => {
    const user = database.users.find(u => u.email === userEmail);
    if (!user) return { success: false, message: 'User not found' };
    
    if (currency === 'USD' && user.balance < amount) {
        return { success: false, message: 'Insufficient balance' };
    }
    
    if (currency === 'USD') {
        user.balance -= amount;
    }
    
    const transaction = {
        id: Date.now().toString(),
        userEmail,
        type: 'debit',
        amount,
        currency,
        method: 'Admin Debit',
        description: reason || 'Account debited by admin',
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    database.transactions.push(transaction);
    
    return { success: true, transaction, updatedBalance: user.balance };
});

ipcMain.handle('toggle-mining', async (event, enabled) => {
    database.settings.miningEnabled = enabled;
    
    if (enabled) {
        startMining();
    } else {
        stopMining();
    }
    
    return { success: true, miningEnabled: enabled };
});

ipcMain.handle('get-settings', async () => {
    return database.settings;
});

ipcMain.handle('update-settings', async (event, settings) => {
    database.settings = { ...database.settings, ...settings };
    return { success: true, settings: database.settings };
});

ipcMain.handle('generate-invoice', async (event, transactionId) => {
    const transaction = database.transactions.find(t => t.id === transactionId);
    const user = database.users.find(u => u.email === transaction.userEmail);
    
    if (!transaction || !user) {
        return { success: false, message: 'Transaction or user not found' };
    }
    
    generateInvoicePDF(transaction, user);
    return { success: true };
});

ipcMain.handle('view-document', async (event, docType) => {
    const documentContent = generateDocument(docType);
    return { success: true, content: documentContent };
});

ipcMain.handle('save-document', async (event, { userEmail, docType, filePath }) => {
    const user = database.users.find(u => u.email === userEmail);
    if (!user) return { success: false, message: 'User not found' };
    
    try {
        const documentData = fs.readFileSync(filePath);
        const base64Data = documentData.toString('base64');
        
        user.documents[docType] = base64Data;
        
        return { success: true, message: 'Document saved successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to save document' };
    }
});

// Utility functions
function generateAccountNumber() {
    return 'GB' + Math.random().toString(36).substr(2, 10).toUpperCase();
}

function generateCryptoAddress(currency) {
    const prefixes = { BTC: 'bc1', ETH: '0x', USDT: '0x' };
    const prefix = prefixes[currency] || '';
    const randomPart = Math.random().toString(16).substr(2, 40);
    return prefix + randomPart;
}

function generateInvoicePDF(transaction, user) {
    const doc = new PDFDocument();
    const fileName = `invoice_${transaction.id}.pdf`;
    const filePath = path.join(__dirname, 'invoices', fileName);
    
    // Create invoices directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'invoices'))) {
        fs.mkdirSync(path.join(__dirname, 'invoices'));
    }
    
    doc.pipe(fs.createWriteStream(filePath));
    
    // Invoice content
    doc.fontSize(20).text('Global Bank International', { align: 'center' });
    doc.fontSize(12).text('International Banking System', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(16).text('Transaction Invoice', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Invoice ID: ${transaction.id}`);
    doc.text(`Date: ${new Date(transaction.date).toLocaleString()}`);
    doc.moveDown();
    
    doc.text('From:');
    doc.text('Global Bank International');
    doc.text(`Email: ${CONFIG.email}`);
    doc.text(`Phone: ${CONFIG.phone}`);
    doc.moveDown();
    
    doc.text('To:');
    doc.text(`${user.firstName} ${user.lastName}`);
    doc.text(`Account: ${user.accountNumber}`);
    doc.text(`Email: ${user.email}`);
    doc.moveDown();
    
    doc.text('Transaction Details:');
    doc.text(`Type: ${transaction.type.toUpperCase()}`);
    doc.text(`Amount: ${transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)} ${transaction.currency}`);
    doc.text(`Method: ${transaction.method}`);
    doc.text(`Description: ${transaction.description}`);
    doc.moveDown();
    
    doc.text(`Total: ${transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)} ${transaction.currency}`);
    doc.moveDown();
    
    doc.text('Thank you for banking with Global Bank!', { align: 'center' });
    
    doc.end();
    
    console.log(`Invoice generated: ${filePath}`);
}

function generateDocument(docType) {
    const documents = {
        trademark: `
            <h2>TRADEMARK REGISTRATION CERTIFICATE</h2>
            <p><strong>Certificate Number:</strong> GB-TM-2024-001234</p>
            <p><strong>Registration Date:</strong> January 15, 2024</p>
            <p>This certifies that "GLOBAL BANK" has been registered as a trademark.</p>
            <p><strong>Owner:</strong> ${CONFIG.owner}</p>
            <p><strong>Email:</strong> ${CONFIG.email}</p>
        `,
        license: `
            <h2>INTERNATIONAL BANKING LICENSE</h2>
            <p><strong>License Number:</strong> IBL-2024-GB-98765</p>
            <p><strong>Issue Date:</strong> February 1, 2024</p>
            <p>This license authorizes Global Bank International to conduct banking operations globally.</p>
            <p><strong>License Holder:</strong> ${CONFIG.owner}</p>
        `,
        worldbank: `
            <h2>WORLD BANK OPERATING PERMIT</h2>
            <p><strong>Permit Number:</strong> WB-OP-2024-54321</p>
            <p><strong>Issue Date:</strong> February 15, 2024</p>
            <p>This permit authorizes Global Bank International to operate as an international financial institution.</p>
            <p><strong>Permit Holder:</strong> ${CONFIG.owner}</p>
        `,
        compliance: `
            <h2>FINANCIAL LAW COMPLIANCE CERTIFICATE</h2>
            <p><strong>Certificate Number:</strong> FLC-2024-GB-11223</p>
            <p><strong>Issue Date:</strong> March 1, 2024</p>
            <p>This certifies that Global Bank International is in full compliance with international financial laws.</p>
            <p><strong>Compliance Officer:</strong> ${CONFIG.owner}</p>
        `,
        registration: `
            <h2>BUSINESS REGISTRATION CERTIFICATE</h2>
            <p><strong>Registration Number:</strong> GB-BR-2024-99887</p>
            <p><strong>Registration Date:</strong> January 10, 2024</p>
            <p>This confirms the registration of Global Bank International as a legitimate business entity.</p>
            <p><strong>Owner:</strong> ${CONFIG.owner}</p>
            <p><strong>Email:</strong> ${CONFIG.email}</p>
            <p><strong>Phone:</strong> ${CONFIG.phone}</p>
        `,
        agreement: `
            <h2>BUSINESS OPERATING AGREEMENT</h2>
            <p><strong>Agreement Number:</strong> GB-BOA-2024-44556</p>
            <p><strong>Effective Date:</strong> January 20, 2024</p>
            <p>This Business Operating Agreement is entered into by ${CONFIG.owner} and Global Bank International.</p>
            <p><strong>Owner Contact:</strong> ${CONFIG.email}, ${CONFIG.phone}</p>
        `
    };
    
    return documents[docType] || '<p>Document not found</p>';
}

// Mining system
function startMining() {
    if (miningInterval) return;
    
    miningInterval = setInterval(() => {
        if (!database.settings.miningEnabled) {
            stopMining();
            return;
        }
        
        database.users.forEach(user => {
            // Add daily credit (distributed over 5-second intervals)
            const dailyCreditPerInterval = database.settings.dailyCredit / (24 * 60 * 60 / 5);
            user.balance += dailyCreditPerInterval;
            
            // Add mining reward randomly
            if (Math.random() < 0.1) {
                user.minedCoins += database.settings.miningReward;
                user.cryptoBalance += database.settings.miningReward;
            }
        });
        
        // Notify main window
        if (mainWindow) {
            mainWindow.webContents.send('mining-update', {
                users: database.users,
                timestamp: new Date().toISOString()
            });
        }
    }, CONFIG.miningInterval);
    
    console.log('Mining started');
}

function stopMining() {
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
        console.log('Mining stopped');
    }
}

// Export functions for testing
module.exports = {
    database,
    generateAccountNumber,
    generateCryptoAddress,
    startMining,
    stopMining
};