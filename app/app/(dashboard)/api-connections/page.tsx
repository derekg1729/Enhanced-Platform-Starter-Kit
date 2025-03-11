import { Metadata } from 'next';
import ApiConnectionList from '../../../../components/agent/ApiConnectionList';

export const metadata: Metadata = {
  title: 'API Connections | Agent Platform',
  description: 'Manage your API connections for the Agent Platform',
};

export default function ApiConnectionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Connections</h1>
        <p className="text-stone-400">
          Manage your API connections for use with your agents. API connections securely store your API keys for services like OpenAI, Anthropic, and more.
        </p>
      </div>
      
      <ApiConnectionList />
    </div>
  );
} 