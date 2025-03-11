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

#### AgentDetailsModule
- **Purpose**: Display agent details
- **Dependencies**: React, Next.js, TailwindCSS
- **Status**: Planned
- **Related Tasks**: [TASK-006]

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

## Agent Platform Database Schema

### Overview
The agent platform database schema is implemented using Drizzle ORM with PostgreSQL. The schema includes tables for agents, API connections, agent messages, and agent feedback, with row-level security implemented for all agent-related tables.

### Schema Structure

#### Agent Table
The agent table stores information about agents created by users:
- `id`: Unique identifier for the agent (CUID)
- `userId`: Foreign key to the user who owns the agent
- `name`: Name of the agent
- `description`: Description of the agent
- `model`: The AI model used by the agent
- `temperature`: Temperature setting for the agent
- `maxTokens`: Maximum tokens for the agent
- `createdAt`: Timestamp when the agent was created
- `updatedAt`: Timestamp when the agent was last updated

#### API Connection Table
The API connection table stores information about API connections created by users:
- `id`: Unique identifier for the API connection (CUID)
- `userId`: Foreign key to the user who owns the API connection
- `name`: Name of the API connection
- `provider`: The API provider (e.g., OpenAI, Anthropic)
- `apiKey`: Encrypted API key
- `createdAt`: Timestamp when the API connection was created
- `updatedAt`: Timestamp when the API connection was last updated

#### Agent-API Connection Table
The agent-API connection table stores the relationship between agents and API connections:
- `id`: Unique identifier for the agent-API connection (CUID)
- `agentId`: Foreign key to the agent
- `apiConnectionId`: Foreign key to the API connection
- `createdAt`: Timestamp when the relationship was created

#### Agent Message Table
The agent message table stores messages exchanged with agents:
- `id`: Unique identifier for the message (CUID)
- `agentId`: Foreign key to the agent
- `userId`: Foreign key to the user who sent/received the message
- `role`: Role of the message sender (user, assistant, system)
- `content`: Content of the message
- `createdAt`: Timestamp when the message was created

#### Agent Feedback Table
The agent feedback table stores feedback on agent messages:
- `id`: Unique identifier for the feedback (CUID)
- `messageId`: Foreign key to the agent message
- `userId`: Foreign key to the user who provided the feedback
- `rating`: Rating given to the message
- `comment`: Optional comment on the message
- `createdAt`: Timestamp when the feedback was created

### Row-Level Security
Row-level security is implemented for all agent-related tables to ensure that users can only access their own data. This is achieved through the following mechanisms:

1. **Database Policies**: PostgreSQL row-level security policies are defined for each table to restrict access based on the user ID.
2. **Middleware**: A custom middleware (`withRLS`) is implemented to set the current user ID for database operations.
3. **Integration with Next.js**: The middleware is integrated with Next.js to automatically set the user ID for all database operations.

### Testing
The database schema and middleware are thoroughly tested with:

1. **Unit Tests**: Tests for the database middleware to ensure it correctly sets the user ID for database operations.
2. **Integration Tests**: Tests for the agent schema to verify the structure and relationships between tables.
3. **RLS Tests**: Tests for row-level security policies to ensure they correctly restrict access to data.

### API Key Management
API keys are securely stored in the database using encryption. The following utilities are implemented:

1. **Encryption**: API keys are encrypted before being stored in the database.
2. **Decryption**: API keys are decrypted when needed for API calls.
3. **Access Control**: Only the owner of an API connection can access the API key.

#### API Key Management Enhancement Plan

To enhance the API Key Management system, we will implement the following components:

1. **API Routes**:
   - `POST /api/api-connections`: Create a new API connection
   - `GET /api/api-connections`: List all API connections for the current user
   - `GET /api/api-connections/:id`: Get details of a specific API connection
   - `PUT /api/api-connections/:id`: Update an existing API connection
   - `DELETE /api/api-connections/:id`: Delete an API connection
   - `GET /api/api-connections/services`: Get a list of supported services
   - `GET /api/agents/:id/api-connections`: Get all API connections for a specific agent

2. **Frontend Components**:
   - API Connection Form: For creating and editing API connections
   - API Connection List: For displaying and managing API connections
   - API Connection Selector: For associating API connections with agents

3. **Security Enhancements**:
   - Implement rate limiting for API key management endpoints
   - Add validation for API key formats based on service
   - Implement audit logging for API key operations
   - Add support for OAuth-based API connections where applicable

4. **Testing Strategy**:
   - Unit tests for API key utilities
   - Integration tests for API routes
   - End-to-end tests for API key management workflow
   - Security tests for encryption and access control

5. **Implementation Phases**:
   - Phase 1: Implement API routes for CRUD operations
   - Phase 2: Develop frontend components for API key management
   - Phase 3: Enhance security features
   - Phase 4: Implement comprehensive testing

This enhancement will build upon the existing encryption utilities and database functions to create a complete API key management system that is secure, user-friendly, and well-tested.

### Database Operations
Database operations are performed using Drizzle ORM, which provides a type-safe way to interact with the database. The following operations are supported:

1. **Create**: Insert new records into the database.
2. **Read**: Query records from the database with filtering and sorting.
3. **Update**: Update existing records in the database.
4. **Delete**: Remove records from the database.

All operations are performed with row-level security to ensure data isolation between tenants.

## Implementation Plan for [TASK-HW019] Replace Mocked Agents with Database Integration

### Overview

Currently, the Agents Page displays mocked, hardcoded agents rather than fetching real agents from the database. This implementation plan outlines the steps needed to replace these mocked agents with real database integration.

### Architecture

The implementation will follow the Next.js App Router architecture with proper separation of server and client components:

1. **Server Component (page.tsx)**: Will handle metadata and render the client component
2. **Client Component (AgentsPageClient.tsx)**: Will handle state management and data fetching
3. **API Route (/api/agents)**: Will handle database queries and return agent data

### Database Schema

We'll use the existing agent schema defined in the Drizzle ORM setup:

```typescript
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    systemPrompt: text("system_prompt").notNull(),
    model: text("model").default("gpt-3.5-turbo"),
    temperature: numeric("temperature").default("0.7"),
    maxTokens: integer("max_tokens").default(2000),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    imageUrl: text("image_url"),
    status: text("status").default("active"),
    type: text("type").default("chat"),
    userId: text("user_id").notNull(),
    tenantId: text("tenant_id").notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("agents_user_id_idx").on(table.userId),
      tenantIdIdx: index("agents_tenant_id_idx").on(table.tenantId),
      nameIdx: index("agents_name_idx").on(table.name),
    };
  }
);
```

### Implementation Steps

#### 1. Update API Route

Ensure the `/api/agents` API route is properly implemented to:
- Fetch agents from the database
- Apply proper tenant isolation using row-level security
- Handle errors gracefully
- Return properly formatted agent data

#### 2. Update AgentsPageClient Component

Modify the `AgentsPageClient.tsx` component to:
- Remove hardcoded mock data
- Implement proper data fetching using `useEffect` and `fetch`
- Add loading state management
- Implement error handling
- Update the UI to display real agents

```typescript
// Current implementation with mocked data
const [agents, setAgents] = useState<Agent[]>(initialAgents);
const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
const [error, setError] = useState<string | null>(initialError);

useEffect(() => {
  if (testMode) return;
  
  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error(`Error fetching agents: ${response.statusText}`);
      }
      const data = await response.json();
      setAgents(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  fetchAgents();
}, [testMode]);
```

#### 3. Update Tests

Update the tests to use Mock Service Worker (MSW) for mocking API responses:
- Create MSW handlers for the `/api/agents` endpoint
- Test different scenarios (success, empty, error)
- Ensure tests are isolated and don't depend on actual API calls

#### 4. Add Empty State

Ensure the UI properly displays an empty state when no agents are returned from the API:
- Create an empty state component
- Display it when `agents.length === 0 && !isLoading`
- Add a call-to-action to create a new agent

#### 5. Add Loading State

Enhance the loading state to provide a better user experience:
- Use skeleton loaders instead of a simple spinner
- Ensure loading state is visually consistent with the loaded content

### Testing Strategy

1. **Unit Tests**:
   - Test the AgentsPageClient component in isolation
   - Mock the fetch API to return different responses
   - Verify the component renders correctly in different states

2. **Integration Tests**:
   - Test the integration between the component and the API
   - Use MSW to mock API responses
   - Verify the end-to-end flow works correctly

3. **E2E Tests**:
   - Test the complete flow from loading the page to displaying agents
   - Verify navigation and interactions work correctly

### Acceptance Criteria Verification

1. **Update AgentsPageClient to fetch real agents**:
   - Implement fetch in useEffect
   - Remove hardcoded mock data

2. **Implement proper error handling**:
   - Add try/catch block
   - Display error messages to the user
   - Log errors for debugging

3. **Add loading states**:
   - Implement skeleton loaders
   - Ensure loading state is visually consistent

4. **Update tests**:
   - Use MSW for API mocking
   - Test all possible states (loading, success, empty, error)

5. **Ensure empty state is displayed**:
   - Create empty state component
   - Display when no agents exist

### Potential Challenges and Mitigations

1. **Challenge**: Ensuring proper tenant isolation
   **Mitigation**: Use middleware to extract tenant information and apply it to database queries

2. **Challenge**: Handling API failures gracefully
   **Mitigation**: Implement comprehensive error handling and retry mechanisms

3. **Challenge**: Maintaining test coverage
   **Mitigation**: Update tests in parallel with implementation changes

### Dependencies

- Existing agent database schema
- Authentication middleware for tenant isolation
- API route implementation

### Timeline

Estimated completion time: 1-2 days

1. API route implementation and testing: 0.5 day
2. AgentsPageClient updates: 0.5 day
3. Test updates: 0.5 day
4. UI refinements and empty state: 0.5 day 

## Implementation Plan for [TASK-HW020] Implement Agent Creation Form Submission

### Overview

Currently, the agent creation form exists but doesn't submit data to create real agents in the database. This implementation plan outlines the steps needed to connect the form to the API and create real agents.

### Architecture

The implementation will follow the Next.js App Router architecture:

1. **Client Component (AgentCreationForm.tsx)**: Will handle form state, validation, and submission
2. **API Route (/api/agents)**: Will handle agent creation in the database
3. **Server Actions**: Optionally, we could use Next.js server actions for form submission

### Form Schema

We'll define a Zod schema for form validation:

```typescript
import { z } from "zod";

export const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  model: z.string().default("gpt-3.5-turbo"),
  temperature: z.string().default("0.7"),
  maxTokens: z.number().int().positive().default(2000),
  imageUrl: z.string().optional(),
  type: z.string().default("chat"),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;
```

### Implementation Steps

#### 1. Update API Route

Ensure the POST handler for `/api/agents` is properly implemented to:
- Validate incoming data using Zod
- Create a new agent in the database
- Apply proper tenant isolation
- Handle errors gracefully
- Return the created agent data

```typescript
// Example POST handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tenantId = getTenantId();
    const userId = session.user.id;
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = agentFormSchema.parse(body);
    
    // Create agent in database
    const newAgent = await db.insert(agents).values({
      ...validatedData,
      userId,
      tenantId,
    }).returning();
    
    return new Response(JSON.stringify(newAgent[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation error", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Failed to create agent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

#### 2. Update Agent Creation Form

Modify the `AgentCreationForm.tsx` component to:
- Use a form library like react-hook-form with Zod validation
- Implement form submission logic
- Add loading state during submission
- Handle success and error states
- Redirect to the agent details page on success

```typescript
// Example form implementation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentFormSchema, AgentFormValues } from "@/lib/schemas/agent";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      model: "gpt-3.5-turbo",
      temperature: "0.7",
      maxTokens: 2000,
      type: "chat",
    },
  });
  
  const onSubmit = async (data: AgentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create agent");
      }
      
      const newAgent = await response.json();
      
      // Show success message
      toast.success("Agent created successfully!");
      
      // Redirect to agent details page
      router.push(`/agents/${newAgent.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      {error && <div className="text-red-500">{error}</div>}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Creating..." : "Create Agent"}
      </button>
    </form>
  );
}
```

#### 3. Add Form Validation

Implement client-side validation using Zod and react-hook-form:
- Validate required fields
- Add validation messages
- Show validation errors in the UI

#### 4. Implement Success and Error Handling

Add proper feedback for form submission:
- Show loading state during submission
- Display success message on successful creation
- Show error messages for failed submissions
- Add toast notifications for better UX

#### 5. Add Redirect Logic

Implement redirection after successful form submission:
- Redirect to the agent details page
- Pass the new agent ID in the URL
- Refresh the router to update the UI

#### 6. Update Tests

Create comprehensive tests for the form submission:
- Test form validation
- Test successful submission
- Test error handling
- Mock API responses using MSW

### Testing Strategy

1. **Unit Tests**:
   - Test form validation logic
   - Test form submission handling
   - Verify error handling works correctly

2. **Integration Tests**:
   - Test the integration between the form and the API
   - Use MSW to mock API responses
   - Verify the end-to-end flow works correctly

3. **E2E Tests**:
   - Test the complete flow from filling out the form to successful submission
   - Verify redirection works correctly
   - Test error scenarios

### Acceptance Criteria Verification

1. **Implement form submission to the `/api/agents` endpoint**:
   - Add fetch call in form submission handler
   - Handle response appropriately

2. **Add validation for required fields**:
   - Implement Zod schema
   - Connect to react-hook-form
   - Display validation errors

3. **Display success message on successful creation**:
   - Add toast notification
   - Show success message in UI

4. **Show error messages for failed submissions**:
   - Add error state
   - Display error messages
   - Provide clear feedback to users

5. **Redirect to the agent details page after creation**:
   - Use router.push to navigate
   - Pass agent ID in URL
   - Refresh router to update UI

6. **Update tests to verify form submission**:
   - Add unit tests for validation
   - Add integration tests for submission
   - Test error scenarios

### Potential Challenges and Mitigations

1. **Challenge**: Handling form validation errors
   **Mitigation**: Use Zod with react-hook-form for robust validation

2. **Challenge**: Managing form state during submission
   **Mitigation**: Use React state to track submission status

3. **Challenge**: Providing good UX during form submission
   **Mitigation**: Add loading states, disable submit button, and show clear feedback

### Dependencies

- Existing agent creation form UI
- API route for agent creation
- Authentication middleware
- Form validation libraries (Zod, react-hook-form)

### Timeline

Estimated completion time: 1-2 days

1. API route implementation: 0.5 day
2. Form validation and submission: 0.5 day
3. Success/error handling and redirection: 0.5 day
4. Testing: 0.5 day 

## Implementation Plan for [TASK-HW021] Implement Agent CRUD Operations

### Overview

Currently, the agent dashboard allows viewing agents but lacks complete CRUD (Create, Read, Update, Delete) functionality. This implementation plan outlines the steps needed to implement the full set of CRUD operations for agents.

### Architecture

The implementation will follow the Next.js App Router architecture:

1. **Client Components**:
   - `AgentCard.tsx`: Will include edit and delete actions
   - `AgentEditForm.tsx`: Will handle agent editing
   - `DeleteAgentDialog.tsx`: Will handle agent deletion confirmation

2. **API Routes**:
   - `/api/agents/[agentId]`: Will handle GET, PUT, and DELETE operations

### Implementation Steps

#### 1. Update API Routes

Implement or enhance the `/api/agents/[agentId]` API route to handle:

**GET**: Fetch a single agent by ID
```typescript
export async function GET(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tenantId = getTenantId();
    const { agentId } = params;
    
    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.tenantId, tenantId)
      ),
    });
    
    if (!agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify(agent), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch agent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**PUT**: Update an existing agent
```typescript
export async function PUT(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tenantId = getTenantId();
    const { agentId } = params;
    
    // Check if agent exists and belongs to tenant
    const existingAgent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.tenantId, tenantId)
      ),
    });
    
    if (!existingAgent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = agentFormSchema.parse(body);
    
    // Update agent in database
    const updatedAgent = await db.update(agents)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(agents.id, agentId),
        eq(agents.tenantId, tenantId)
      ))
      .returning();
    
    return new Response(JSON.stringify(updatedAgent[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating agent:", error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation error", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Failed to update agent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**DELETE**: Delete an agent
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tenantId = getTenantId();
    const { agentId } = params;
    
    // Check if agent exists and belongs to tenant
    const existingAgent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.tenantId, tenantId)
      ),
    });
    
    if (!existingAgent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Delete agent from database
    await db.delete(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.tenantId, tenantId)
      ));
    
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return new Response(JSON.stringify({ error: "Failed to delete agent" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

#### 2. Implement Agent Edit Form

Create an `AgentEditForm.tsx` component that:
- Fetches the current agent data
- Populates the form with existing values
- Handles form submission to update the agent
- Provides validation and error handling

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentFormSchema, AgentFormValues } from "@/lib/schemas/agent";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Agent } from "@/types";

interface AgentEditFormProps {
  agentId: string;
  initialData?: Agent;
}

export default function AgentEditForm({ agentId, initialData }: AgentEditFormProps) {
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      systemPrompt: initialData.systemPrompt,
      model: initialData.model || "gpt-3.5-turbo",
      temperature: initialData.temperature?.toString() || "0.7",
      maxTokens: initialData.maxTokens || 2000,
      type: initialData.type || "chat",
    } : {
      name: "",
      description: "",
      systemPrompt: "",
      model: "gpt-3.5-turbo",
      temperature: "0.7",
      maxTokens: 2000,
      type: "chat",
    },
  });
  
  useEffect(() => {
    if (initialData) return;
    
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}`);
        if (!response.ok) {
          throw new Error(`Error fetching agent: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Reset form with fetched data
        form.reset({
          name: data.name,
          description: data.description || "",
          systemPrompt: data.systemPrompt,
          model: data.model || "gpt-3.5-turbo",
          temperature: data.temperature?.toString() || "0.7",
          maxTokens: data.maxTokens || 2000,
          type: data.type || "chat",
        });
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setIsLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId, form, initialData]);
  
  const onSubmit = async (data: AgentFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update agent");
      }
      
      // Show success message
      toast.success("Agent updated successfully!");
      
      // Redirect to agent details page
      router.push(`/agents/${agentId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading agent data...</div>;
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      {error && <div className="text-red-500">{error}</div>}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

#### 3. Implement Delete Agent Dialog

Create a `DeleteAgentDialog.tsx` component that:
- Shows a confirmation dialog before deletion
- Handles the deletion API call
- Provides feedback on success or failure

```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteAgentDialogProps {
  agentId: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAgentDialog({
  agentId,
  agentName,
  isOpen,
  onClose,
}: DeleteAgentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Agent not found");
        }
        throw new Error("Failed to delete agent");
      }
      
      // Show success message
      toast.success("Agent deleted successfully!");
      
      // Close dialog and redirect
      onClose();
      router.push("/agents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Agent</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the agent "{agentName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4. Update Agent Card Component

Enhance the `AgentCard.tsx` component to include edit and delete actions:

```typescript
import { useState } from "react";
import { Agent } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DeleteAgentDialog from "./DeleteAgentDialog";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  
  const handleEdit = () => {
    router.push(`/agents/${agent.id}/edit`);
  };
  
  const handleChat = () => {
    router.push(`/agents/${agent.id}/chat`);
  };
  
  return (
    <Card>
      <CardContent>
        {/* Agent details */}
        <h3 className="text-lg font-semibold">{agent.name}</h3>
        <p className="text-sm text-gray-500">{agent.description}</p>
        {/* Other agent details */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="default" onClick={handleChat}>
          Chat
        </Button>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
          Delete
        </Button>
      </CardFooter>
      
      <DeleteAgentDialog
        agentId={agent.id}
        agentName={agent.name}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </Card>
  );
}
```

#### 5. Create Edit Agent Page

Create a new page at `app/app/(dashboard)/agents/[agentId]/edit/page.tsx`:

```typescript
import { Metadata } from "next";
import AgentEditForm from "@/components/agent/AgentEditForm";

export const metadata: Metadata = {
  title: "Edit Agent",
  description: "Edit your agent's configuration",
};

export default function EditAgentPage({ params }: { params: { agentId: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Agent</h1>
      <AgentEditForm agentId={params.agentId} />
    </div>
  );
}
```

#### 6. Update Tests

Create comprehensive tests for all CRUD operations:

- **Unit Tests**:
  - Test API route handlers
  - Test form components
  - Test dialog components

- **Integration Tests**:
  - Test the edit flow
  - Test the delete flow
  - Test error handling

### Testing Strategy

1. **Unit Tests**:
   - Test each API route handler (GET, PUT, DELETE)
   - Test form components
   - Test dialog functionality
   - Test UI components in isolation

2. **Integration Tests**:
   - Test the complete edit flow from loading data to saving changes
   - Test the delete flow from confirmation to successful deletion
   - Test error handling for all operations

3. **E2E Tests**:
   - Test the complete user flows for editing and deleting agents
   - Verify UI feedback and navigation

### Acceptance Criteria Verification

1. **Implement agent deletion functionality**:
   - Create DELETE API route handler
   - Implement confirmation dialog
   - Add delete button to agent card
   - Handle success and error states

2. **Add agent editing capability**:
   - Create PUT API route handler
   - Implement edit form component
   - Add edit button to agent card
   - Create edit page
   - Handle form submission and validation

3. **Ensure proper error handling**:
   - Add error states to all components
   - Display meaningful error messages
   - Handle network errors and API failures

4. **Add confirmation dialogs**:
   - Implement confirmation dialog for deletion
   - Prevent accidental data loss

5. **Update UI to reflect changes**:
   - Refresh the UI after successful operations
   - Provide visual feedback during operations
   - Use toast notifications for success/error messages

6. **Add comprehensive tests**:
   - Create unit tests for all components
   - Add integration tests for all flows
   - Test error scenarios

### Potential Challenges and Mitigations

1. **Challenge**: Maintaining consistent state across the application
   **Mitigation**: Use router.refresh() to update the UI after operations

2. **Challenge**: Handling race conditions in concurrent operations
   **Mitigation**: Implement proper loading states and disable buttons during operations

3. **Challenge**: Ensuring proper error handling across all operations
   **Mitigation**: Create reusable error handling utilities

### Dependencies

- Existing agent database schema
- Authentication middleware
- API routes for agent operations
- UI components for forms and dialogs

### Timeline

Estimated completion time: 2-3 days

1. API route implementation: 0.5-1 day
2. Edit form implementation: 0.5-1 day
3. Delete dialog implementation: 0.5 day
4. UI integration and testing: 0.5-1 day 

## Agent Dashboard UI

### Server/Client Component Architecture

The Agent Dashboard UI follows Next.js best practices for server and client components:

- **Server Components**: Used for initial data fetching and SEO-relevant content
- **Client Components**: Used for interactive elements and client-side state management

#### AgentsPage Component

The AgentsPage component is structured as follows:

- `app/app/(dashboard)/agents/page.tsx`: Server component that:
  - Fetches initial agents data
  - Handles metadata for the page
  - Passes initial data to the client component

- `app/app/(dashboard)/agents/AgentsPageClient.tsx`: Client component that:
  - Manages loading, error, and data states
  - Handles client-side data fetching
  - Renders the AgentDashboard component with appropriate props

- `app/app/(dashboard)/agents/metadata.ts`: Contains metadata configuration for the page

This separation allows for:
- Server-side rendering of initial content for better SEO and performance
- Client-side state management for interactive elements
- Clear separation of concerns between data fetching and UI rendering

### Agent Card Component

The Agent Card component is structured as follows:

- **Purpose**: Display agent information in a card format
- **Dependencies**: React, Next.js, TailwindCSS
- **Implementation Notes**: Use React components to render agent information
- **Related Tasks**: [TASK-005]

## Agent Dashboard Implementation

The Agent Dashboard is implemented using a client-side component that fetches data from the API. The implementation follows these key principles:

1. **Server/Client Component Separation**: The dashboard is split into server and client components following Next.js best practices. The server component (`page.tsx`) handles metadata and renders the client component (`AgentsPageClient.tsx`), which manages state and data fetching.

2. **Real-time Data Fetching**: The `AgentsPageClient` component fetches real agent data from the `/api/agents` API endpoint, which retrieves agents from the PostgreSQL database using Drizzle ORM.

3. **Data Mapping**: Database agent records are mapped to the frontend Agent interface, with appropriate defaults for fields not stored in the database (e.g., image URLs).

4. **State Management**: The component uses React hooks to manage loading states, error handling, and agent data.

5. **User Experience**: The dashboard includes loading indicators, error messages, and an empty state when no agents exist, providing a complete user experience.

6. **Testing**: Comprehensive tests verify the component's behavior in various scenarios, including successful data fetching, API errors, and empty states.

## Database Integration

The database integration for agents follows these patterns:

1. **API Routes**: The `/api/agents` endpoint handles authentication and retrieves agents for the current user.

2. **Data Access Layer**: The `agent-db.ts` module provides utility functions for CRUD operations on agents, abstracting database access from the API routes.

3. **Schema Definition**: The agent schema is defined using Drizzle ORM in `agent-schema.ts`, with appropriate indexes and relationships.

4. **Row-Level Security**: Agents are isolated by user ID, ensuring that users can only access their own agents.

5. **Query Optimization**: Database queries are optimized with conditional logging and caching to prevent excessive logging in development mode.

## Module Registry

- **AgentsPageClient**: Client component that fetches and displays agents from the database
- **AgentDashboard**: Component for displaying a list of agents with filtering and search
- **AgentCard**: Component for displaying an individual agent
- **agent-db.ts**: Database utility functions for agent CRUD operations
- **agent-schema.ts**: Drizzle ORM schema definitions for agent-related tables
- **api/agents/route.ts**: API route for agent operations
