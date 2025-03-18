"use client";

import { ApiKeyForm } from "@/components/api-key-form";

export default function CreateApiKeyModal() {
  return (
    <div className="p-4 md:p-5">
      <ApiKeyForm
        title="Add API Key"
        description="Add your API key to use with your agents."
      />
    </div>
  );
} 