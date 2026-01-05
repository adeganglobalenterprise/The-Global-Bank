# Global Bank International - Complete Banking System

## 🌍 Project Overview

**Global Bank International** is a comprehensive, full-featured international banking system with cryptocurrency integration, automated mining capabilities, and multi-platform support. This project includes web, Android, and desktop applications designed to provide seamless banking services worldwide.

### Owner Information
- **Name:** Olawale Abdul-ganiyu Adeshina
- **Email:** adeganglobal@gmail.com
- **Phone:** +2349030377275

---

## ✨ Key Features

### 💰 Banking Services
- **Multi-Currency Support:** USD, EUR, GBP, NGN, and more
- **International Transfers:** SWIFT, Western Union, PayPal, Skrill, Payeer
- **Crypto Integration:** Bitcoin (BTC), Ethereum (ETH), USDT, Coinbase, Blockchain
- **Account Management:** Create accounts, generate account numbers
- **Transaction History:** Complete audit trail with timestamps

### 🪙 Cryptocurrency Features
- **Auto-Generated Wallets:** BTC, ETH, USDT addresses for each user
- **Mining System:** Configurable mining with 0.5 coins reward per transaction
- **Real-Time Balance Updates:** Bit pattern precision (0.00000000)
- **Crypto Transfers:** Send/receive to any wallet address
- **Currency Exchange:** Convert between crypto and fiat currencies

### ⛏️ Automated Mining
- **Toggle Control:** Admin can enable/disable mining
- **Daily Credits:** Automatic 10 currency credit per day
- **Mining Rewards:** 0.5 coins per transaction when enabled
- **5-Second Intervals:** Updates every 5 seconds for real-time mining

### 👥 Customer Management
- **Document Upload:** Passport, ID card, address proof
- **Personal Information:** Full profile management
- **Account Security:** Password-protected accounts
- **Welcome Emails:** Automated registration emails

### 🎛️ Admin Dashboard
- **Real-Time Monitoring:** Live activity feed
- **Customer Management:** View, search, manage all customers
- **Fund Management:** Credit/debit accounts with various payment methods
- **Transaction Oversight:** Complete transaction history and filtering
- **System Controls:** Mining toggle, rate adjustments, settings

### 📄 Banking Documents
- **Trademark Approval:** Official trademark registration
- **Banking License:** International banking operating license
- **World Bank Permit:** Authorization to operate globally
- **Compliance Certificate:** Financial law compliance
- **Business Registration:** Official business documents
- **Business Agreement:** Terms and conditions

### 🎨 User Interface
- **Modern Design:** Clean, professional banking interface
- **Responsive Layout:** Works on all screen sizes
- **Dark Mode Support:** Eye-friendly viewing options
- **Smooth Animations:** Enhanced user experience

---

## 📱 Platform Support

### 1. Web Application
**Location:** `/workspace/`

**Technologies:**
- HTML5, CSS3, JavaScript (ES6+)
- LocalStorage for data persistence
- Font Awesome icons
- Google Fonts (Roboto, Inter)

**Features:**
- Complete customer dashboard
- Admin panel with full controls
- Crypto wallet management
- Document upload system
- Transaction invoices with PDF generation

**Access:** Open `index.html` in any modern web browser

---

### 2. Android Application
**Location:** `/workspace/minipay-android/`

**Technologies:**
- Kotlin
- Android 15 (API 35)
- Jetpack Compose
- Retrofit for API calls
- Room Database
- Coroutines
- Biometric Authentication
- Camera API

**Features:**
- Native Android experience
- Push notifications
- Biometric login
- Camera for document capture
- Background mining service
- Offline data persistence

**Build Instructions:**
```bash
cd minipay-android
./gradlew assembleDebug
# Install APK on Android device
```

**Configuration:**
- `API_BASE_URL`: https://api.globalbank.international/v2/
- `OWNER_EMAIL`: adeganglobal@gmail.com
- `OWNER_PHONE`: +2349030377275

---

### 3. Desktop Application
**Location:** `/workspace/minipay-desktop/`

**Technologies:**
- Electron.js
- Node.js
- PDFKit for invoice generation
- Electron Store for settings
- Native OS integration

**Features:**
- Native desktop experience
- Menu shortcuts
- File system integration
- PDF invoice export
- System tray support
- Cross-platform (Windows, macOS, Linux)

**Build Instructions:**
```bash
cd minipay-desktop
npm install
npm start          # Development mode
npm run build-win  # Build for Windows
npm run build-mac  # Build for macOS
npm run build-linux # Build for Linux
```

**Configuration:**
- `API_BASE_URL`: https://api.globalbank.international/v3/
- Owner details configured in `main.js`

---

## 🔐 Security Features

### Admin Access
- **Admin Email:** adeganglobal@gmail.com
- **Admin Password:** Admin@GlobalBank2024
- **Owner:** Olawale Abdul-ganiyu Adeshina
- **Protected:** Only admin can edit customer accounts

### Customer Security
- Password-protected accounts
- Session management
- Secure document storage
- Transaction verification
- Email notifications for all transactions

### System Security
- LocalStorage encryption (web)
- Secure API endpoints
- Input validation
- SQL injection prevention
- XSS protection

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  accountNumber: String,
  balance: Number (0.00 format),
  cryptoBalance: Number (0.00000000 format),
  minedCoins: Number (0.00000000 format),
  cryptoAddresses: {
    BTC: String,
    ETH: String,
    USDT: String
  },
  role: String ('customer' | 'admin'),
  createdAt: Date,
  lastLogin: Date,
  documents: {
    passport: String (base64),
    idCard: String (base64),
    addressProof: String (base64)
  },
  address: String,
  isOnline: Boolean
}
```

### Transactions Collection
```javascript
{
  id: String,
  userEmail: String,
  type: String ('credit' | 'debit' | 'transfer' | 'exchange' | 'mining'),
  amount: Number,
  currency: String,
  method: String,
  description: String,
  status: String,
  date: Date,
  invoiceId: String,
  fromAddress: String,
  toAddress: String,
  network: String
}
```

### Settings Collection
```javascript
{
  miningEnabled: Boolean,
  dailyCredit: Number (default: 10),
  miningReward: Number (default: 0.5),
  exchangeRates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1550,
    BTC: 0.000015,
    ETH: 0.00031
  }
}
```

---

## 💳 Payment Methods Supported

### Card Payments
- MasterCard
- Visa Card
- Versa Card
- Gift Cards

### Bank Transfers
- SWIFT Transfers
- Commercial Banks
- Microfinance Banks
- International Wire Transfers

### Cryptocurrency
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT (Tether)
- Blockchain Transfers
- Coinbase
- PayPal Crypto
- Skrill Crypto

### Money Transfer Services
- PayPal
- Western Union
- Skrill
- Payeer

---

## 📊 Admin Dashboard Features

### Overview Section
- Total customers count
- Total balance across all accounts
- Total crypto holdings
- Transactions today counter
- Live activity feed

### Customer Management
- Create new customers
- View customer details
- Search customers by name/email/account
- View customer transaction history
- Manage customer documents

### Transaction Management
- View all transactions
- Filter by type (credit/debit/crypto)
- Filter by date
- Generate transaction invoices
- Export transaction reports

### Fund Management
- Credit customer accounts
- Debit customer accounts
- Multiple payment methods
- Transaction descriptions
- Automatic invoice generation

### Document Management
- View all banking documents
- Trademark approval
- Banking license
- World Bank permit
- Compliance certificate
- Business registration
- Business agreement

### System Settings
- Toggle mining on/off
- Adjust daily credit amount
- Configure mining rewards
- Update exchange rates

---

## 🔄 Mining System

### Configuration
- **Mining Interval:** 5 seconds
- **Daily Credit:** 10 currency (distributed per interval)
- **Mining Reward:** 0.5 coins per transaction
- **Status:** Controlled by admin toggle

### How It Works
1. Admin enables mining in settings
2. System automatically credits all users every 5 seconds
3. Daily credit is distributed: 10 / (24 * 60 * 60 / 5)
4. Mining reward added randomly (10% chance per interval)
5. Real-time updates across all platforms

### Customer vs Admin Mining
- **Customers:** Can view mining rewards but cannot control mining
- **Admin:** Full control over mining system

---

## 📧 Email Integration

### Welcome Email
Sent automatically when new customer registers:
- Login credentials (email and password)
- Account number
- Crypto wallet addresses
- Bank contact information
- Welcome message from owner

### Transaction Alerts
Sent for all credit transactions:
- Transaction amount
- Payment method
- Transaction date/time
- Updated balance
- Bank contact information

### Support Email
- **Primary:** adeganglobal@gmail.com
- **Phone:** +2349030377275
- Google Support integrated

---

## 🖨️ Invoice Generation

### Transaction Invoices
- Professional PDF format
- Bank branding
- Transaction details
- Customer information
- Date and timestamps
- Automatic generation on every transaction

### Document Features
- View banking documents in-app
- Print support
- Download capability
- Professional formatting

---

## 🚀 Deployment Guide

### Web Application
1. Upload all files to web server
2. Ensure HTTPS is enabled
3. Configure CORS if using API
4. Set up email service for notifications
5. Test all features

### Android Application
1. Build APK using Android Studio
2. Sign with release keystore
3. Upload to Google Play Store
4. Configure push notifications
5. Test on various Android devices

### Desktop Application
1. Install dependencies: `npm install`
2. Build for target platform
3. Code sign the application
4. Distribute via website or app store
5. Provide installation instructions

---

## 📱 API Integration

### API Endpoints
- **Web:** https://api.globalbank.international/v1/
- **Android:** https://api.globalbank.international/v2/
- **Desktop:** https://api.globalbank.international/v3/

### Authentication
- JWT tokens for secure access
- Session management
- Role-based access control

### Supported Operations
- User authentication
- Account creation
- Balance management
- Transaction processing
- Crypto address generation
- Document upload
- Invoice generation

---

## 🌐 International Compliance

### Banking Documents
All applications include:
- ✅ Trademark Registration Certificate
- ✅ International Banking License
- ✅ World Bank Operating Permit
- ✅ Financial Law Compliance Certificate
- ✅ Business Registration
- ✅ Business Operating Agreement

### Regulatory Compliance
- Basel III Standards
- AML/KYC Requirements
- FATF Guidelines
- Data Protection Laws
- Consumer Protection Regulations

---

## 🎯 Use Cases

### For Customers
1. **Personal Banking:** Manage personal finances
2. **Business Banking:** Handle business transactions
3. **Crypto Trading:** Buy, sell, and exchange cryptocurrencies
4. **International Transfers:** Send money worldwide
5. **Investment:** Earn through mining rewards

### For Admin
1. **Customer Management:** Create and manage accounts
2. **Fund Control:** Credit and debit customer accounts
3. **Monitoring:** Real-time system oversight
4. **Reporting:** Generate reports and invoices
5. **Configuration:** Adjust system settings

---

## 🛠️ Technical Support

### Contact Information
- **Email:** adeganglobal@gmail.com
- **Phone:** +2349030377275
- **Google Support:** Integrated

### Documentation
- Complete source code documentation
- API documentation
- User guides
- Admin manuals

---

## 📝 License & Ownership

**Owner:** Olawale Abdul-ganiyu Adeshina  
**Contact:** adeganglobal@gmail.com  
**Phone:** +2349030377275  

**Proprietary Software**  
All rights reserved. Unauthorized reproduction, distribution, or use of this software is strictly prohibited.

---

## 🔄 Version History

### Version 2.0.0 (Current)
- ✅ Complete international banking system
- ✅ Multi-platform support (Web, Android, Desktop)
- ✅ Cryptocurrency integration
- ✅ Automated mining system
- ✅ Banking documentation
- ✅ Advanced admin dashboard
- ✅ Multi-currency support
- ✅ International payment methods

---

## 🙏 Acknowledgments

This comprehensive banking system was developed using:
- Modern web technologies (HTML5, CSS3, JavaScript)
- Mobile development frameworks (Kotlin, Android SDK)
- Desktop application frameworks (Electron, Node.js)
- Banking industry standards
- International compliance regulations

---

## 📞 Support & Contact

For any questions, support, or inquiries:
- **Email:** adeganglobal@gmail.com
- **Phone:** +2349030377275
- **Owner:** Olawale Abdul-ganiyu Adeshina

---

**© 2024 Global Bank International. All Rights Reserved.**