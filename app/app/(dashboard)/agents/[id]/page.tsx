import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getAgentById, updateAgent } from '../../../../../lib/agent-db';
import { Button } from '../../../../../components/ui/Button';
import ThemeCard from '../../../../../components/ui/ThemeCard';
import AgentChatWrapper from '../../../../../components/agent/AgentChatWrapper';
import AgentApiConnectionManager from '../../../../../components/agent/AgentApiConnectionManager';
import ModelSelectorWrapper from '../../../../../components/agent/ModelSelectorWrapper';

export const metadata: Metadata = {
  title: 'Agent Details',
  description: 'View and manage your agent',
};

export default async function AgentDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Get the current user from the session
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return notFound();
  }
  
  // Get the user ID from the session
  const userId = (session.user as { id?: string }).id || session.user.email;
  
  // Fetch the agent details from the database
  const agent = await getAgentById(id, userId);
  
  if (!agent) {
    return notFound();
  }

  // Determine the status display
  const statusDisplay = 'active';
  const statusColor = 'green';
  
  // Handle model update
  async function updateAgentModel(formData: FormData) {
    'use server';
    
    const model = formData.get('model') as string;
    if (!model) return;
    
    await updateAgent(id, userId, {
      model: model,
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/agents" className="inline-flex items-center text-sm text-stone-400 hover:text-stone-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to agents
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cal font-bold text-white">Agent Details</h1>
        <div className="flex space-x-3">
          <Link href={`/agents/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ThemeCard>
            <p className="text-sm text-stone-400 mb-2">Agent ID</p>
            <p className="font-mono text-sm bg-stone-800 p-2 rounded text-stone-300">{id}</p>
          </ThemeCard>
          
          <ThemeCard>
            <h2 className="text-lg font-medium text-white mb-4">Agent Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-400 mb-1">Name</p>
                <p className="text-white">{agent.name}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400 mb-1">Description</p>
                <p className="text-white">{agent.description || 'No description provided.'}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400 mb-1">Status</p>
                <div className={`inline-block px-2 py-1 text-xs rounded-full border bg-${statusColor}-900 text-${statusColor}-400 border-${statusColor}-800`}>
                  {statusDisplay}
                </div>
              </div>
              <div>
                <p className="text-sm text-stone-400 mb-1">Temperature</p>
                <p className="text-white">{agent.temperature}</p>
              </div>
              <div>
                <p className="text-sm text-stone-400 mb-1">Max Tokens</p>
                <p className="text-white">{agent.maxTokens}</p>
              </div>
            </div>
          </ThemeCard>
          
          <ModelSelectorWrapper 
            agentId={id} 
            currentModel={agent.model || 'gpt-3.5-turbo'} 
            userId={userId}
          />
          
          <ThemeCard>
            <div className="p-4">
              <AgentApiConnectionManager agentId={id} />
            </div>
          </ThemeCard>
        </div>
        
        <div className="lg:col-span-2">
          <div className="h-[600px]">
            <AgentChatWrapper 
              agentId={id}
              initialMessages={[
                {
                  id: '1',
                  content: 'Hello! I am your assistant. How can I help you today?',
                  role: 'assistant',
                  timestamp: new Date().toISOString()
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 