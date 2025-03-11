import { Metadata } from 'next';
import AgentsPageClient from './AgentsPageClient';

export const metadata: Metadata = {
  title: 'Your Agents',
  description: 'Manage your AI agents',
};

export default function AgentsPage() {
  return <AgentsPageClient />;
} 