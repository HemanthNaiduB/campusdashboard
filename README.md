# Campus Hiring Dashboard

A comprehensive web application for managing and evaluating student data during campus recruitment, built with Next.js, Firebase, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication
- Email/password signup and login with Firebase Auth
- Protected dashboard routes
- Automatic redirect based on authentication state

### 📊 Student Management Dashboard
- **Smart Filtering**: Filter students by college, branch, CGPA, skills, GitHub/HackerEarth scores
- **Dual View Modes**: Toggle between grid and table views
- **Real-time Stats**: Live count summary of total, filtered, selected, pending, and rejected students
- **Advanced Search**: Search by name or email with instant results

### 📄 Student Profiles
- Comprehensive student profile modal with:
  - Basic information (name, email, phone, college, branch)
  - Academic data (CGPA, selection status)
  - Technical scores (GitHub score, HackerEarth score, code quality)
  - GitHub statistics (followers, repos, commit frequency)
  - Skills with tag visualization
  - Direct links to resume and GitHub profile

### 📥 Export Functionality
- Export filtered student data as CSV
- Includes all student fields for comprehensive analysis
- Automatic filename with timestamp

### 📱 Responsive Design
- Mobile-first design with Tailwind CSS
- Optimized for desktop, tablet, and mobile devices
- Modern, clean interface with excellent UX

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore + Auth)
- **Forms**: React Hook Form
- **Export**: Papaparse for CSV generation
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campusdashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   
   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   b. Enable Authentication with Email/Password provider
   
   c. Create a Firestore database
   
   d. Get your Firebase config and create `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Setup Firestore Collection**
   
   Create a collection named `students` with documents containing:
   ```typescript
   {
     name: string;
     email: string;
     phone: string;
     college_name: string;
     branch: string;
     selection_status: 'selected' | 'rejected' | 'pending';
     cgpa: number;
     github_score: number;
     hackerearth_score: number;
     skills: string[];
     resume_url: string;
     github_url: string;
     code_quality_score: number;
     followers: number;
     public_repos: number;
     commit_frequency: number;
     created_at?: string;
     updated_at?: string;
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Security Rules

Add these Firestore security rules for basic protection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read students
    match /students/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Adjust based on your needs
    }
  }
}
```

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Dashboard**: View the comprehensive student dashboard with stats
3. **Filter Students**: Use the advanced filtering options to find specific students
4. **View Profiles**: Click on any student card/row to view detailed profile
5. **Toggle Views**: Switch between grid and table view modes
6. **Export Data**: Export filtered results as CSV for external analysis

## 🌟 Key Components

- **AuthContext**: Firebase authentication state management
- **ProtectedRoute**: Route protection HOC
- **DashboardLayout**: Main layout with navigation and logout
- **StudentFilters**: Comprehensive filtering interface
- **StudentGrid/Table**: Dual view modes for student listing
- **StudentModal**: Detailed profile preview
- **ExportButton**: CSV export functionality

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## 🔮 Future Enhancements

- **Phase 2 Features**:
  - Add notes/ratings per student
  - Multi-select for bulk operations
  - Admin role-based access control
  - CSV upload for bulk student data
  - Interview scheduling system
  - Status update logs and history
  - Advanced analytics and reporting
  - Integration with external APIs
  - Dark mode support
  - Advanced search with filters
  - Student performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check Firebase documentation for setup issues
- Review Next.js documentation for development questions

---

**Built with ❤️ for efficient campus recruitment management**# campusdashboard
