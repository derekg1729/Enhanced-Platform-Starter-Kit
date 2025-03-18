"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import va from "@vercel/analytics";
import { useFormStatus } from "react-dom";

/**
 * Agent configuration form component
 * Allows users to configure an agent with settings
 */
export default function AgentForm({
  title = "Configure Agent",
  description = "Set up your agent with a name, description, and model.",
  initialValues = {
    name: "",
    description: "",
    model: "gpt-4",
  },
  onSubmit,
}: {
  title?: string;
  description?: string;
  initialValues?: {
    name: string;
    description: string;
    model: string;
  };
  onSubmit?: (data: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();

  const defaultSubmitHandler = async (formData: FormData) => {
    const result = await onSubmit?.(formData);
    
    if (result?.error) {
      toast.error(result.error);
      return { error: result.error };
    }
    
    if (result?.success) {
      toast.success("Agent configured successfully!");
      router.refresh();
      return { success: true };
    }
    
    return {};
  };

  const handleSubmit = onSubmit ? defaultSubmitHandler : undefined;

  return (
    <form
      action={async (formData: FormData) => {
        const result = await handleSubmit?.(formData);
        
        if (result?.error) {
          toast.error(result.error);
        } else {
          va.track("Agent Updated");
          toast.success("Agent configured successfully!");
          router.refresh();
        }
      }}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>

        {/* Agent Name */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Agent Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialValues.name}
            placeholder="My AI Assistant"
            maxLength={50}
            className="w-full max-w-md rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        {/* Agent Description */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialValues.description}
            placeholder="A brief description of what this agent does"
            maxLength={140}
            rows={3}
            className="w-full max-w-xl rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
          />
        </div>

        {/* Model Selection */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="model" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Model
          </label>
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-200">
            <select
              id="model"
              name="model"
              required
              defaultValue={initialValues.model}
              className="w-full rounded-none border-none bg-white px-4 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-black dark:bg-black dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
        </div>

        {/* API Key Note */}
        <div className="rounded-md bg-stone-50 p-4 text-sm text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          This agent will use your account-level API keys. You can manage your API keys in the 
          <a href="/api-keys" className="text-stone-900 underline dark:text-stone-300"> API Keys</a> section.
        </div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">Required fields are marked with *</p>
        <FormButton />
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Save Changes</p>}
    </button>
  );
} 