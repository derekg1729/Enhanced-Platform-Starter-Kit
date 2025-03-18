import AgentForm from '@/components/agent-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewAgentPage() {
  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Link
          href="/agents"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>
        <h1 className="text-3xl font-bold">Create New Agent</h1>
      </header>
      
      <AgentForm 
        title="Create New Agent"
        description="Configure your new AI agent with a name, description, and model."
      />
    </main>
  );
} 