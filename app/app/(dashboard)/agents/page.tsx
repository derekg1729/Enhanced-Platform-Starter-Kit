import { getSession } from '@/lib/auth';
import { getAgents } from '@/lib/actions';
import AgentsList from '@/components/agents-list';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Key } from 'lucide-react';

export default async function AgentsPage() {
  const session = await getSession();
  
  if (!session?.user.id) {
    return notFound();
  }
  
  const agents = await getAgents(session.user.id);
  
  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-gray-500">Manage your AI agents</p>
        </div>
        <Link
          href="/app/api-keys"
          className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <Key className="h-4 w-4" />
          Manage API Keys
        </Link>
      </header>
      
      <AgentsList agents={agents} loading={false} />
    </main>
  );
} 