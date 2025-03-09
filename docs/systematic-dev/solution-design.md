# Solution Design

## Architecture Overview

The Agent Platform is built on a multi-tenant architecture with a Next.js frontend, PostgreSQL database, and containerized agent runtime. The system uses a subdomain-based approach for tenant isolation, with each tenant having their own subdomain.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Vercel Edge                           │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   Middleware    │───►│  Next.js Pages  │───►│  API Routes │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                         │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │   PostgreSQL    │◄──►│  Agent Runtime  │◄──►│ Third-Party │  │
│  │    Database     │    │   Containers    │    │    APIs     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Frontend
- **Next.js Application**: Server-rendered React application with app router
- **TailwindCSS**: Utility-first CSS framework for styling
- **NextAuth.js**: Authentication library for Next.js
- **React Query**: Data fetching and caching library
- **Framer Motion**: Animation library for React

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Vercel Edge Functions**: Edge-based middleware and functions
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **PostgreSQL**: Relational database with row-level security
- **Docker**: Containerization for agent runtime

### Infrastructure
- **Vercel**: Hosting for Next.js application and API routes
- **Neon**: Serverless PostgreSQL database
- **Kubernetes**: Container orchestration for agent runtime
- **GitHub Actions**: CI/CD pipeline

## Authentication System Testing

### Overview
The authentication system is a critical component of our platform, handling user authentication, session management, and authorization. A comprehensive testing strategy has been implemented to ensure the reliability and security of this system.

### Components Tested
1. **GitHub OAuth Profile Transformation**: Tests for the transformation of GitHub profiles into our application's user format.
2. **Session Management**: Tests for the `getSession` function that retrieves and validates user sessions.
3. **Authorization**: Tests for the `withSiteAuth` and `withPostAuth` middleware functions that protect routes.

### Testing Approach
#### Unit Testing
- **GitHub OAuth Profile**: Unit tests for the transformation of GitHub profiles, including handling of various email scenarios and error cases.
- **Auth Module**: Unit tests for the `getSession`, `withSiteAuth`, and `withPostAuth` functions, mocking NextAuth and database dependencies.

#### Integration Testing
- **NextAuth Configuration**: Integration tests for the NextAuth configuration, including session handling and cookie settings.
- **Authorization Flows**: Tests for the complete authorization flow, from session retrieval to route protection.

### Mocking Strategy
To isolate components for testing, we've implemented a comprehensive mocking strategy:
- **NextAuth**: Mocked to simulate authentication without requiring actual OAuth providers.
- **Database Queries**: Mocked to test database interactions without requiring a real database.

### Test Coverage
Our tests cover the following scenarios:
- **GitHub OAuth Profile Transformation**:
  - Successful transformation with primary email
  - Fallback to first email when no primary is marked
  - Using login as name when name is not provided
  - Generating fallback email when no emails are available
  - Handling errors during email retrieval

- **Session Management**:
  - Retrieving valid sessions
  - Handling missing or invalid sessions
  - Proper cookie settings for different environments

- **Authorization**:
  - Protecting routes based on user authentication
  - Validating site ownership for site-specific routes
  - Validating post ownership for post-specific routes
  - Handling unauthorized access attempts

### Implementation Results
- **Total Tests**: 27 tests implemented across unit and integration tests
- **Test Status**: All tests passing
- **Coverage**: High coverage of critical authentication paths

### Challenges and Solutions
- **Mocking NextAuth**: Implemented proper mocking order to ensure NextAuth's `getServerSession` function is correctly mocked.
- **Environment-Dependent Configurations**: Created tests that account for different behaviors in development, preview, and production environments.
- **API Call Mocking**: Used Vitest's mocking capabilities to simulate API calls to GitHub and other services.

### Future Improvements
- **End-to-End Testing**: Add end-to-end tests for complete user flows, including login and protected route access.
- **Performance Testing**: Implement tests for authentication performance under load.
- **Security Testing**: Add specific tests for security vulnerabilities in the authentication system.

### Module Registry

| Module | File Path | Description |
|--------|-----------|-------------|
| Authentication | `lib/auth.ts` | Core authentication module with NextAuth.js configuration, session management, and authorization functions |
| GitHub OAuth Profile | `lib/auth.ts` (profile function) | Transforms GitHub profile data into application user format |

## Module Registry

### Core Modules

#### AuthModule
- **Purpose**: Handle user authentication and authorization
- **Dependencies**: NextAuth.js, PostgreSQL
- **Status**: Planned
- **Related Tasks**: [TASK-002]
- **Last Updated**: 2023-07-01

#### DatabaseModule
- **Purpose**: Manage database connections and operations
- **Dependencies**: Drizzle ORM, PostgreSQL
- **Status**: Planned
- **Related Tasks**: [TASK-003]
- **Last Updated**: 2023-07-01

#### TenantModule
- **Purpose**: Manage multi-tenant functionality
- **Dependencies**: AuthModule, DatabaseModule
- **Status**: Planned
- **Related Tasks**: [TASK-014]
- **Last Updated**: 2023-07-01

### Frontend Modules

#### LandingPageModule
- **Purpose**: Display the public landing page
- **Dependencies**: React, Next.js, TailwindCSS
- **Status**: Planned
- **Related Tasks**: [TASK-004]
- **Last Updated**: 2023-07-01

#### AgentDirectoryModule
- **Purpose**: Display the agent directory
- **Dependencies**: React, Next.js, TailwindCSS
- **Status**: Planned
- **Related Tasks**: [TASK-005]
- **Last Updated**: 2023-07-01

#### AgentDetailsModule
- **Purpose**: Display agent details
- **Dependencies**: React, Next.js, TailwindCSS
- **Status**: Planned
- **Related Tasks**: [TASK-006]
- **Last Updated**: 2023-07-01

#### DashboardModule
- **Purpose**: Display the user dashboard
- **Dependencies**: React, Next.js, TailwindCSS, AuthModule
- **Status**: Planned
- **Related Tasks**: [TASK-007]
- **Last Updated**: 2023-07-01

#### AgentManagementModule
- **Purpose**: Manage agent creation and configuration
- **Dependencies**: React, Next.js, TailwindCSS, AuthModule
- **Status**: Planned
- **Related Tasks**: [TASK-008]
- **Last Updated**: 2023-07-01

### Backend Modules

#### AgentRuntimeModule
- **Purpose**: Run agent code in isolated containers
- **Dependencies**: Docker, Kubernetes
- **Status**: Planned
- **Related Tasks**: [TASK-009]
- **Last Updated**: 2023-07-01

#### APIConnectorModule
- **Purpose**: Connect agents to third-party services
- **Dependencies**: Node.js, TypeScript
- **Status**: Planned
- **Related Tasks**: [TASK-010]
- **Last Updated**: 2023-07-01

#### AnalyticsModule
- **Purpose**: Track agent performance and usage
- **Dependencies**: Google Analytics, Langfuse
- **Status**: Planned
- **Related Tasks**: [TASK-011]
- **Last Updated**: 2023-07-01

#### BillingModule
- **Purpose**: Manage payments and subscriptions
- **Dependencies**: Stripe, DatabaseModule
- **Status**: Planned
- **Related Tasks**: [TASK-012]
- **Last Updated**: 2023-07-01

#### MarketplaceModule
- **Purpose**: Facilitate agent publishing and monetization
- **Dependencies**: DatabaseModule, BillingModule
- **Status**: Planned
- **Related Tasks**: [TASK-013]
- **Last Updated**: 2023-07-01

### Integration Modules

#### GitHubActionsModule
- **Purpose**: Automate CI/CD pipeline
- **Dependencies**: GitHub Actions
- **Status**: Planned
- **Related Tasks**: [TASK-015]
- **Last Updated**: 2023-07-01

### Authentication Module

- **File**: `lib/auth.ts`
- **Purpose**: Handles authentication and authorization
- **Exports**:
  - `authOptions`: Configuration for NextAuth.js
  - `getSession`: Function to retrieve the current user session
  - `withSiteAuth`: Higher-order function for protecting site-specific resources
  - `withPostAuth`: Higher-order function for protecting post-specific resources

### GitHub OAuth Profile Transformation

- **File**: `lib/auth.ts` (part of the authentication module)
- **Purpose**: Transforms GitHub profile data into our application's user format
- **Functionality**:
  - Selects the primary email from the user's GitHub emails
  - Falls back to the first email if no primary email is marked
  - Generates a fallback email if no emails are available
  - Handles error cases gracefully

## Implementation Details

### Multi-tenant Architecture

- **Tenant Identification**:
  - **Purpose**: Identify tenants based on subdomain
  - **Design**: Middleware checks the hostname and extracts the tenant identifier
  - **Implementation Notes**: Use Next.js middleware to parse the hostname and set tenant context
  - **Related Tasks**: [TASK-014]

- **Data Isolation**:
  - **Purpose**: Ensure tenant data is isolated
  - **Design**: Use row-level security in PostgreSQL with tenant_id column
  - **Implementation Notes**: Add tenant_id to all tables and create policies
  - **Related Tasks**: [TASK-003]

- **Authentication**:
  - **Purpose**: Authenticate users and associate them with tenants
  - **Design**: Use NextAuth.js with custom session handling
  - **Implementation Notes**: Store tenant_id in session and validate on requests
  - **Related Tasks**: [TASK-002]

### Agent System

- **Agent Container**:
  - **Purpose**: Run agent code in isolated environment
  - **Design**: Docker containers with defined resource limits
  - **Implementation Notes**: Create base image with common dependencies
  - **Related Tasks**: [TASK-009]

- **Agent Configuration**:
  - **Purpose**: Configure agent behavior
  - **Design**: JSON schema for agent configuration
  - **Implementation Notes**: Validate configuration against schema
  - **Related Tasks**: [TASK-008]

- **Agent Monitoring**:
  - **Purpose**: Track agent performance and resource usage
  - **Design**: Collect metrics and logs from containers
  - **Implementation Notes**: Use Prometheus and Grafana for monitoring
  - **Related Tasks**: [TASK-011]

### Integration Framework

- **API Connector Interface**:
  - **Purpose**: Define standard interface for API connectors
  - **Design**: TypeScript interface with common methods
  - **Implementation Notes**: Create base class for connectors
  - **Related Tasks**: [TASK-010]

- **Credential Management**:
  - **Purpose**: Securely store and manage API credentials
  - **Design**: Encrypted storage with access control
  - **Implementation Notes**: Use environment variables and secure storage
  - **Related Tasks**: [TASK-010]

- **Webhook Support**:
  - **Purpose**: Handle incoming webhooks from external services
  - **Design**: Webhook endpoints with verification
  - **Implementation Notes**: Create dynamic webhook routes
  - **Related Tasks**: [TASK-010]

### User Interface

- **Landing Page**:
  - **Purpose**: Introduce the platform and showcase featured agents
  - **Design**: Hero section, feature highlights, and call-to-action
  - **Implementation Notes**: Responsive design with animations
  - **Related Tasks**: [TASK-004]

- **Agent Directory**:
  - **Purpose**: Display available agents with search and filtering
  - **Design**: Grid or list view with search and filter controls
  - **Implementation Notes**: Implement pagination and lazy loading
  - **Related Tasks**: [TASK-005]

- **Agent Details**:
  - **Purpose**: Show detailed information about an agent
  - **Design**: Tabs for different sections of information
  - **Implementation Notes**: Include usage examples and documentation
  - **Related Tasks**: [TASK-006]

- **User Dashboard**:
  - **Purpose**: Provide overview of user's agents and usage
  - **Design**: Dashboard with cards for different metrics
  - **Implementation Notes**: Use charts for data visualization
  - **Related Tasks**: [TASK-007]

- **Agent Management**:
  - **Purpose**: Interface for creating and managing agents
  - **Design**: Multi-step form for agent creation and configuration
  - **Implementation Notes**: Implement validation and preview
  - **Related Tasks**: [TASK-008]

### Database Schema

- **Users Table**:
  - **Purpose**: Store user information
  - **Design**: Standard user fields with authentication provider data
  - **Implementation Notes**: Use NextAuth.js schema as base
  - **Related Tasks**: [TASK-003]

- **Tenants Table**:
  - **Purpose**: Store tenant information
  - **Design**: Tenant name, subdomain, settings, and status
  - **Implementation Notes**: Include tenant-specific configuration
  - **Related Tasks**: [TASK-003]

- **Agents Table**:
  - **Purpose**: Store agent information
  - **Design**: Agent name, description, configuration, and status
  - **Implementation Notes**: Include version control for configurations
  - **Related Tasks**: [TASK-003]

- **Integrations Table**:
  - **Purpose**: Store integration configurations
  - **Design**: Integration type, configuration, and credentials reference
  - **Implementation Notes**: Encrypt sensitive information
  - **Related Tasks**: [TASK-003]

- **Usage Table**:
  - **Purpose**: Track agent usage
  - **Design**: Agent ID, timestamp, duration, and resource usage
  - **Implementation Notes**: Implement aggregation for reporting
  - **Related Tasks**: [TASK-003]

### API Endpoints

- **Authentication API**:
  - **Purpose**: Handle user authentication
  - **Design**: NextAuth.js API routes
  - **Implementation Notes**: Customize for tenant-specific authentication
  - **Related Tasks**: [TASK-002]

- **Agents API**:
  - **Purpose**: CRUD operations for agents
  - **Design**: RESTful API with proper validation
  - **Implementation Notes**: Implement pagination and filtering
  - **Related Tasks**: [TASK-008]

- **Integrations API**:
  - **Purpose**: Manage third-party integrations
  - **Design**: RESTful API with secure credential handling
  - **Implementation Notes**: Implement OAuth flow for supported services
  - **Related Tasks**: [TASK-010]

- **Usage API**:
  - **Purpose**: Retrieve usage statistics
  - **Design**: RESTful API with aggregation options
  - **Implementation Notes**: Implement caching for performance
  - **Related Tasks**: [TASK-011]

### Deployment Strategy

- **Frontend Deployment**:
  - **Purpose**: Deploy Next.js application
  - **Design**: Vercel deployment with preview environments
  - **Implementation Notes**: Configure environment variables per environment
  - **Related Tasks**: [TASK-015]

- **Database Deployment**:
  - **Purpose**: Deploy PostgreSQL database
  - **Design**: Neon serverless PostgreSQL
  - **Implementation Notes**: Set up connection pooling
  - **Related Tasks**: [TASK-003]

- **Agent Runtime Deployment**:
  - **Purpose**: Deploy agent containers
  - **Design**: Kubernetes cluster with auto-scaling
  - **Implementation Notes**: Implement resource limits and monitoring
  - **Related Tasks**: [TASK-009]

### Design for [TASK-016]: Update homepage with systematic development workflow information

#### Overview

We will enhance the homepage to include information about the systematic development workflow used in the project. This will involve adding a new section to the existing homepage that explains the workflow, displays a visualization of it, highlights its benefits, and provides links to relevant documentation.

#### Component Structure

1. **Systematic Development Section**
   - Will be added after the "AI Development Enhancements" section
   - Will include a heading, description, and feature cards

2. **Workflow Visualization Component**
   - A simplified ASCII art representation of the workflow diagram
   - Will be displayed in a styled pre/code block for proper formatting
   - Will be responsive and adapt to different screen sizes

3. **Benefits Cards**
   - Cards highlighting key benefits of the systematic development approach
   - Will follow the existing card design pattern with a unique color scheme

4. **Documentation Links**
   - Links to relevant documentation about the systematic development approach
   - Will be styled as buttons or cards depending on the number of links

#### UI Design

The new section will follow the existing design patterns of the homepage:
- Dark background with a slight gradient
- Card-based layout for features and benefits
- Consistent typography with the rest of the site
- Responsive design that works on mobile and desktop

For the systematic development section, we'll use a teal/cyan color scheme to differentiate it from the existing sections (which use purple, emerald, and rose).

#### Content

1. **Section Heading**: "Systematic Development Workflow"

2. **Section Description**: "A structured approach to AI-driven development with minimal human intervention"

3. **Feature Cards**:
   - **Workflow Automation**: "Self-sustaining development process with clear steps and transitions"
   - **Quality Gates**: "Built-in quality checks at each stage of development"
   - **Error Recovery**: "Robust error handling and recovery mechanisms"
   - **Documentation Integration**: "Seamless integration with project documentation"

4. **Workflow Visualization**: A simplified version of the workflow diagram showing the main workflows and their relationships

5. **Documentation Links**:
   - Link to the systematic development README
   - Link to the workflow documentation
   - Link to the project description

#### Implementation Approach

1. Modify `app/home/page.tsx` to add the new section
2. Follow the existing pattern of sections with a heading, description, and cards
3. Create a simplified ASCII art representation of the workflow diagram
4. Ensure the section is responsive and works on all screen sizes
5. Add links to relevant documentation

#### Technical Considerations

1. **Responsiveness**: The ASCII art visualization may need adjustments for different screen sizes
2. **Accessibility**: Ensure the visualization has proper alt text and the section meets accessibility standards
3. **Performance**: Keep the changes lightweight to maintain fast page load times

#### Testing Strategy

1. **Visual Testing**: Verify the section looks good on different screen sizes
2. **Accessibility Testing**: Check that the section meets accessibility standards
3. **Link Testing**: Verify all documentation links work correctly

## Implementation Details

The implementation will involve modifying the `app/home/page.tsx` file to add the new section. We'll follow the existing pattern of sections with a heading, description, and cards.

```tsx
{/* Systematic Development Workflow Section */}
<div className="relative z-10 border-t border-white/20 px-4 py-16 text-center bg-black/30 backdrop-blur-md">
  <div className="mx-auto max-w-5xl">
    <h2 className="font-cal text-3xl font-bold text-cyan-300 mb-2">
      Systematic Development Workflow
    </h2>
    <p className="text-white/60 mb-8 max-w-2xl mx-auto">
      A structured approach to AI-driven development with minimal human intervention
    </p>
    
    {/* Workflow Visualization */}
    <div className="mb-10 overflow-auto">
      <pre className="text-xs md:text-sm bg-black/50 p-4 rounded-lg border border-cyan-500/30 text-cyan-100 overflow-auto mx-auto max-w-3xl text-left">
        {`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Workflow       │     │  Development    │     │  Bug Resolution │
│  Decision       │────►│  Workflow       │     │  Workflow       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Documentation  │◄─────────────┘
                        │  Workflow       │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Error Recovery │
                        │  Workflow       │
                        └─────────────────┘`}
      </pre>
    </div>
    
    {/* Feature Cards */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 p-6 backdrop-blur-sm transition-all hover:bg-cyan-900/30 hover:shadow-lg">
        <h3 className="font-cal text-xl text-cyan-300 mb-2">Workflow Automation</h3>
        <p className="text-stone-300">
          Self-sustaining development process with clear steps and transitions
        </p>
      </div>
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 p-6 backdrop-blur-sm transition-all hover:bg-cyan-900/30 hover:shadow-lg">
        <h3 className="font-cal text-xl text-cyan-300 mb-2">Quality Gates</h3>
        <p className="text-stone-300">
          Built-in quality checks at each stage of development
        </p>
      </div>
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 p-6 backdrop-blur-sm transition-all hover:bg-cyan-900/30 hover:shadow-lg">
        <h3 className="font-cal text-xl text-cyan-300 mb-2">Error Recovery</h3>
        <p className="text-stone-300">
          Robust error handling and recovery mechanisms
        </p>
      </div>
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/20 p-6 backdrop-blur-sm transition-all hover:bg-cyan-900/30 hover:shadow-lg">
        <h3 className="font-cal text-xl text-cyan-300 mb-2">Documentation Integration</h3>
        <p className="text-stone-300">
          Seamless integration with project documentation
        </p>
      </div>
    </div>
    
    {/* Documentation Links */}
    <div className="mt-10">
      <h3 className="font-cal text-2xl text-white mb-4">Learn More</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-cyan-500/30 bg-cyan-900/20 px-6 py-3 font-cal text-cyan-300 transition-all hover:bg-cyan-900/30 hover:shadow-lg"
        >
          Framework Overview
        </a>
        <a
          href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/workflow.md"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-cyan-500/30 bg-cyan-900/20 px-6 py-3 font-cal text-cyan-300 transition-all hover:bg-cyan-900/30 hover:shadow-lg"
        >
          Workflow Documentation
        </a>
        <a
          href="https://github.com/derekg1729/agent-platform/blob/main/docs/systematic-dev/project-description.md"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-cyan-500/30 bg-cyan-900/20 px-6 py-3 font-cal text-cyan-300 transition-all hover:bg-cyan-900/30 hover:shadow-lg"
        >
          Project Description
        </a>
      </div>
    </div>
  </div>
</div>
```

This implementation follows the existing design patterns of the homepage while adding a new section specifically for the systematic development workflow. The section includes a heading, description, workflow visualization, feature cards, and documentation links. 