import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import db from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { agents } from "@/lib/schema";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ChatInterface from "@/components/chat-interface";

// Map model IDs to display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo",
  "claude-2": "Claude 2",
  "claude-instant-1": "Claude Instant",
  "claude-3-opus": "Claude 3 Opus",
  "claude-3-sonnet": "Claude 3 Sonnet",
  "claude-3-haiku": "Claude 3 Haiku",
};

export default async function AgentPage({ params }: { params: { id: string } }) {
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

  // Format the creation date
  const createdAt = new Date(agent.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/agents"
            className="text-sm text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1 inline-block" />
            Back to agents
          </Link>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-stone-200 dark:border-stone-700">
              <BlurImage
                src={`https://avatar.vercel.sh/${agent.id}`}
                alt={agent.name}
                width={64}
                height={64}
                className="h-full w-full"
                placeholder="blur"
                blurDataURL={placeholderBlurhash}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-cal text-2xl font-bold dark:text-white">
                {agent.name}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Created {timeAgo}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/agents/${agent.id}/edit`}
              className="flex items-center space-x-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <Pencil className="h-4 w-4" />
              <p>Edit</p>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-lg font-medium dark:text-white">Description</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {agent.description || "No description provided."}
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-lg font-medium dark:text-white">Model</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {MODEL_DISPLAY_NAMES[agent.model] || agent.model}
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900 min-h-[500px] overflow-hidden">
          <ChatInterface agent={agent} />
        </div>
      </div>
    </div>
  );
} 