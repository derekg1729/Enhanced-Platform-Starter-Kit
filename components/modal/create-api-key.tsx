"use client";

import { ApiKeyForm } from "@/components/api-key-form";
import { useRouter } from "next/navigation";

export default function CreateApiKeyModal() {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show the new API key
    router.refresh();
  };

  return (
    <div className="p-4 md:p-5">
      <ApiKeyForm
        title="Add API Key"
        description="Add your API key to use with your agents."
        onSuccess={handleSuccess}
      />
    </div>
  );
} 