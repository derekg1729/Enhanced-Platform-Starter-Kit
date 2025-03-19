import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAgent } from "@/lib/actions";
import ChatInterface from "@/components/chat-interface";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import AgentDetails from "@/components/agent-details";

// This server component fetches the agent and passes it to client components
export default async function AgentPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getSession();
  
  if (!session?.user?.id) {
    return notFound();
  }
  
  const agent = await getAgent(id);
  
  if (!agent) {
    return notFound();
  }
  
  return (
    <div className="container mx-auto py-6 lg:py-10">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/agents" className="flex items-center text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </div>
        <div>
          <Link href={`/agents/${id}/edit`} className="flex items-center text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Agent
          </Link>
        </div>
      </div>
      
      {/* Main content container with consistent padding */}
      <div className="px-4 md:px-6">
        {/* Agent Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">{agent.name}</h1>
          {agent.description && (
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              {agent.description}
            </p>
          )}
        </div>
        
        {/* Agent Details (configuration) */}
        <div className="mb-6">
          <AgentDetails agent={agent} />
        </div>
        
        {/* Chat Interface */}
        <div className="mt-6 border rounded-lg border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden">
          <ChatInterface agent={agent} />
        </div>
      </div>
    </div>
  );
} 