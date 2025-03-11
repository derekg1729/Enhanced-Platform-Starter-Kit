import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAgentById } from "@/lib/agent-db";
import AgentEditForm from "@/components/agent/AgentEditForm";
import { Agent } from "@/components/agent/AgentCard";

interface AgentEditPageProps {
  params: {
    id: string;
  };
}

export default async function AgentEditPage({ params }: AgentEditPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    return notFound();
  }
  
  const userId = (session.user as { id?: string }).id || session.user.email;
  
  const agentData = await getAgentById(params.id, userId);
  
  if (!agentData) {
    return notFound();
  }
  
  // Ensure the agent has all required properties from the Agent interface
  const agent: Agent = {
    ...agentData,
    status: 'inactive', // Default status if not provided
    description: agentData.description || null,
    maxTokens: agentData.maxTokens || null
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Edit Agent</h1>
      <AgentEditForm agent={agent} />
    </div>
  );
} 