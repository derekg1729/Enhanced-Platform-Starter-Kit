import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  // Using NEXTAUTH_URL for development and constructing production URL from ROOT_DOMAIN
  const loginUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/login`
    : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`;

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center space-y-10 px-4 pb-20 pt-16 text-center sm:pb-32 sm:pt-24">
        <Image
          width={512}
          height={512}
          src="/logo.png"
          alt="Platforms on Vercel"
          className="w-24"
        />
        <div className="max-w-2xl space-y-4">
          <h1 className="font-cal text-4xl font-bold text-white sm:text-5xl">
            Platform Starter Kit
          </h1>
          <p className="text-lg text-stone-400">
            Build multi-tenant applications with custom domains.
            <br />
            Fork of the Vercel Platforms Starter Kit with added test coverage.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href={loginUrl}
            className="rounded-lg bg-white px-6 py-3 font-cal text-black transition-colors hover:bg-stone-100"
          >
            Get Started
          </a>
          <a
            href="https://github.com/derekg1729/agent-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-700 px-6 py-3 font-cal text-white transition-colors hover:bg-stone-900"
          >
            View Source
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-stone-800 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-cal text-2xl font-bold text-white">
            Core Features
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-stone-800 p-6">
              <h3 className="font-cal text-lg text-white">Multi-Tenant Auth</h3>
              <p className="mt-2 text-stone-400">
                GitHub authentication with role-based access control
              </p>
            </div>
            <div className="rounded-lg border border-stone-800 p-6">
              <h3 className="font-cal text-lg text-white">Custom Domains</h3>
              <p className="mt-2 text-stone-400">
                Add and verify custom domains for each site
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-800 py-8 text-center">
        <p className="text-stone-400">
          Edit this page in{" "}
          <InlineSnippet className="ml-2 bg-stone-800 text-stone-300">
            app/home/page.tsx
          </InlineSnippet>
        </p>
      </div>
    </div>
  );
}
