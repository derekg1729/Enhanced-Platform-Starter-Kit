import BlurImage from "@/components/blur-image";
import { deleteAgent } from "@/lib/actions";
import type { SelectAgent } from "@/lib/schema";
import { placeholderBlurhash } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

/**
 * Maps model IDs to display names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "gpt-4": "GPT-4",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "claude-3-opus": "Claude 3 Opus",
  "claude-3-sonnet": "Claude 3 Sonnet",
  "claude-3-haiku": "Claude 3 Haiku",
};

export default function AgentCard({ data }: { data: SelectAgent }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Format the creation date
  const formattedDate = data.createdAt
    ? formatDistanceToNow(new Date(data.createdAt), { addSuffix: false })
    : "Unknown date";
  
  const creationInfo = data.createdAt
    ? `Created ${formattedDate === "less than a minute" ? "just now" : formattedDate === "1 day" ? "yesterday" : formattedDate === "0 days" ? "today" : formattedDate + " ago"}`
    : "Created recently";

  // Get the display name for the model
  const modelDisplayName = MODEL_DISPLAY_NAMES[data.model] || data.model;

  // Handle agent deletion
  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteAgent(data.id);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Agent deleted successfully");
        router.refresh();
      }
    });
  };

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/agent/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "Agent thumbnail"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={"/placeholder.png"}
          placeholder="blur"
          blurDataURL={placeholderBlurhash}
        />
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          {data.description && (
            <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
              {data.description}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-2">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-300">
              {modelDisplayName}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {creationInfo}
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <Link
          href={`/agent/${data.id}/chat`}
          className="flex items-center rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Chat
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center rounded-md bg-red-100 px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:bg-opacity-50 dark:text-red-400 dark:hover:bg-red-800 dark:hover:bg-opacity-50"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
} 