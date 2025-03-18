import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import AgentCard from "./agent-card";
import EmptyAgentsState from "./empty-agents-state";

export default async function Agents({ limit }: { limit?: number }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const agents = await db.query.agents.findMany({
    where: (agents, { eq }) => eq(agents.userId, session.user.id),
    orderBy: (agents, { asc }) => asc(agents.createdAt),
    ...(limit ? { limit } : {}),
  });

  return agents.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} data={agent} />
      ))}
    </div>
  ) : (
    <EmptyAgentsState />
  );
} 