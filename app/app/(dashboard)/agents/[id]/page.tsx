import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import ThemeCard from '../../../../../components/ui/ThemeCard';

export const metadata: Metadata = {
  title: 'Agent Details',
  description: 'View and manage your agent',
};

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
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
          <Button variant="secondary">Edit</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
      
      <ThemeCard className="mb-6">
        <p className="text-sm text-stone-400 mb-2">Agent ID</p>
        <p className="font-mono text-sm bg-stone-800 p-2 rounded text-stone-300">{params.id}</p>
      </ThemeCard>
      
      <ThemeCard>
        <p className="text-center text-stone-400 py-12">
          This page will contain detailed information about the agent with ID: {params.id}
          <br />
          <span className="text-xs mt-2 block">Implementation coming soon (TASK-HW000C)</span>
        </p>
      </ThemeCard>
    </div>
  );
} 