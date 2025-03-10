# Frontend Component Structure

This document outlines the component structure for the Agent Platform frontend UI, providing a guide for implementing the UI tasks in Phase 0.

## Overview

The Agent Platform frontend is built using Next.js with the App Router, React, and TailwindCSS. The component structure follows a modular approach with reusable components organized by functionality.

## Directory Structure

```
app/
├── app/                    # App router pages
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   │   ├── agents/         # Agent management pages
│   │   │   ├── [id]/       # Individual agent pages
│   │   │   │   ├── chat/   # Agent chat interface
│   │   │   │   ├── edit/   # Agent edit page
│   │   │   │   └── page.tsx # Agent details page
│   │   │   ├── create/     # Agent creation page
│   │   │   └── page.tsx    # Agent listing page
│   │   └── page.tsx        # Dashboard home page
│   └── layout.tsx          # Root layout
├── components/             # Shared components
│   ├── agents/             # Agent-specific components
│   ├── chat/               # Chat interface components
│   ├── dashboard/          # Dashboard components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
└── lib/                    # Utility functions and hooks
    ├── agents/             # Agent-related utilities
    ├── api/                # API client functions
    └── hooks/              # Custom React hooks
```

## Shared Components

### UI Components (`components/ui/`)

These are the basic building blocks of the UI, designed to be highly reusable across the application.

- **Button**: Primary, secondary, and tertiary button styles
- **Card**: Container for content with consistent styling
- **Input**: Text input with validation
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection component
- **Checkbox**: Toggle component
- **Radio**: Radio button component
- **Switch**: Toggle switch component
- **Badge**: Small status indicator
- **Avatar**: User or agent avatar
- **Tooltip**: Contextual information on hover
- **Modal**: Dialog for focused interactions
- **Tabs**: Tabbed interface component
- **Accordion**: Expandable content sections
- **Skeleton**: Loading state placeholders
- **Toast**: Notification component

### Layout Components (`components/layout/`)

Components that define the overall structure of the application.

- **Header**: Application header with navigation
- **Sidebar**: Navigation sidebar
- **Footer**: Application footer
- **Container**: Content container with responsive padding
- **Grid**: Responsive grid layout
- **Breadcrumbs**: Navigation breadcrumbs

### Form Components (`components/forms/`)

Components for building forms with validation and error handling.

- **Form**: Container for form elements with validation context
- **FormField**: Container for form inputs with label and error message
- **FormSection**: Grouping of related form fields
- **FormActions**: Container for form action buttons
- **MultiStepForm**: Form with multiple steps and progress tracking

## Agent-Specific Components

### Agent Dashboard Components (`components/agents/`)

Components for the agent listing and management dashboard.

- **AgentCard**: Card displaying agent information and actions
- **AgentList**: List of agent cards with filtering and sorting
- **AgentStats**: Statistics about agent usage and performance
- **CreateAgentButton**: Button to initiate agent creation
- **AgentFilter**: Filtering options for the agent list
- **EmptyAgentState**: Display when no agents exist

### Agent Creation Components (`components/agents/creation/`)

Components for the agent creation flow.

- **AgentCreationForm**: Multi-step form for creating an agent
- **BasicInfoStep**: First step for basic agent information
- **CapabilitiesStep**: Step for selecting agent capabilities
- **PromptConfigStep**: Step for configuring agent prompts
- **APIConnectionStep**: Step for connecting to external APIs
- **PreviewStep**: Final step showing agent preview before creation
- **SuccessScreen**: Confirmation screen after successful creation

### Chat Interface Components (`components/chat/`)

Components for the agent chat interface.

- **ChatContainer**: Main container for the chat interface
- **MessageList**: List of chat messages
- **MessageItem**: Individual message in the chat
- **UserMessage**: Message from the user
- **AgentMessage**: Message from the agent
- **MessageInput**: Input for typing and sending messages
- **ChatHeader**: Header for the chat interface with agent info
- **ChatSidebar**: Sidebar with conversation history and settings
- **FeedbackButtons**: Thumbs up/down buttons for message feedback
- **FeedbackForm**: Form for providing detailed feedback
- **TypingIndicator**: Indicator showing the agent is "typing"
- **ErrorMessage**: Display for chat errors
- **EmptyChatState**: Display when no messages exist

## Page Components

### Dashboard Page (`app/(dashboard)/page.tsx`)

The main dashboard page showing an overview of the user's agents and activity.

- **DashboardHeader**: Header with user info and actions
- **AgentOverview**: Summary of the user's agents
- **RecentActivity**: Recent interactions with agents
- **QuickActions**: Common actions like creating a new agent

### Agent Listing Page (`app/(dashboard)/agents/page.tsx`)

Page displaying all of the user's agents with filtering and sorting options.

- **AgentListHeader**: Header with filtering and sorting controls
- **AgentGrid**: Grid layout of agent cards
- **CreateAgentCTA**: Call-to-action for creating a new agent

### Agent Creation Page (`app/(dashboard)/agents/create/page.tsx`)

Multi-step form for creating a new agent.

- **CreationHeader**: Header with progress indicator
- **StepNavigation**: Navigation between form steps
- **StepContent**: Content for the current step
- **FormActions**: Next/back/submit buttons

### Agent Details Page (`app/(dashboard)/agents/[id]/page.tsx`)

Page showing details about a specific agent.

- **AgentHeader**: Header with agent name and actions
- **AgentDetails**: Detailed information about the agent
- **AgentStats**: Usage statistics for the agent
- **AgentActions**: Actions like edit, delete, and chat

### Agent Chat Page (`app/(dashboard)/agents/[id]/chat/page.tsx`)

Page for chatting with a specific agent.

- **ChatHeader**: Header with agent name and status
- **ChatInterface**: Main chat interface with messages and input
- **ChatSidebar**: Sidebar with conversation history

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                       Layout Components                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Header    │  │   Sidebar   │  │      Container      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Page Components                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │ Agent List  │  │  Agent Creation     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │Agent Details│  │  Agent Chat │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Components                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Agent Card  │  │  Chat UI    │  │   Creation Form     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        UI Components                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Button    │  │    Input    │  │        Card         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Modal     │  │   Tooltip   │  │       Badge         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Management

The application uses a combination of React hooks for local state and context for shared state:

- **Local State**: Component-specific state using `useState` and `useReducer`
- **Shared State**: Application-wide state using React Context
- **Server State**: Data fetching and caching using SWR or React Query
- **Form State**: Form state management using React Hook Form

## Styling Approach

The application uses TailwindCSS for styling with a consistent design system:

- **Base Components**: Styled using TailwindCSS utility classes
- **Component Variants**: Different styles for different states (primary, secondary, etc.)
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Dark Mode**: Support for light and dark mode
- **Accessibility**: WCAG 2.1 AA compliance

## Implementation Plan

1. **Create UI Components**: Implement the base UI components first
2. **Build Layout Components**: Implement the layout structure
3. **Implement Agent Dashboard**: Create the agent listing and management UI
4. **Build Agent Creation Flow**: Implement the multi-step creation form
5. **Develop Chat Interface**: Create the chat UI components
6. **Connect Components**: Integrate the components into pages
7. **Add Interactivity**: Implement client-side functionality
8. **Test and Refine**: Test the UI for usability and accessibility

## Testing Strategy

- **Component Tests**: Unit tests for individual components
- **Integration Tests**: Tests for component interactions
- **Accessibility Tests**: Tests for WCAG compliance
- **Responsive Tests**: Tests for different screen sizes
- **Visual Regression Tests**: Tests for visual consistency

## Next Steps

1. Start by implementing the base UI components in `components/ui/`
2. Create the layout components for the application structure
3. Build the agent dashboard components
4. Implement the agent creation form
5. Develop the chat interface components 