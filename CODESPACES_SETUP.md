# BLS App - GitHub Codespaces Setup Guide

## 🚀 Quick Start in Codespaces

### 1. Open in Codespaces
- Go to: https://github.com/Babyluong/BLS_apps
- Click "Code" → "Codespaces" → "Create codespace on main"

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Start Development Server
```bash
npm start
```

### 5. Open in Browser
- Press `w` to open in web browser
- Or scan QR code with Expo Go app on mobile

## 📁 Project Structure
```
BLS_apps/
├── src/
│   ├── components/     # React components
│   ├── screens/        # Screen components
│   ├── services/       # Supabase services
│   ├── utils/          # Utility functions
│   └── styles/         # Style files
├── scripts/            # Database scripts
├── assets/             # Images and icons
├── App.js              # Main app file
├── constants.js        # App constants
└── package.json        # Dependencies
```

## 🔧 Development Commands
- `npm start` - Start Expo development server
- `npm run web` - Run on web browser
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

## 🐛 Troubleshooting
- If port 8081 is busy, use port 8082
- Make sure all dependencies are installed
- Check Supabase credentials are correct
- Clear cache if needed: `expo start --clear`

## 📱 Testing
- **Web**: Press `w` in terminal
- **Mobile**: Scan QR code with Expo Go
- **Simulator**: Press `i` for iOS or `a` for Android

## 🎯 Features Available
- ✅ User authentication (IC + Name)
- ✅ Admin, Staff, and User roles
- ✅ Pre/Post test quizzes
- ✅ BLS practical assessments
- ✅ Results tracking and reporting
- ✅ Modern, responsive UI

Happy coding! 🎉

