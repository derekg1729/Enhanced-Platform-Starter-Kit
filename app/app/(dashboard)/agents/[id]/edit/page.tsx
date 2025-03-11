import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAgentById } from "@/lib/agent-db";
import AgentEditForm from "@/components/agent/AgentEditForm";

interface AgentEditPageProps {
  params: {
    id: string;
  };
}

export default async function AgentEditPage({ params }: AgentEditPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return notFound();
  }

  const agent = await getAgentById(params.id, session.user.id);

  if (!agent) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Agent</h1>
      <AgentEditForm agent={agent} />
    </div>
  );
} 