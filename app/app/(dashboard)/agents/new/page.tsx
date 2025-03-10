import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import ThemeCard from '../../../../../components/ui/ThemeCard';

export const metadata: Metadata = {
  title: 'Create New Agent',
  description: 'Create a new AI agent',
};

export default function CreateAgentPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/agents" className="inline-flex items-center text-sm text-stone-400 hover:text-stone-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to agents
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cal font-bold text-white">Create New Agent</h1>
      </div>
      
      <ThemeCard>
        <p className="text-center text-stone-400 py-12">
          This page will contain a form for creating a new agent
          <br />
          <span className="text-xs mt-2 block">Implementation coming soon (TASK-HW000B)</span>
        </p>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Link href="/agents">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button variant="primary" disabled>Create Agent</Button>
        </div>
      </ThemeCard>
    </div>
  );
} 