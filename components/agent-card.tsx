"use client";

import BlurImage from "@/components/blur-image";
import type { SelectAgent } from "@/lib/schema";
import { placeholderBlurhash } from "@/lib/utils";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';

export default function AgentCard({ data }: { data: SelectAgent }) {
  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/agents/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "Agent thumbnail"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={`https://avatar.vercel.sh/${data.id}`}
          placeholder="blur"
          blurDataURL={placeholderBlurhash}
        />
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description || "No description provided"}
          </p>
          <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
            Model: {data.model}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Created: {format(new Date(data.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-center px-4">
        <Link
          href={`/agents/${data.id}/edit`}
          className="flex items-center rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          <PenLine className="mr-1 h-4 w-4" />
          <span>Edit</span>
        </Link>
      </div>
    </div>
  );
} 