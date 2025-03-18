import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { agents } from "@/lib/schema";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash } from "@/lib/utils";
import ChatInterface from "@/components/chat-interface";

export default async function AgentChatPage({ params }: { params: { id: string } }) {
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

        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-stone-200 dark:border-stone-700">
            <BlurImage
              src={`https://avatar.vercel.sh/${agent.id}`}
              alt={agent.name}
              width={48}
              height={48}
              className="h-full w-full"
              placeholder="blur"
              blurDataURL={placeholderBlurhash}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-cal text-2xl font-bold dark:text-white">
              Chat with {agent.name}
            </h1>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900 min-h-[500px] overflow-hidden">
          <ChatInterface agent={agent} />
        </div>
      </div>
      {!agent && (
        <div className="flex h-[50vh] flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Agent not found</h1>
          <p className="text-gray-500">
            The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link
            href="/agents"
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Back to Agents
          </Link>
        </div>
      )}
    </div>
  );
} 