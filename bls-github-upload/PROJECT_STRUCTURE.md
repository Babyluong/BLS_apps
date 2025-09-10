# BLS Training App - Project Structure

## Overview
This is a React Native application built with Expo for Basic Life Support training at Hospital Lawas.

## Directory Structure

```
bls-training-app/
├── src/                           # Main application source code
│   ├── components/                # Reusable React components
│   │   └── LoginCard.js          # Login form component
│   ├── screens/                   # Screen components
│   │   ├── LoginScreen.js        # Login screen
│   │   ├── AdminHomeScreen.js    # Admin dashboard
│   │   ├── AdminMenuScreen.js    # Admin menu
│   │   ├── StaffHomeScreen.js    # Staff dashboard
│   │   ├── UserHomeScreen.js     # User dashboard
│   │   └── ...                   # Other screen components
│   ├── services/                  # API and external services
│   │   └── supabase.js           # Supabase configuration
│   ├── utils/                     # Utility functions
│   └── styles/                    # Style definitions
├── scripts/                       # Database and migration scripts
│   ├── generateDataOnly.cjs      # Data generation scripts
│   ├── migrateParticipantsToUsers.cjs
│   └── ...                       # Other database scripts
├── assets/                        # Static assets (images, fonts, etc.)
├── docs/                          # Documentation files
├── App.js                         # Main application entry point
├── constants.js                   # Application constants
├── package.json                   # Dependencies and scripts
├── README.md                      # Project documentation
├── .gitignore                     # Git ignore rules
└── PROJECT_STRUCTURE.md           # This file
```

## Key Files

### Core Application
- `App.js` - Main application component with routing and state management
- `constants.js` - Application constants including admin user data
- `package.json` - Project dependencies and scripts

### Authentication
- `src/screens/LoginScreen.js` - Login interface
- `src/components/LoginCard.js` - Login form component
- `src/services/supabase.js` - Supabase configuration

### Database Scripts
- `scripts/` - Contains all database migration and setup scripts
- These scripts handle user creation, data migration, and database setup

## Getting Started

1. Install dependencies: `npm install`
2. Configure Supabase credentials in environment variables
3. Run database setup scripts if needed
4. Start development server: `npm start`

## Technology Stack
- React Native with Expo
- Supabase (PostgreSQL + Auth + Real-time)
- React Navigation
- Custom UI components
