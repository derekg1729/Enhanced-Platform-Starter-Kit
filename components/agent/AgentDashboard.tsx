"use client";

import { useState } from 'react';
import AgentCard, { Agent } from './AgentCard';
import CreateAgentButton from './CreateAgentButton';
import { Input } from '../ui/Input';
import ThemeCard from '../ui/ThemeCard';

interface AgentDashboardProps {
  agents: Agent[];
  isLoading: boolean;
}

export default function AgentDashboard({ agents, isLoading }: AgentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="w-full" data-testid="agent-dashboard">
      <div className="flex justify-end mb-6">
        <CreateAgentButton />
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md dark:bg-stone-800 dark:border-stone-700 dark:text-white"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-md text-sm ${
                statusFilter === 'all' 
                  ? 'bg-stone-800 text-white' 
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-700'
              }`}
              data-selected={statusFilter === 'all'}
              data-testid="filter-all"
              aria-label="All"
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-2 rounded-md text-sm ${
                statusFilter === 'active' 
                  ? 'bg-green-900 text-green-400' 
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-700'
              }`}
              data-selected={statusFilter === 'active'}
              data-testid="filter-active"
              aria-label="Active"
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-2 rounded-md text-sm ${
                statusFilter === 'inactive' 
                  ? 'bg-stone-800 text-stone-400' 
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 border border-stone-700'
              }`}
              data-selected={statusFilter === 'inactive'}
              data-testid="filter-inactive"
              aria-label="Inactive"
            >
              Inactive
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div data-testid="loading-state" className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin text-4xl mb-4 text-stone-400">⟳</div>
          <p className="text-stone-400">Loading agents...</p>
        </div>
      ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} data-testid={`agent-card-${agent.id}`} />
          ))}
        </div>
      ) : (
        <ThemeCard data-testid="empty-state" className="flex flex-col items-center justify-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-stone-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium mb-2 text-white">No agents found</h3>
          <p className="text-stone-400 mb-6">Create your first agent to get started</p>
          <CreateAgentButton />
        </ThemeCard>
      )}
    </div>
  );
} 