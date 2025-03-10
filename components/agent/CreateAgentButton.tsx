"use client";

import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';

interface CreateAgentButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export default function CreateAgentButton({ 
  disabled = false, 
  isLoading = false 
}: CreateAgentButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/agents/new');
  };
  
  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      leftIcon={isLoading ? null : <PlusIcon size={16} data-testid="plus-icon" />}
      isLoading={isLoading}
      data-testid="create-agent-button"
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2" data-testid="loading-spinner">
            ⟳
          </span>
          <span>Create Agent</span>
        </>
      ) : (
        'Create Agent'
      )}
    </Button>
  );
} 