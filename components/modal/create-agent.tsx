"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAgent } from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { useFormStatus } from "react-dom";
import { useModal } from "@/components/modal/provider";
import { cn } from "@/lib/utils";
import va from "@vercel/analytics";

/**
 * Modal for creating a new agent
 */
export default function CreateAgentModal() {
  const router = useRouter();
  const modal = useModal();
  const [data, setData] = useState({
    name: "",
    description: "",
    model: "gpt-4",
  });

  return (
    <form
      action={async (formData: FormData) =>
        createAgent(formData).then((res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track("Created Agent");
            const { id } = res;
            router.refresh();
            router.push(`/agents/${id}`);
            modal?.hide();
            toast.success(`Successfully created agent!`);
          }
        })
      }
      className="w-full rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow dark:bg-black dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Create a new agent</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-stone-500 dark:text-stone-400"
          >
            Agent Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="My Awesome Agent"
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={32}
            required
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-stone-500"
          >
            Description
          </label>
          <textarea
            name="description"
            placeholder="Description about why my agent is so awesome"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            maxLength={140}
            rows={3}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="model"
            className="text-sm font-medium text-stone-500"
          >
            Model
          </label>
          <select
            name="model"
            value={data.model}
            onChange={(e) => setData({ ...data, model: e.target.value })}
            className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
        </div>
        
        {/* API Key Note */}
        <div className="rounded-md bg-stone-50 p-4 text-sm text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          This agent will use your account-level API keys. You can manage your API keys in the 
          <a href="/api-keys" className="text-stone-900 underline dark:text-stone-300"> API Keys</a> section.
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 md:px-10 dark:border-stone-700 dark:bg-stone-800">
        <CreateAgentFormButton />
      </div>
    </form>
  );
}

function CreateAgentFormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Create Agent</p>}
    </button>
  );
} 