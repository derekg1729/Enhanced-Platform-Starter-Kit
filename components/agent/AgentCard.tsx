"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  imageUrl?: string | null;
  image?: string;
  status: 'active' | 'inactive';
  type?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: string;
  maxTokens?: number | null;
  apiConnectionId?: string;
}

interface AgentCardProps {
  agent: Agent;
  onDelete?: (agentId: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function AgentCard({ agent, onDelete, isDeleting = false }: AgentCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`/agents/${agent.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/agents/${agent.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(agent.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusColors = {
    active: 'bg-green-900 text-green-400 border-green-800',
    inactive: 'bg-stone-800 text-stone-400 border-stone-700',
  };
  
  const formattedDate = formatDate(agent.createdAt);
  const imageUrl = agent.imageUrl || agent.image || '/placeholder.png';
  
  return (
    <>
      <div 
        className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-800"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{agent.description || 'No description'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {agent.status}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          Created: {formattedDate}
        </div>
        
        <div className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Agent"
        description="Are you sure you want to delete this agent? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
} 