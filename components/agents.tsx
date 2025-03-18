import { getSession } from "@/lib/auth";
import db from "@/lib/db";
import Image from "next/image";
import { redirect } from "next/navigation";
import AgentCard from "./agent-card";

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
    <div className="mt-20 flex flex-col items-center space-y-4">
      <h1 className="font-cal text-4xl">No Agents Yet</h1>
      <Image
        alt="missing agent"
        src="https://illustrations.popsy.co/gray/artificial-intelligence.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any agents yet. Create one to get started.
      </p>
    </div>
  );
} 