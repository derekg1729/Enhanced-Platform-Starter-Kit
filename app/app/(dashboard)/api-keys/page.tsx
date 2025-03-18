import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ApiKeyForm from '@/components/api-key-form';
import ApiConnectionsList from '@/components/api-connections-list';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ApiKeysPage() {
  const session = await getSession();
  
  if (!session?.user.id) {
    return notFound();
  }
  
  return (
    <main className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-2">
          <Link
            href="/app/agents"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
        </div>
        <h1 className="mt-2 text-3xl font-bold">API Keys</h1>
        <p className="text-gray-500">Manage your API keys for different AI services.</p>
      </header>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <ApiKeyForm />
        </div>
        <div>
          <ApiConnectionsList />
        </div>
      </div>
    </main>
  );
} 