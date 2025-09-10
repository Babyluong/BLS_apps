# BLS (Basic Life Support) Training App

A comprehensive React Native application for Basic Life Support training and assessment, built with Expo and Supabase.

## 🏥 Overview

This application provides a complete BLS training platform with:
- **User Authentication** - Secure login system for participants, staff, and administrators
- **Pre/Post Tests** - Interactive quizzes to assess knowledge before and after training
- **Practical Assessments** - Checklist-based evaluations for hands-on skills
- **Results Tracking** - Comprehensive scoring and progress monitoring
- **Multi-role Support** - Different interfaces for users, staff, and administrators

## 🚀 Features

### For Participants
- **Secure Login** - IC number and name-based authentication
- **Interactive Quizzes** - Pre-test and post-test assessments
- **Practical Checklists** - Step-by-step skill evaluations
- **Progress Tracking** - View scores and improvement over time
- **Mobile-First Design** - Optimized for mobile devices

### For Staff
- **Participant Management** - View and manage participant data
- **Results Monitoring** - Track participant progress and scores
- **Assessment Tools** - Conduct practical evaluations

### For Administrators
- **Full System Access** - Complete control over the application
- **User Management** - Add, edit, and manage all users
- **Data Analytics** - Comprehensive reporting and insights
- **System Configuration** - Manage settings and preferences

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: Custom components with modern design
- **Authentication**: Supabase Auth with custom login flow

## 📱 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bls-training-app.git
   cd bls-training-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (mobile)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## 🗄️ Database Schema

### Key Tables
- **profiles** - User information and roles
- **bls_results** - Assessment results and scores
- **quiz_sessions** - Pre/post test sessions
- **checklist_items** - Practical assessment criteria
- **checklist_results** - Individual checklist evaluations

### User Roles
- **admin** - Full system access
- **staff** - Participant management and assessment
- **user** - Standard participant access

## 🔐 Authentication

The app uses a custom authentication system:
- **Login Method**: IC number + Full name
- **Email Format**: `[IC]@hospital-lawas.local`
- **Password**: IC number
- **Role-based Access**: Different interfaces based on user role

## 📊 Assessment System

### Pre/Post Tests
- 30 multiple-choice questions
- Automatic scoring and percentage calculation
- Progress tracking and improvement analysis

### Practical Assessments
- **One-man CPR** - Adult CPR technique evaluation
- **Two-man CPR** - Team-based CPR assessment
- **Adult Choking** - Heimlich maneuver evaluation
- **Infant Choking** - Infant-specific techniques
- **Infant CPR** - Pediatric CPR assessment

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on various screen sizes
- **Intuitive Navigation** - Easy-to-use interface
- **Accessibility** - Screen reader and keyboard support
- **Dark/Light Mode** - User preference support

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### App Store Deployment
```bash
expo build:ios
expo build:android
```

## 📝 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers
5. Add your credentials to environment variables

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Hospital Lawas for providing the BLS training requirements
- Supabase team for the excellent backend platform
- Expo team for the amazing development tools
- React Native community for continuous support

## 📞 Support

For support and questions:
- Email: your.email@example.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/bls-training-app/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core BLS training features
- **v1.1.0** - Added practical assessment checklists
- **v1.2.0** - Enhanced UI/UX and mobile optimization
- **v1.3.0** - Added multi-role support and admin features

---

**Note**: This application is designed specifically for Hospital Lawas BLS training program. Please ensure all participants have proper authorization before accessing the system.
