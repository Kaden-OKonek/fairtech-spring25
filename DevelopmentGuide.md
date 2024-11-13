# Science Fair Platform Development Guide

## Table of Contents

- [Project Architecture Overview](#project-architecture-overview)
- [Directory Structure](#directory-structure)
- [Core Systems](#core-systems)
- [Key Patterns & Conventions](#key-patterns--conventions)
- [Firebase Integration](#firebase-integration)
- [Component Architecture](#component-architecture)
- [Development Guidelines](#development-guidelines)
- [Testing Strategy](#testing-strategy)

## Project Architecture Overview

The Science Fair Platform is built using React with TypeScript, following a component-based architecture with clear separation of concerns. The application uses Firebase for backend services and follows a role-based access control system.

### Key Architectural Principles

1. **Separation of Concerns**: Logic is separated into distinct layers:

   - Components (UI/presentation)
   - Services (business logic/data access)
   - Contexts (state management)
   - Types (type definitions)
   - Config (configuration)

2. **Role-Based Architecture**: The application supports multiple user types:

   - Students
   - Teachers
   - Judges
   - Volunteers
   - Administrators
   - Super Administrators

3. **Security-First Design**: Authentication and authorization are enforced at multiple levels:
   - Route level (AccessGuard)
   - Component level (conditional rendering)
   - Service level (Firebase rules)

## Directory Structure

```
src/
├── assets/          # Static assets like images
├── components/      # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── admin-dashboard/    # Admin-specific components
│   ├── student-dashboard/  # Student-specific components
│   └── ...
├── contexts/        # React contexts for state management
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and helpers
├── pages/          # Top-level page components
├── services/       # Business logic and API interactions
├── theme/          # Theme configuration
└── types/          # TypeScript type definitions
```

### Key Directories Explained

- **components/**: Contains all React components, organized by feature area

  - Components should be modular and reusable where possible
  - Each dashboard type has its own directory for specific components

- **contexts/**: Contains React context providers

  - Used for state management across components
  - Example: AuthContext manages authentication state

- **services/**: Contains business logic and API interactions

  - Each service file focuses on a specific domain (users, forms, etc.)
  - Services handle all Firebase interactions

- **types/**: Contains TypeScript type definitions
  - Shared interfaces and types
  - Organized by domain area

## Core Systems

### Authentication Flow

1. **User States**: The application defines five distinct user states:

   ```typescript
   enum UserState {
     UNAUTHENTICATED,
     UNVERIFIED, // Authenticated but email not verified
     UNREGISTERED, // Verified but hasn't selected user type
     INCOMPLETE, // Selected type but hasn't completed registration
     COMPLETE, // Fully registered user
   }
   ```

2. **Route Protection**:
   - `AccessGuard` component wraps all routes
   - Checks user state and role against route requirements
   - Redirects to appropriate page based on user state

### Routing System

1. **Configuration-Based Routing**:

   - Routes are defined in `routes.config.ts`
   - Each route specifies required state and allowed roles

   ```typescript
   {
     '/student-dashboard': {
       requiredState: UserState.COMPLETE,
       allowedRoles: ['student'],
       fallbackRoute: '/login'
     }
   }
   ```

2. **Access Control**:
   - `AccessGuard` component enforces route access rules
   - Handles redirection based on user state
   - Prevents unauthorized access to protected routes

## Key Patterns & Conventions

### Services (.service.ts)

Services handle business logic and data access. They should:

- Be focused on a specific domain
- Handle all Firebase interactions
- Return typed responses
- Handle error cases

Example service pattern:

```typescript
export const usersService = {
  // Subscribe to real-time updates
  subscribeToUsers(callback: (users: User[]) => void) {
    // Implementation
  },

  // Get data
  async getUsersByRole(role: UserRole): Promise<User[]> {
    // Implementation
  },

  // Update data
  async updateUserStatus(userId: string, status: string) {
    // Implementation
  },
};
```

### Type Definitions (.types.ts)

Type files define interfaces and types for a specific domain. They should:

- Be focused on a specific domain area
- Export reusable types
- Include type guards when necessary
- Use clear naming conventions

Example type pattern:

```typescript
export interface BaseProfile {
  firstName: string;
  lastName: string;
  // ... common fields
}

export interface StudentProfile extends BaseProfile {
  userType: 'student';
  school: string;
  grade: number;
}

// Type guard
export const isStudentProfile = (
  profile: UserProfile
): profile is StudentProfile => {
  return profile.userType === 'student';
};
```

### Configuration Files (.config.ts)

Configuration files centralize application settings. They should:

- Be environment-aware
- Use TypeScript for type safety
- Be well-documented
- Be easily modifiable

Example config pattern:

```typescript
export const routeConfig: RouteConfigMap = {
  '/': {
    requiredState: UserState.UNAUTHENTICATED,
    fallbackRoute: '/user-type-selection',
    metadata: {
      title: 'Welcome',
    },
  },
  // ... more routes
};
```

## Firebase Integration

### Firebase Services

The application uses several Firebase services:

- Authentication
- Firestore (database)
- Storage (file storage)
- Cloud Functions

### Firebase Best Practices

1. **Security Rules**: Always implement proper security rules in Firebase
2. **Batch Operations**: Use batch writes for multiple operations
3. **Real-time Updates**: Use snapshots for real-time data
4. **Error Handling**: Always handle Firebase errors appropriately

Example Firebase pattern:

```typescript
// Good pattern for real-time updates
const unsubscribe = onSnapshot(
  query,
  (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data);
  },
  (error) => {
    console.error('Error fetching data:', error);
  }
);
```

## Component Architecture

### Dashboard Components

Dashboards follow a consistent pattern:

1. **Sidebar**: Navigation and user info
2. **Main Content**: Dynamic content area
3. **Common Elements**: Headers, footers, etc.

Example dashboard structure:

```tsx
const StudentDashboard: React.FC = () => {
  const [activeContent, setActiveContent] = useState<ContentType>('projects');

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
      />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};
```

### Component Guidelines

1. **Separation of Concerns**:

   - Components should be focused and single-purpose
   - Business logic should be in services
   - State management should use contexts when needed

2. **Props and Types**:

   - All props should be typed
   - Use interface for prop types
   - Document complex props

3. **State Management**:
   - Local state for UI-only state
   - Context for shared state
   - Services for data operations

## Testing Strategy

### Test Structure

1. **Unit Tests**:

   - Test individual components
   - Test utilities and helpers
   - Test service functions

2. **Integration Tests**:

   - Test component interactions
   - Test routing flows
   - Test context providers

3. **Mock Patterns**:
   - Mock Firebase services
   - Mock context values
   - Mock service responses

Example test pattern:

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('should render correctly', () => {
    // Test
  });

  it('should handle user interaction', async () => {
    // Test
  });
});
```
