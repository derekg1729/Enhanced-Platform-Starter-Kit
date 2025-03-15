"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingDots from "@/components/icons/loading-dots";
import { cn } from "@/lib/utils";
import { encryptApiKey } from "@/lib/encryption";
import va from "@vercel/analytics";
import { useFormStatus } from "react-dom";

/**
 * Agent configuration form component
 * Allows users to configure an agent with API keys and settings
 */
export default function AgentForm({
  title = "Configure Agent",
  description = "Set up your agent with the necessary API keys and configuration.",
  initialValues = {
    name: "",
    description: "",
    apiKey: "",
    model: "gpt-4",
  },
  onSubmit,
}: {
  title?: string;
  description?: string;
  initialValues?: {
    name: string;
    description: string;
    apiKey: string;
    model: string;
  };
  onSubmit?: (data: FormData) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  // Default submit handler if none is provided
  const defaultSubmitHandler = async (formData: FormData) => {
    try {
      // Get values from form
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const apiKey = formData.get("apiKey") as string;
      const model = formData.get("model") as string;

      // Validate inputs
      if (!name || !apiKey || !model) {
        return { error: "Please fill in all required fields" };
      }

      // Encrypt the API key
      const encryptedApiKey = await encryptApiKey(apiKey);

      // In a real implementation, this would save to the database
      console.log("Agent configuration:", {
        name,
        description,
        encryptedApiKey,
        model,
      });

      // Track the event
      va.track("Agent Configured", { model });

      return { success: true };
    } catch (error) {
      console.error("Error configuring agent:", error);
      return { error: "Failed to configure agent. Please try again." };
    }
  };

  // Use the provided submit handler or the default one
  const handleSubmit = onSubmit || defaultSubmitHandler;

  return (
    <form
      action={async (formData: FormData) => {
        const result = await handleSubmit(formData);
        
        if (result.error) {
          toast.error(result.error);
        } else {
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
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Agent Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialValues.name}
            placeholder="My AI Assistant"
            maxLength={50}
            className="w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        </div>

        {/* Agent Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialValues.description}
            placeholder="A helpful AI assistant that can answer questions and perform tasks."
            className="w-full max-w-xl rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            API Key *
          </label>
          <div className="relative w-full max-w-md">
            <input
              id="apiKey"
              name="apiKey"
              type={isApiKeyVisible ? "text" : "password"}
              required
              defaultValue={initialValues.apiKey}
              placeholder="sk-..."
              className="w-full rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            <button
              type="button"
              onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            >
              {isApiKeyVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Your API key is encrypted before being stored. We never store your API key in plain text.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Model *
          </label>
          <div className="flex max-w-sm items-center overflow-hidden rounded-lg border border-stone-300 dark:border-stone-600">
            <select
              id="model"
              name="model"
              defaultValue={initialValues.model}
              className="w-full rounded-none border-none bg-white px-4 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-black dark:bg-black dark:text-stone-200 dark:focus:ring-white"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10 dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Your API key will be encrypted and stored securely.
        </p>
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
      {pending ? <LoadingDots color="#808080" /> : <p>Save Configuration</p>}
    </button>
  );
} 