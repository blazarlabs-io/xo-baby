# Midnight Medical Records

A privacy-focused medical records management system built on the Midnight Network blockchain, designed for managing children's health records with end-to-end encryption and decentralized storage.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Environment Configuration](#environment-configuration)
- [Key Technologies](#key-technologies)
- [Important Notes](#important-notes)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Midnight Medical Records is a secure, decentralized application for managing children's medical records. It leverages blockchain technology (Midnight Network) for data integrity and privacy, IPFS for decentralized storage, and Firebase for authentication and real-time data synchronization.

### Key Highlights

- **Privacy-First**: End-to-end encryption for sensitive medical data
- **Blockchain Integration**: Built on Midnight Network for secure, immutable records
- **Decentralized Storage**: IPFS (via Pinata) for storing medical images and documents
- **Cross-Platform**: React Native mobile app with Android support
- **Comprehensive Records**: Track measurements, teasks, vaccinations, diagnoses, and health notes

## ✨ Features

- 👶 Child profile management
- 📊 Growth tracking (height, weight, head circumference)
- 💉 Vaccination records and schedules
- 🏥 Doctor diagnoses and medical history
- 📝 Health notes and tasks
- 🔐 Secure authentication (Firebase + Google OAuth)
- 🌐 Decentralized data storage
- 📱 Mobile-first design

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Blockchain**: Midnight Network
- **Storage**: IPFS (Pinata cloud service)
- **Authentication**: Firebase Admin SDK

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation v7
- **Authentication**: Firebase + Expo Auth Session
- **Storage**: AsyncStorage
- **Package Manager**: npm

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher (recommended: v20+)
- **pnpm**: v10.14.0 or higher (for backend)
- **npm**: v8 or higher (for frontend)
- **Expo CLI**: Latest version
- **Git**: For cloning the repository

### Optional (for mobile development)
- **Android Studio**: For Android development
- **Expo Go App**: For testing on physical devices

### Required Accounts
- **Firebase Account**: For authentication and database
- **Pinata Account**: For IPFS storage (free tier available)
- **Google Cloud Console**: For Google OAuth (if using Google Sign-In)

## 📁 Project Structure

```
Midnight_Medical_Records/
├── xo-baby-backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── kid/              # Child management
│   │   ├── medical-data/     # Medical records
│   │   ├── vaccination/      # Vaccination records
│   │   ├── measurements/     # Growth measurements
│   │   ├── doctor-diagnosis/ # Doctor diagnoses
│   │   ├── notes/            # Health notes
│   │   ├── ipfs/             # IPFS integration
│   │   ├── firebase/         # Firebase configuration
│   │   ├── midnight/         # Midnight Network integration
│   │   └── main.ts           # Application entry point
│   ├── contract/             # Smart contracts
│   ├── package.json
│   └── README.md
│
├── xo-baby-app/              # React Native Frontend
│   ├── src/
│   │   ├── screens/          # App screens
│   │   ├── components/       # Reusable components
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   └── utils/            # Utility functions
│   ├── assets/               # Images, fonts, etc.
│   ├── App.tsx               # Root component
│   ├── app.json              # Expo configuration
│   ├── package.json
│   └── CRITICAL_SETUP.txt    # Important setup information
│
└── README.md                 # This file
```

## 🚀 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd xo-baby-backend
```

### Step 2: Install Dependencies

The project uses **pnpm** as the package manager:

```bash
pnpm install
```

> **Note**: If you don't have pnpm installed, install it globally:
> ```bash
> npm install -g pnpm
> ```

### Step 3: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Generate a service account key:
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file as `serviceAccountKey.json`
4. Place the file in: `xo-baby-backend/src/firebase/`

### Step 4: Environment Variables

Create a `.env` file in the `xo-baby-backend` directory:

```bash
# API Configuration
PORT=3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_ID
FIREBASE_CLIENT_EMAIL=your_firebase_mail
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_DB_URL=your_filebase_db_url

# Midnight Configuration
PRIVATE_KEY=your_midnight_wallet_private_key
CONTRACT_ADDRESS=your_midnight_contract_address
MIDNIGHT_NETWORK=testnet

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secert_key
PINATA_GATEWAY_TOKEN=your_pinata_gateway_token
PINATA_PERSONAL_GATEWAY=your_pinata_personal_gateway
```

### Step 5: Build the Project

```bash
npm run build
```

### Step 6: Start the Backend Server

For development (with hot reload):
```bash
npm run start:dev
```

For production:
```bash
npm run start:prod
```

The backend server will start on `http://localhost:3000`

## 📱 Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd xo-baby-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Pinata IPFS Configuration

This is **CRITICAL** for the app to work properly. Public IPFS gateways are often blocked or rate-limited.

1. **Get Your Pinata Credentials**:
   - Sign up at [Pinata](https://app.pinata.cloud/)
   - Go to [API Keys](https://app.pinata.cloud/developers/api-keys)
   - Create a new API key and copy:
     - API Key
     - API Secret

2. **Get Your Dedicated Gateway**:
   - Go to [Gateway Settings](https://app.pinata.cloud/gateway)
   - Copy your dedicated gateway URL (e.g., `https://your-gateway.mypinata.cloud`)

### Step 4: Create Environment File

Create a `.env` file in the `xo-baby-app` directory:

```bash
# Pinata IPFS Configuration (REQUIRED)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_key_here
PINATA_GATEWAY=https://your-gateway.mypinata.cloud

# API Configuration
API_URL=http://localhost:3000

# Firebase Configuration (from Firebase Console → Project Settings → General)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Google OAuth (optional, for Google Sign-In)
GOOGLE_WEB_CLIENT_ID=your_web_client_id
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
```

> **Note**: See `env.example.txt` for reference

### Step 5: Firebase Configuration for Frontend

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings**
4. Scroll down to "Your apps" section
5. Add a web app and/or mobile apps
6. Copy the configuration values to your `.env` file
7. Download `google-services.json` for Android and place it in the root directory

### Step 6: Start the Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator (macOS only)
- Scan QR code with Expo Go app on your phone

## 🎮 Running the Application

### Complete Setup Flow

1. **Terminal 1 - Start Backend**:
   ```bash
   cd xo-baby-backend
   npm run start:dev
   ```
   Wait until you see: `Application is running on: http://localhost:3000`

2. **Terminal 2 - Start Frontend**:
   ```bash
   cd xo-baby-app
   npm start
   ```
   Choose your platform (Android/iOS)

### Running on Android Emulator

```bash
cd xo-baby-app
npm run android
```

### Running on iOS Simulator (macOS only)

```bash
cd xo-baby-app
npm run ios
```

### Testing on Physical Device

1. Install **Expo Go** app from Play Store or App Store
2. Make sure your device is on the same network as your development machine
3. Scan the QR code shown in the terminal
4. Update the `API_URL` in `.env` to your computer's local IP:
   ```
   API_URL=http://192.168.1.xxx:3000
   ```

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `MIDNIGHT_NODE_URL` | Midnight Network RPC endpoint | Yes |
| `MIDNIGHT_INDEXER_URL` | Midnight Network indexer endpoint | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PINATA_API_KEY` | Pinata API key for IPFS uploads | Yes |
| `PINATA_SECRET_API_KEY` | Pinata secret key | Yes |
| `PINATA_GATEWAY` | Your dedicated Pinata gateway URL | Yes |
| `API_URL` | Backend API URL | Yes |
| `FIREBASE_API_KEY` | Firebase configuration | Yes |
| `FIREBASE_AUTH_DOMAIN` | Firebase configuration | Yes |
| `FIREBASE_PROJECT_ID` | Firebase configuration | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase configuration | Yes |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase configuration | Yes |
| `FIREBASE_APP_ID` | Firebase configuration | Yes |
| `GOOGLE_WEB_CLIENT_ID` | Google OAuth client ID | No* |
| `GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID | No* |

*Required if using Google Sign-In

## 🔑 Key Technologies

### Midnight Network
A privacy-focused blockchain platform that enables confidential smart contracts. Used for storing medical records with zero-knowledge proofs.

### IPFS (InterPlanetary File System)
Decentralized storage system for medical images and documents. Files are stored permanently and accessed via content-addressed hashes.

### Firebase
- **Firestore**: NoSQL database for user profiles and metadata
- **Authentication**: User authentication with email/password and Google OAuth
- **Admin SDK**: Backend authentication verification

### NestJS
Enterprise-grade Node.js framework with TypeScript, providing:
- Modular architecture
- Dependency injection
- Built-in validation
- WebSocket support

### React Native + Expo
Cross-platform mobile development with:
- Single codebase for iOS and Android
- Fast development with Expo tools
- Over-the-air updates
- Native module integration

## ⚠️ Important Notes

### IPFS Gateway Configuration
**This is critical!** The app will not work properly without configuring your Pinata gateway. Public IPFS gateways are blocked or rate-limited. Follow the setup instructions in [Frontend Setup - Step 3](#step-3-pinata-ipfs-configuration).

### Firebase Security Rules
Make sure to configure proper security rules in Firebase Firestore:
- Users should only access their own data
- Implement role-based access control
- Validate data on the backend

### Development vs Production
- **Development**: Backend runs on `localhost:3000`
- **Production**: Update `API_URL` and configure CORS in backend `main.ts`

### Mobile Testing
- **Android**: Ensure Android Studio and emulator are properly configured
- **iOS**: Requires macOS and Xcode
- **Physical Devices**: Must be on same network as development machine

### Port Conflicts
If port 3000 is already in use, change the `PORT` in backend `.env` file and update frontend `API_URL` accordingly.

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `pnpm: command not found`
```bash
npm install -g pnpm
```

**Problem**: Firebase initialization error
- Verify `serviceAccountKey.json` is in `src/firebase/` directory
- Check Firebase console for project configuration
- Ensure Firebase Admin SDK is initialized correctly

**Problem**: Port already in use
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Frontend Issues

**Problem**: Expo not starting
```bash
# Clear cache and restart
rm -rf node_modules/.cache .expo
npm start --clear
```

**Problem**: Images not loading (403 errors)
- Configure your Pinata gateway properly (see CRITICAL_SETUP.txt)
- Verify `.env` file has correct Pinata credentials
- Check Pinata dashboard for API usage

**Problem**: Cannot connect to backend
- Verify backend is running on correct port
- Check `API_URL` in frontend `.env`
- For physical devices, use local IP address instead of localhost
- Verify CORS settings in backend `main.ts`

**Problem**: Firebase authentication not working
- Verify Firebase configuration in `.env`
- Check Firebase console for enabled authentication methods
- For Google Sign-In, ensure OAuth client IDs are correct

**Problem**: Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Problem**: iOS build fails (macOS)
```bash
cd ios
pod install
cd ..
npm run ios
```

### Network Issues

**Problem**: Cannot access backend from mobile device
1. Get your computer's local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   # Windows
   ipconfig
   ```
2. Update frontend `.env`:
   ```
   API_URL=http://192.168.1.xxx:3000
   ```
3. Ensure firewall allows connections on port 3000

### Cache Issues

**Problem**: Changes not reflecting
```bash
# Backend
cd xo-baby-backend
rm -rf dist
pnpm run build

# Frontend
cd xo-baby-app
rm -rf node_modules/.cache .expo
npm start --clear
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Midnight Network Documentation](https://docs.midnight.network/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Pinata Documentation](https://docs.pinata.cloud/)

## 🧪 Testing

### Backend Tests
```bash
cd xo-baby-backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd xo-baby-app
npm test
```

## 📝 Development Workflow

1. **Create a new branch** for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** and test locally
   - Start backend in development mode
   - Start frontend with hot reload
   - Test on emulator/simulator

3. **Run linting**
   ```bash
   # Backend
   cd xo-baby-backend
   npm run lint

   # Frontend
   cd xo-baby-app
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🔐 Security Considerations

- **Never commit** `.env` files or Firebase service account keys
- **Always** use environment variables for sensitive data
- **Implement** proper authentication and authorization
- **Validate** all user inputs on backend
- **Encrypt** sensitive medical data before storage
- **Use HTTPS** in production
- **Rotate** API keys regularly
- **Monitor** Firebase and Pinata usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is private and proprietary. Unauthorized copying, modification, or distribution is prohibited.

## 👥 Team & Support

For questions or support, please contact the development team.

---

**Built with ❤️ using Midnight Network, NestJS, and React Native**

