import { Metadata } from 'next';
import ApiConnectionForm from '../../../../../components/agent/ApiConnectionForm';

export const metadata: Metadata = {
  title: 'Create API Connection | Agent Platform',
  description: 'Create a new API connection for the Agent Platform',
};

export default function CreateApiConnectionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create API Connection</h1>
        <p className="text-stone-400">
          Create a new API connection to securely store your API keys for services like OpenAI, Anthropic, and more.
        </p>
      </div>
      
      <ApiConnectionForm />
    </div>
  );
} 