# System Design Document: Southern MN Science Fair Web Platform

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive system design for the Southern MN Science Fair Web Platform. It serves as a detailed guide for the development team, outlining the architecture, components, data models, and implementation strategies using React and Firebase.

### 1.2 Scope
The system will manage the entire lifecycle of the Southern MN Science and Engineering Fair, including:
- User registration and management for students, teachers, judges, and administrators
- Project submission, management, and approval workflow
- Document handling, version control, and review processes
- Judge assignment, scoring, and feedback submission
- Automated award determination and result publication
- Comprehensive reporting and analytics
- Communication features between participants, judges, and administrators

### 1.3 Definitions, Acronyms, and Abbreviations
- SPA: Single Page Application
- CRUD: Create, Read, Update, Delete
- ISEF: International Science and Engineering Fair
- BaaS: Backend as a Service
- JWT: JSON Web Token
- RBAC: Role-Based Access Control
- SEO: Search Engine Optimization
- PWA: Progressive Web Application

## 2. System Architecture

### 2.1 High-Level Architecture
```
[React SPA] <-> [Firebase Services]
    |               |
    |               v
    |         [Cloud Firestore]
    |         [Firebase Auth]
    |         [Cloud Storage]
    |         [Cloud Functions]
    |               |
    |               v
    |         [External Services]
    |         - Email Service (SendGrid)
    |         - PDF Generation (PDFKit)
    |         - Analytics (Google Analytics)
    v
[Progressive Web App]
```

### 2.2 Component Description

#### 2.2.1 Frontend (React)
- Single Page Application (SPA) built with React 18
- State management using React Context API and hooks
- Global state management with Redux for complex state interactions
- Responsive design using CSS Grid, Flexbox, and Material-UI's responsive components
- UI component library: Material-UI v5
- Client-side routing using React Router v6
- Form handling and validation using Formik and Yup
- Internationalization support using react-i18next
- Progressive Web App (PWA) features for offline support and mobile device installation

#### 2.2.2 Backend (Firebase)
- Cloud Firestore for scalable, real-time database
- Firebase Authentication for secure user management and authentication
- Cloud Storage for file storage and management
- Cloud Functions for serverless backend logic and API endpoints
- Firebase Hosting for fast and secure web hosting
- Firebase Security Rules for data security and access control

#### 2.2.3 External Services
- SendGrid for transactional email services
- PDFKit for generating PDF reports and certificates
- Google Analytics for user behavior tracking and analytics

## 3. Data Design

### 3.1 Data Models

#### 3.1.1 User
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  firstName: string,
  lastName: string,
  role: 'student' | 'teacher' | 'judge' | 'admin',
  school: string,
  gradeLevel: number,
  preferences: string[], // For judges
  biography: string,
  profilePicture: string, // Storage reference
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean,
  preferences: {
    notifications: boolean,
    language: string
  }
}
```

#### 3.1.2 Project
```javascript
{
  id: string,
  title: string,
  abstract: string,
  category: string,
  subcategory: string,
  studentIds: string[],
  teacherId: string,
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected',
  documents: [
    {
      id: string,
      title: string,
      type: 'abstract' | 'report' | 'presentation' | 'other',
      storageRef: string,
      version: number,
      uploadedAt: timestamp,
      uploadedBy: string // User ID
    }
  ],
  reviewHistory: [
    {
      reviewerId: string,
      status: 'approved' | 'rejected',
      comments: string,
      timestamp: timestamp
    }
  ],
  judgeAssignments: string[], // User IDs of assigned judges
  createdAt: timestamp,
  updatedAt: timestamp,
  submittedAt: timestamp,
  isTeamProject: boolean,
  researchQuestion: string,
  hypothesis: string,
  methodology: string,
  conclusion: string,
  keywords: string[]
}
```

#### 3.1.3 Score
```javascript
{
  id: string,
  projectId: string,
  judgeId: string,
  criteria: [
    {
      name: string,
      score: number,
      maxScore: number,
      weight: number,
      comments: string
    }
  ],
  overallComments: string,
  strengthComments: string,
  improvementComments: string,
  totalScore: number,
  normalizedScore: number,
  submittedAt: timestamp,
  lastUpdatedAt: timestamp,
  status: 'draft' | 'submitted' | 'finalized',
  confidenceLevel: 'low' | 'medium' | 'high'
}
```

#### 3.1.4 Award
```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,
  criteria: string,
  sponsor: string,
  prizeDescription: string,
  projectIds: string[],
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,
  maxRecipients: number,
  minScore: number
}
```

#### 3.1.5 Event
```javascript
{
  id: string,
  name: string,
  description: string,
  startDate: timestamp,
  endDate: timestamp,
  location: string,
  type: 'registration' | 'submission' | 'judging' | 'awards',
  status: 'upcoming' | 'ongoing' | 'completed',
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string // User ID
}
```

### 3.2 Database Design (Cloud Firestore)

#### 3.2.1 Collections
- users
- projects
- scores
- awards
- events
- notifications
- auditLogs

#### 3.2.2 Indexes
- projects: studentIds, teacherId, status, category, submittedAt
- scores: projectId, judgeId, submittedAt
- events: type, startDate
- notifications: userId, read, createdAt

#### 3.2.3 Data Validation and Security Rules
Implement Firestore security rules to ensure:
- Users can only read and write data they're authorized to access
- Data format and required fields are validated before writing
- Prevent unauthorized changes to critical fields (e.g., scores after submission)

Example security rule for projects:
```javascript
match /projects/{projectId} {
  allow read: if isAuthenticated() && (isProjectMember(projectId) || isJudgeOrAdmin());
  allow create: if isAuthenticated() && isStudent();
  allow update: if isAuthenticated() && (isProjectMember(projectId) || isAdmin());
  allow delete: if isAuthenticated() && isAdmin();
}
```

## 4. Component Design

### 4.1 React Component Hierarchy
```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   ├── UserMenu
│   └── LanguageSelector
├── Routes
│   ├── Dashboard
│   │   ├── ProjectSummary
│   │   ├── UpcomingEvents
│   │   └── Notifications
│   ├── ProjectSubmission
│   │   ├── ProjectForm
│   │   ├── DocumentUpload
│   │   └── SubmissionReview
│   ├── JudgingInterface
│   │   ├── ProjectList
│   │   ├── ProjectDetails
│   │   └── ScoringForm
│   ├── AdminPanel
│   │   ├── UserManagement
│   │   ├── ProjectManagement
│   │   ├── EventManagement
│   │   ├── AwardManagement
│   │   └── ReportGeneration
│   ├── Profile
│   │   ├── PersonalInfo
│   │   ├── ChangePassword
│   │   └── Preferences
│   └── PublicPages
│       ├── Home
│       ├── About
│       └── Contact
├── Footer
└── GlobalComponents
    ├── ErrorBoundary
    ├── LoadingSpinner
    ├── Notifications
    └── ConfirmationDialog
```

### 4.2 Key Components Description

#### 4.2.1 ProjectSubmission
- Handles project creation, editing, and submission
- Implements multi-step form for project details using Formik
- Manages document uploads to Cloud Storage with progress tracking
- Implements version control for uploaded documents
- Provides real-time validation and error handling
- Submits project data to Firestore and triggers review workflow

#### 4.2.2 JudgingInterface
- Displays list of projects assigned to judge with filtering and sorting options
- Implements detailed project view with all submitted documents
- Provides scoring form with real-time calculation and validation
- Allows saving draft scores and final submission
- Implements comment system for providing feedback
- Uses optimistic UI updates for a responsive experience

#### 4.2.3 AdminPanel
- Manages users, projects, events, and awards
- Implements bulk operations (e.g., assigning projects to judges, changing project statuses)
- Generates various reports using Cloud Functions
- Provides dashboard with key metrics and charts
- Implements audit logging for all administrative actions

#### 4.2.4 Dashboard
- Displays personalized information based on user role
- Shows project status and upcoming deadlines for students
- Provides judging progress and assigned projects for judges
- Displays overall fair statistics and action items for administrators

### 4.3 Reusable Components
- FormField: Wrapper for form inputs with consistent styling and error handling
- FileUpload: Component for handling file uploads with preview and progress
- Pagination: Reusable pagination component for lists
- SortableTable: Table component with sorting and filtering capabilities
- ConfirmationDialog: Reusable dialog for confirming user actions
- Notification: Component for displaying success/error messages

## 5. Interface Design

### 5.1 User Interfaces
[Include wireframes or mockups for key interfaces: Dashboard, Project Submission, Judging Interface, Admin Panel]

### 5.2 API Design (Cloud Functions)

#### 5.2.1 Authentication
- createUser(userData: UserData): Promise<string>
- updateUserRole(uid: string, newRole: UserRole): Promise<void>
- resetPassword(email: string): Promise<void>

#### 5.2.2 Projects
- submitProject(projectData: ProjectData): Promise<string>
- updateProjectStatus(projectId: string, newStatus: ProjectStatus): Promise<void>
- assignJudgesToProject(projectId: string, judgeIds: string[]): Promise<void>

#### 5.2.3 Scoring
- submitScore(scoreData: ScoreData): Promise<void>
- calculateFinalScores(projectId: string): Promise<void>
- getNormalizedScores(eventId: string): Promise<NormalizedScoreData[]>

#### 5.2.4 Awards
- assignAwards(eventId: string): Promise<void>
- generateAwardReport(eventId: string): Promise<string> // Returns URL to generated PDF

#### 5.2.5 Events
- createEvent(eventData: EventData): Promise<string>
- updateEventStatus(eventId: string, newStatus: EventStatus): Promise<void>

#### 5.2.6 Reporting
- generateParticipantReport(eventId: string): Promise<string> // Returns URL to generated PDF
- generateJudgingReport(eventId: string): Promise<string> // Returns URL to generated PDF

### 5.3 Error Handling
- Implement consistent error handling across all API calls
- Use custom error types for different categories of errors (e.g., ValidationError, AuthorizationError)
- Return meaningful error messages and codes to the client

## 6. Firebase Integration

### 6.1 Authentication
- Implement Firebase Authentication for user management
- Use custom claims for role-based access control
- Implement social login options (Google, Facebook) for easier registration
- Set up email templates for verification and password reset

### 6.2 Cloud Firestore
- Implement security rules to enforce data access patterns
- Use transactions for operations requiring atomic updates
- Implement data denormalization for frequently accessed data
- Set up Firestore indexes for complex queries

### 6.3 Cloud Storage
- Set up storage buckets for project documents and user profile pictures
- Implement security rules for file access based on user roles and project ownership
- Use signed URLs for secure, time-limited file access

### 6.4 Cloud Functions
- Implement serverless functions for complex operations and API endpoints
- Use triggers for automating workflows:
  - Notify judges when new projects are submitted
  - Update project status when all required scores are submitted
  - Generate and store PDF reports when requested
- Implement scheduled functions for recurring tasks (e.g., daily summary emails)

### 6.5 Firebase Hosting
- Configure hosting for serving the React SPA
- Set up caching rules for optimal performance
- Configure custom domain and SSL certificate

## 7. Security Considerations

### 7.1 Data Security
- Implement proper Firebase security rules for Firestore and Storage
- Use Firebase App Check to prevent unauthorized API access
- Encrypt sensitive data before storing in Firestore

### 7.2 Authentication and Authorization
- Implement proper authentication flows using Firebase Auth
- Use custom claims for role-based access control
- Implement JWT token verification for all API calls

### 7.3 Client-Side Security
- Implement input validation and sanitization on both client and server side
- Use environment variables for sensitive configuration (API keys, etc.)
- Implement Content Security Policy (CSP) headers

### 7.4 API Security
- Implement rate limiting for API calls to prevent abuse
- Use HTTPS for all communications
- Validate and sanitize all input data in Cloud Functions

## 8. Performance Considerations

### 8.1 Data Fetching and State Management
- Implement efficient querying patterns using Firestore
- Use React Query for managing server state and caching
- Implement pagination for large data sets
- Use Firestore's real-time capabilities judiciously to avoid unnecessary updates

### 8.2 Optimizations
- Implement code splitting and lazy loading for route components
- Use React.memo and useMemo for expensive computations
- Optimize images and assets:
  - Use WebP format for images
  - Implement lazy loading for images
  - Use appropriate image sizes for different devices
- Implement service workers for offline support and faster load times

### 8.3 Caching Strategy
- Implement a caching strategy using service workers
- Cache static assets (JS, CSS, images) for offline access
- Use Firestore persistence for offline data access

## 9. Testing Strategy

### 9.1 Unit Testing
- Use Jest for testing React components and utility functions
- Implement unit tests for all Cloud Functions
- Aim for at least 80% code coverage

### 9.2 Integration Testing
- Use React Testing Library for component integration tests
- Implement Firebase emulator suite for backend integration tests
- Test all major user flows and CRUD operations

## 10. Deployment and DevOps

### 10.1 CI/CD Pipeline
- Use GitHub Actions for continuous integration and deployment
- Implement the following workflow:
  1. Run linting and unit tests on every push and pull request
  2. Run integration tests on pull requests to main branch
  3. Build and deploy to staging environment on merge to main
  4. Run end-to-end tests on staging environment
  5. Deploy to production after manual approval

### 10.2 Environment Management
- Set up separate Firebase projects for development, staging, and production
- Use environment variables for configuration management
- Implement feature flags for gradual rollout of new features

### 10.3 Monitoring and Logging
- Use Firebase Performance Monitoring to track app performance
- Implement error logging using Firebase Crashlytics
- Set up custom logging in Cloud Functions for debugging and auditing
- Use Firebase Analytics for user behavior tracking
- Set up alerts for critical errors and performance issues

### 10.4 Backup and Disaster Recovery
- Implement daily automated backups of Firestore data
- Set up a disaster recovery plan with steps for data restoration
- Regularly test the backup and recovery process

## 11. Internationalization and Localization

### 11.1 Language Support
- Implement multi-language support using react-i18next
- Initially support English and Spanish
- Design the UI to accommodate text expansion in different languages

### 11.2 Content Management
- Store translatable content in separate JSON files
- Implement a process for updating and managing translations

### 11.3 Date and Number Formatting
- Use libraries like date-fns for locale-aware date formatting
- Implement number formatting based on locale

## 12. Documentation

### 12.1 User Documentation
- Create user manuals for different roles (students, teachers, judges, admins)
- Develop video tutorials for key features
- Implement an in-app help center with searchable FAQ

### 12.2 System Documentation
- Maintain this System Design Document with regular updates
- Document all Cloud Functions and their purposes

## 13. Legal and Compliance

### 13.1 Data Privacy
- Implement features to comply with GDPR and CCPA regulations
- Provide user data export and deletion capabilities
- Maintain a clear and accessible privacy policy

### 13.2 Terms of Service
- Develop and display terms of service for the platform
- Implement a user agreement acceptance process

## 14. Appendices

### 14.1 Technology Stack Details
- Frontend: React 18, Redux, Material-UI v5, React Router v6
- State Management: Redux Toolkit, React Query
- Form Handling: Formik, Yup
- Backend: Firebase (Authentication, Firestore, Storage, Functions, Hosting)
- Testing: Jest, React Testing Library, Cypress
- CI/CD: GitHub Actions
- Monitoring: Firebase Performance Monitoring, Crashlytics, Google Analytics

### 14.2 Third-party Libraries and Tools
- State Management: Redux Toolkit, React Query
- Form Handling: Formik, Yup
- Date/Time: date-fns
- Charts: recharts
- Internationalization: react-i18next
- PDF Generation: PDFKit
- Email Service: SendGrid

### 14.3 Coding Standards and Best Practices
- Follow Airbnb JavaScript Style Guide
- Use ESLint and Prettier for code formatting
- Implement proper error handling and logging
- Write clear and concise comments and documentation
- Follow React best practices (hooks, functional components)
