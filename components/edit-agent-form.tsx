"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAgent } from "@/lib/actions";
import LoadingDots from "@/components/loading-dots";

// Map model IDs to display names
const MODEL_OPTIONS = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "gpt-4", name: "GPT-4" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "claude-2", name: "Claude 2" },
  { id: "claude-instant-1", name: "Claude Instant" },
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku" },
];

export default function EditAgentForm({ agent }: { agent: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description || "");
  const [model, setModel] = useState(agent.model);
  
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setNameError("");
    setDescriptionError("");
    
    // Validate inputs
    let hasError = false;
    
    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    } else if (name.length > 32) {
      setNameError("Name must be less than 32 characters");
      hasError = true;
    }
    
    if (description.length > 140) {
      setDescriptionError("Description must be less than 140 characters");
      hasError = true;
    }
    
    if (hasError) return;
    
    startTransition(async () => {
      try {
        const result = await updateAgent({
          id: agent.id,
          name,
          description,
          model,
        });
        
        if (result.error) {
          toast.error(result.error);
          return;
        }
        
        toast.success("Agent updated successfully");
        router.push(`/agents/${agent.id}`);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update agent");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-stone-500 dark:text-stone-400">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Agent"
          maxLength={32}
          className="w-full rounded-md border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-500"
        />
        {nameError && (
          <p className="text-xs text-red-500">{nameError}</p>
        )}
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {name.length}/32 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-stone-500 dark:text-stone-400">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your agent"
          maxLength={140}
          rows={3}
          className="w-full rounded-md border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-500"
        />
        {descriptionError && (
          <p className="text-xs text-red-500">{descriptionError}</p>
        )}
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {description.length}/140 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="model" className="text-sm font-medium text-stone-500 dark:text-stone-400">
          Model
        </label>
        <select
          id="model"
          name="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full rounded-md border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-500"
        >
          {MODEL_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-700 dark:hover:bg-stone-600 dark:focus:ring-stone-500"
        >
          {isPending ? <LoadingDots color="white" /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
} 