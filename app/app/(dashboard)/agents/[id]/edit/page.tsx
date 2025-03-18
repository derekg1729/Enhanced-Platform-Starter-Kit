import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { agents } from "@/lib/schema";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditAgentForm from "@/components/edit-agent-form";

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user.id) {
    redirect("/login");
  }

  const agent = await db.query.agents.findFirst({
    where: and(
      eq(agents.id, params.id),
      eq(agents.userId, session.user.id)
    ),
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href={`/agents/${agent.id}`}
            className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1 inline-block" />
            Back to agent details
          </Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h1 className="font-cal text-2xl font-bold dark:text-white">
            Edit {agent.name}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Update your agent&apos;s details and configuration.
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <EditAgentForm agent={agent} />
        </div>
      </div>
    </div>
  );
} 