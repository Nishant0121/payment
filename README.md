# 💳 Full-Stack Payment Dashboard App

A secure, mobile-first payment management dashboard built with **React Native (Expo)** and **Next.js**, featuring user authentication, transaction management, and real-time metrics.

---

## 🚀 Features

### ✅ Core Features

- User login with JWT authentication
- Dashboard with key metrics (total payments, revenue, failed transactions)
- Paginated transaction list with filters (date, status, method)
- Add new simulated payments
- View detailed transaction info
- Admin-only user management

### 🎁 Bonus Features

- Export transactions to CSV

## 🛠️ Setup Instructions

### 📦 Backend (Next.js API)

```bash
cd server
npm install
npm run dev
```

### Environment Variables

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/Payment?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
NODE_ENV=production
```

### 📱 Frontend (React Native)

```bash
cd client
npm install
npx expo start
```

### Secure Storage

Uses [expo-secure-store](https://docs.expo.io/versions/latest/sdk/securestore/) to store JWT tokens securely.

### 🔐 Sample User Credentials

| Role   | Username | Password  |
| ------ | -------- | --------- |
| Admin  | admin    | admin123  |
| intern | intern   | intern123 |

### API Endpoints

#### 🔑 Authentication

- `POST /auth/login`: Login and receive JWT

#### 💰 Payments

- `GET /payments`: List payments with filters & pagination
- `GET /payments/:id`: View payment details
- `POST /payments`: Add new payment
- `GET /payments/stats`: Dashboard metrics

#### 👤 Users (Admin only)

- `GET /users`: List users
- `POST /users`: Add new user

### 📸 Screenshots

<img src="/assets/Screenshot_20250705_222027.jpg" alt="alt text" height="100" width="150">
<img src="/assets/Screenshot_20250705_222032.jpg" alt="alt text" height="100" width="150">
<img src="/assets/Screenshot_20250705_222017.jpg" alt="alt text" height="100" width="150">
<img src="/assets/Screenshot_20250705_222002.jpg" alt="alt text" height="100" width="150">
<img src="/assets/Screenshot_20250705_221756.jpg" alt="alt text" height="100" width="150">

add

#### Backend (NestJS)

```bash
└── 📁src
    └── 📁app
        └── 📁auth
            └── 📁login
                ├── route.js
        └── 📁payments
            └── 📁[id]
                ├── route.js
            └── 📁stats
                ├── route.js
            ├── route.js
        └── 📁socket
        └── 📁users
            ├── route.js
        ├── route.js
    └── 📁lib
        ├── mongodb.js
        └── verifyToken.js
```

```bash
└──
    └── 📁app
        └── 📁admin
            ├── _layout.tsx
            ├── add-payment.tsx
            ├── add-user.tsx
            ├── dashboard.tsx
            ├── transactions.tsx
        └── 📁users
            ├── _layout.tsx
            ├── add-payment.tsx
            ├── dashboard.tsx
            ├── transactions.tsx
        ├── _layout.tsx
        ├── +not-found.tsx
        ├── login.tsx
        ├── transactions-details.tsx
    └── 📁components
        └── 📁custom
            ├── AddPaymentForm.tsx
            ├── AddUserForn.tsx
            ├── PaymentStatsChart.tsx
            ├── TransactionFilters.tsx
            ├── TransactionItem.tsx
            ├── TransactionList.tsx
        └── 📁ui
            ├── IconSymbol.ios.tsx
            ├── IconSymbol.tsx
            ├── TabBarBackground.ios.tsx
            ├── TabBarBackground.tsx
        ├── Collapsible.tsx
        ├── ExternalLink.tsx
        ├── HapticTab.tsx
        ├── HelloWave.tsx
        ├── ParallaxScrollView.tsx
        ├── ThemedText.tsx
        ├── ThemedView.tsx
    └── 📁constants
        ├── Colors.ts
    └── 📁hooks
        ├── useColorScheme.ts
        ├── useColorScheme.web.ts
        ├── useThemeColor.ts
```
