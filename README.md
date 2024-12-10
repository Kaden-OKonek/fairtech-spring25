# Southern MN Science Fair Platform

## Project Overview
This web platform manages the Southern MN Science and Engineering Fair, handling paperwork, registration, judging, and reporting for events hosting several hundred students annually.

## Features
- User registration and management (students, teachers, judges, administrators, volunteers)
- Project submission and management
- Document handling and review processes
- Judge assignment and scoring system
- Automated award determination and reporting

## Technology Stack
- Frontend: React 18 with TypeScript
- UI Library: Material-UI (MUI)
- State Management: Redux Toolkit
- Backend: Firebase (Authentication, Firestore, Storage, Functions, Hosting)
- Additional Libraries: Formik, Yup, React Query, date-fns, recharts

## Prerequisites
- Node.js (v20 or later)
- npm (v10 or later)
- Git
- Firebase CLI

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/FairTechFall24/science-fair-platform
   cd science-fair-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - cd into the functions directory and run npm install there as well.

6. Start the development server:
   ```
   npm start
   ```

## Folder Structure
```
src/
├── components/  # Reusable React components
├── pages/       # Page components
├── services/    # API and external service integrations
├── hooks/       # Custom React hooks
├── utils/       # Utility functions
├── store/       # Redux store and slices
├── types/       # TypeScript type definitions
└── assets/      # Static assets (images, fonts, etc.)
```

## Available Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (one-way operation)

## Recommended

- Install Prettier and Eslint extensions on Visual Studio Code.

## Deployment
1. Build the project: `npm run build`
2. Deploy to Firebase Hosting: `firebase deploy`
