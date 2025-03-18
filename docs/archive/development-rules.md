# Development Rules

## Coding Standards

1. **TypeScript**: All code must be written in TypeScript with strict type checking enabled.
2. **ESLint**: Code must pass all ESLint checks with the project's configuration.
3. **Prettier**: Code must be formatted according to the project's Prettier configuration.
4. **Component Structure**: React components should follow the project's component structure:
   - Functional components with hooks
   - Props interface defined above the component
   - Export default at the component definition
5. **File Naming**: Use kebab-case for file names and PascalCase for component names.
6. **Imports**: Group imports in the following order:
   - React and Next.js imports
   - Third-party library imports
   - Project imports (components, utils, etc.)
   - Type imports
7. **Error Handling**: All async operations must have proper error handling.
8. **Comments**: Complex logic must be documented with comments.
9. **Testing**: All new features must have corresponding tests.
10. **Accessibility**: Components must be accessible according to WCAG 2.1 AA standards.

## Workflow Steps

1. Read the project description to understand the context
2. Review the development rules
3. Check the backlog for the highest priority task
4. Update the change log to indicate work has started
5. Design a solution for the task
6. Implement the solution
7. Verify the implementation
8. Update the task status to "Done"
9. Update the change log with completion details
10. Return to step 3

## Quality Requirements

- **Test Coverage**: Minimum 80% test coverage for new code
- **Performance**: Pages must load in under 2 seconds
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: No critical or high severity vulnerabilities
- **Maintainability**: Code complexity below 15 per function
- **Documentation**: All public APIs and components must be documented
- **Responsiveness**: UI must work on devices from 320px to 1920px width
- **Browser Compatibility**: Support latest 2 versions of major browsers

## Architecture Guidelines

- **Component Isolation**: Components should be isolated and reusable
- **State Management**: Use React hooks for local state, context for shared state
- **API Design**: Follow RESTful principles for API design
- **Database Access**: Use Drizzle ORM for database access
- **Authentication**: Use NextAuth.js for authentication
- **Error Boundaries**: Implement error boundaries for component failures
- **Performance Optimization**: Implement code splitting and lazy loading
- **Security**: Follow OWASP top 10 security guidelines

## Multi-tenant Guidelines

- **Data Isolation**: Ensure complete isolation of tenant data
- **URL Structure**: Use subdomain-based tenant identification
- **Authentication**: Implement tenant-specific authentication
- **Authorization**: Implement row-level security for data access
- **Customization**: Support tenant-specific customization
- **Analytics**: Track metrics per tenant

## Error Handling

- **Client-Side Errors**: Capture and display user-friendly error messages
- **Server-Side Errors**: Log detailed error information and return appropriate status codes
- **API Errors**: Return consistent error responses with status codes and messages
- **Database Errors**: Handle database errors gracefully and maintain data integrity
- **Third-Party Service Errors**: Implement retry logic and fallback mechanisms
- **Monitoring**: Set up error monitoring and alerting

## Git Workflow

- **Branch Naming**: Use `feature/`, `bugfix/`, `hotfix/`, or `chore/` prefixes
- **Commit Messages**: Follow conventional commit format
- **Pull Requests**: Create pull requests for all changes
- **Code Review**: All pull requests must be reviewed by at least one team member
- **CI/CD**: All checks must pass before merging
- **Main Branch**: Keep the main branch always deployable

## Documentation Requirements

- **Code Documentation**: Document complex logic and public APIs
- **Component Documentation**: Document component props and usage
- **API Documentation**: Document API endpoints, request/response formats
- **Architecture Documentation**: Keep architecture diagrams up to date
- **Setup Documentation**: Maintain clear setup and installation instructions
- **User Documentation**: Create user guides for platform features

## Performance Guidelines

- **Bundle Size**: Keep bundle size under 200KB (initial load)
- **API Response Time**: API endpoints should respond in under 200ms
- **Database Queries**: Optimize database queries for performance
- **Caching**: Implement appropriate caching strategies
- **Image Optimization**: Use Next.js image optimization
- **Lazy Loading**: Implement lazy loading for off-screen content
- **Code Splitting**: Use dynamic imports for code splitting

## Security Guidelines

- **Authentication**: Implement secure authentication with NextAuth.js
- **Authorization**: Implement proper authorization checks
- **Data Validation**: Validate all user inputs
- **API Security**: Implement rate limiting and CSRF protection
- **Secrets Management**: Store secrets securely in environment variables
- **Dependency Security**: Regularly update dependencies and scan for vulnerabilities
- **Content Security**: Implement Content Security Policy
- **HTTPS**: Enforce HTTPS for all connections 