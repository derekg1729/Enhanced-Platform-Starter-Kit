import { Suspense } from "react";
import Agents from "@/components/agents";
import PlaceholderCard from "@/components/placeholder-card";
import CreateAgentButton from "@/components/create-agent-button";
import CreateAgentModal from "@/components/modal/create-agent";
import Link from "next/link";
import { Key } from "lucide-react";

export default function AllAgents() {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            All Agents
          </h1>
          <CreateAgentButton>
            <CreateAgentModal />
          </CreateAgentButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Agents />
        </Suspense>
      </div>
      
      <div className="border-t border-stone-200 pt-6 dark:border-stone-700">
        <h2 className="font-cal text-xl font-bold dark:text-white mb-4">Agent Settings</h2>
        <div className="flex flex-col space-y-4">
          <Link
            href="/api-keys"
            className="flex items-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 w-fit"
          >
            <Key className="h-4 w-4" />
            Manage API Keys
          </Link>
        </div>
      </div>
    </div>
  );
} 