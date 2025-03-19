"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAgent, deleteAgent } from "@/lib/actions";
import LoadingDots from "@/components/loading-dots";
import { Trash } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { AIModel } from "@/lib/model-providers/types";

export default function EditAgentForm({ agent }: { agent: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description || "");
  const [model, setModel] = useState(agent.model);
  const [temperature, setTemperature] = useState(agent.temperature || 0.7);
  const [instructions, setInstructions] = useState(agent.instructions || "");
  
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [temperatureError, setTemperatureError] = useState("");
  
  const [models, setModels] = useState<Record<string, AIModel[]>>({});
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  // Fetch available models
  useEffect(() => {
    async function fetchModels() {
      try {
        setLoadingModels(true);
        const response = await fetch('/api/ai/models');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }
        
        const data = await response.json();
        setModels(data.models);
      } catch (err) {
        console.error('Error fetching models:', err);
        setModelsError('Failed to load available models');
      } finally {
        setLoadingModels(false);
      }
    }
    
    fetchModels();
  }, []);
  
  // Organize models by provider for display
  const modelsByProvider: Record<string, { name: string, models: AIModel[] }> = {
    'openai': { name: 'OpenAI', models: models['openai'] || [] },
    'anthropic': { name: 'Anthropic', models: models['anthropic'] || [] },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setNameError("");
    setDescriptionError("");
    setTemperatureError("");
    
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
    
    if (temperature < 0 || temperature > 2) {
      setTemperatureError("Temperature must be between 0 and 2");
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
          temperature,
          instructions,
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

  const handleDelete = async () => {
    // Show the custom confirmation dialog
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteAgent(agent.id);
      
      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }
      
      toast.success("Agent deleted successfully");
      router.push("/agents");
      router.refresh();
    } catch (error) {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      toast.error(`Error deleting agent: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Agent"
        entityName={name}
        isDeleting={isDeleting}
      />
      
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
            {loadingModels ? (
              <option value={model}>Loading models...</option>
            ) : modelsError ? (
              <option value={model}>Error loading models</option>
            ) : (
              Object.entries(modelsByProvider).map(([providerId, provider]) => (
                provider.models && provider.models.length > 0 ? (
                  <optgroup key={providerId} label={provider.name}>
                    {provider.models.map((availableModel) => (
                      <option key={availableModel.id} value={availableModel.id.split(':')[1] || availableModel.id}>
                        {availableModel.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null
              ))
            )}
            
            {/* Fallback models in case API fails */}
            {(loadingModels || modelsError || Object.keys(models).length === 0) && (
              <>
                <optgroup label="OpenAI">
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                </optgroup>
              </>
            )}
          </select>
          {modelsError && (
            <p className="text-xs text-red-500">{modelsError}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="temperature" className="text-sm font-medium text-stone-500 dark:text-stone-400">
              Temperature
            </label>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {temperature}
            </span>
          </div>
          <div className="relative w-full">
            <input
              id="temperature"
              name="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              aria-label="temperature"
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer dark:bg-stone-700"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(temperature / 2) * 100}%, rgb(229 231 235) ${(temperature / 2) * 100}%, rgb(229 231 235) 100%)`,
                WebkitAppearance: 'none'
              }}
            />
          </div>
          {temperatureError && (
            <p className="text-xs text-red-500">{temperatureError}</p>
          )}
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Controls randomness: lower values give more predictable outputs while higher values are more creative.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Specific instructions for how the agent should behave or respond"
            rows={4}
            className="w-full rounded-md border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:placeholder-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-500"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Optional instructions that guide the agent&apos;s behavior and responses.
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-700 dark:hover:bg-red-600 dark:focus:ring-red-500"
          >
            <Trash className="h-4 w-4 inline-block mr-1" />
            Delete
          </button>
          
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-700 dark:hover:bg-stone-600 dark:focus:ring-stone-500"
          >
            {isPending ? <LoadingDots color="white" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
} 