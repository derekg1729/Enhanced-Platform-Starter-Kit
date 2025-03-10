import { Metadata } from 'next';
import AgentDashboard from '../../../../components/agent/AgentDashboard';
import { Agent } from '../../../../components/agent/AgentCard';

export const metadata: Metadata = {
  title: 'Your Agents',
  description: 'Manage your AI agents',
};

// Mock data for now - will be replaced with actual data fetching
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Hello World Agent',
    description: 'A simple conversational agent that can respond to basic queries.',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-02'),
    imageUrl: '/placeholder.png',
    status: 'active' as const,
    type: 'hello-world',
  },
  {
    id: 'agent-2',
    name: 'Email Assistant',
    description: 'Helps draft and summarize emails based on your instructions.',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-15'),
    imageUrl: '/placeholder.png',
    status: 'inactive' as const,
    type: 'email-assistant',
  },
];

export default function AgentsPage() {
  // In a real implementation, we would fetch agents from an API
  // and handle loading states properly
  return (
    <div className="p-6">
      <h1 className="text-3xl font-cal font-bold mb-6 text-white">Your Agents</h1>
      <AgentDashboard agents={mockAgents} isLoading={false} />
    </div>
  );
} 