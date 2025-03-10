"use client";

import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ThemeCard from '../ui/ThemeCard';

export interface Agent {
  id: string;
  name: string;
  description: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  imageUrl?: string | null;
  image?: string;
  status: 'active' | 'inactive';
  type?: string;
}

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/agents/${agent.id}`);
  };
  
  const statusColors = {
    active: 'bg-green-900 text-green-400 border-green-800',
    inactive: 'bg-stone-800 text-stone-400 border-stone-700',
  };
  
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      try {
        return format(parseISO(date), 'MMM d, yyyy');
      } catch (error) {
        return 'Invalid date';
      }
    }
    return format(date, 'MMM d, yyyy');
  };
  
  const formattedDate = formatDate(agent.createdAt);
  const imageUrl = agent.imageUrl || agent.image || '/placeholder.png';
  
  return (
    <a 
      className="block"
      href={`/agents/${agent.id}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      <ThemeCard className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-stone-700">
              <Image
                src={imageUrl}
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-white">{agent.name}</h3>
            </div>
          </div>
          <span 
            className={`inline-block px-2 py-1 text-xs rounded-full border ${statusColors[agent.status]}`}
          >
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-stone-400 line-clamp-2">{agent.description}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-stone-700 text-xs text-stone-500">
          Created: {formattedDate}
        </div>
      </ThemeCard>
    </a>
  );
} 