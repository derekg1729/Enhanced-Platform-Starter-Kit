"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/Select";
import { Agent } from "./AgentCard";

// Define a simpler type for the form data directly
type AgentFormData = {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: string;
  maxTokens: number;
};

interface AgentEditFormProps {
  agent: Agent;
}

export default function AgentEditForm({ agent }: AgentEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with explicit default values
  const form = useForm<AgentFormData>({
    defaultValues: {
      name: agent.name || "",
      description: agent.description || "",
      systemPrompt: agent.systemPrompt || "",
      model: agent.model || "gpt-3.5-turbo",
      temperature: agent.temperature || "0.7",
      maxTokens: agent.maxTokens || 2048,
    },
  });

  const onSubmit = async (data: AgentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate required fields manually
      if (!data.name) {
        setError("Name is required");
        setIsSubmitting(false);
        return;
      }

      if (!data.systemPrompt) {
        setError("System prompt is required");
        setIsSubmitting(false);
        return;
      }

      if (!data.model) {
        setError("Model is required");
        setIsSubmitting(false);
        return;
      }

      if (!data.temperature) {
        setError("Temperature is required");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update agent");
      }

      router.push("/app/agents");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Agent name" 
                    {...field} 
                    data-testid="agent-name-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Agent description" 
                    {...field} 
                    data-testid="agent-description-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="System prompt" 
                    {...field} 
                    data-testid="agent-system-prompt-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Select
                    onChange={field.onChange}
                    value={field.value}
                    data-testid="agent-model-select"
                  >
                    <option value="">Select a model</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="1" 
                    {...field} 
                    data-testid="agent-temperature-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tokens</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 2048)}
                    data-testid="agent-max-tokens-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-red-500" data-testid="error-message">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            data-testid="submit-button"
          >
            {isSubmitting ? "Updating..." : "Update Agent"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 