import { Suspense } from 'react';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ApiKeyForm from '@/components/api-key-form';
import ApiConnectionsList from '@/components/api-connections-list';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PlaceholderCard from '@/components/placeholder-card';
import CreateApiKeyButton from '@/components/create-api-key-button';
import CreateApiKeyModal from '@/components/modal/create-api-key';

export default async function ApiKeysPage() {
  const session = await getSession();
  
  if (!session?.user.id) {
    return notFound();
  }
  
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/agents"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Agents
              </Link>
            </div>
            <h1 className="font-cal text-3xl font-bold dark:text-white mt-2">
              API Keys
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              Manage your API keys for different AI services.
            </p>
          </div>
          <CreateApiKeyButton>
            <CreateApiKeyModal />
          </CreateApiKeyButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <ApiConnectionsList />
        </Suspense>
      </div>
    </div>
  );
} 