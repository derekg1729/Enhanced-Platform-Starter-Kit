import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  // Using NEXTAUTH_URL for development and constructing production URL from ROOT_DOMAIN
  const loginUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/login`
    : `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-red-600 to-green-600 opacity-90 z-0"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-10 px-4 pb-20 pt-16 text-center sm:pb-32 sm:pt-24">
        <div className="bg-black/30 p-6 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl">
          <Image
            width={512}
            height={512}
            src="/logo.png"
            alt="Platforms on Vercel"
            className="w-24 mx-auto mb-6"
          />
          <div className="max-w-2xl space-y-4">
            <h1 className="font-cal text-4xl font-bold text-white sm:text-5xl">
              Platform Starter Kit
              <span className="block text-2xl mt-2 text-emerald-300">Enhanced Edition</span>
            </h1>
            <p className="text-lg text-white/80">
              Build multi-tenant applications with custom domains.
              <br />
              Fork of the Vercel Platforms Starter Kit with significant improvements.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row mt-8 justify-center">
            <a
              href={loginUrl}
              className="rounded-lg bg-white px-6 py-3 font-cal text-black transition-all hover:bg-stone-100 hover:shadow-lg transform hover:-translate-y-1"
            >
              Login
            </a>
            <a
              href="https://github.com/derekg1729/agent-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 font-cal text-white transition-all hover:bg-white/20 hover:shadow-lg transform hover:-translate-y-1"
            >
              View Source
            </a>
          </div>
        </div>
      </div>

      {/* Original Features Section */}
      <div className="relative z-10 border-t border-white/20 px-4 py-16 text-center bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-white mb-2">
            Original Starter Kit Features
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            The foundation from Vercel&apos;s Platform Starter Kit
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Multi-Tenant Auth</h3>
              <p className="text-stone-300">
                GitHub authentication with role-based access control
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Custom Domains</h3>
              <p className="text-stone-300">
                Add and verify custom domains for each site
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">Edge Middleware</h3>
              <p className="text-stone-300">
                Fast, global routing with Vercel Edge Functions
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:shadow-lg">
              <h3 className="font-cal text-xl text-white mb-2">PostgreSQL DB</h3>
              <p className="text-stone-300">
                Secure, scalable database with row-level security
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Features Section */}
      <div className="relative z-10 border-t border-white/20 px-4 py-16 text-center bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-emerald-300 mb-2">
            Enhanced Benefits
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Additional features and improvements in this enhanced edition
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-6 backdrop-blur-sm transition-all hover:bg-emerald-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-emerald-300 mb-2">Comprehensive Tests</h3>
              <p className="text-stone-300">
                TDD approach with unit, integration, and build tests
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-6 backdrop-blur-sm transition-all hover:bg-emerald-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-emerald-300 mb-2">Google Analytics</h3>
              <p className="text-stone-300">
                Built-in event tracking and performance monitoring
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-6 backdrop-blur-sm transition-all hover:bg-emerald-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-emerald-300 mb-2">Enhanced UI</h3>
              <p className="text-stone-300">
                Modern, responsive design with improved aesthetics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Development Enhancements Section */}
      <div className="relative z-10 border-t border-white/20 px-4 py-16 text-center bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-purple-300 mb-2">
            AI Development Enhancements
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Features that enhance AI-assisted development workflows
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-sm transition-all hover:bg-purple-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-purple-300 mb-2">CursorRules</h3>
              <p className="text-stone-300">
                Structured project metadata that guides AI-assisted development with best practices
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-sm transition-all hover:bg-purple-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-purple-300 mb-2">Test-Driven Development</h3>
              <p className="text-stone-300">
                Comprehensive test infrastructure with clear TDD workflow documentation
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-sm transition-all hover:bg-purple-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-purple-300 mb-2">Pre-commit Guardrails</h3>
              <p className="text-stone-300">
                Automated checks for environment variables, linting, type safety, tests, and build verification
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bugfixes Section */}
      <div className="relative z-10 border-t border-white/20 px-4 py-16 text-center bg-black/50 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-cal text-3xl font-bold text-rose-300 mb-2">
            Critical Bugfixes
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Issues resolved from the original Vercel Starter Kit
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-rose-500/30 bg-rose-900/20 p-6 backdrop-blur-sm transition-all hover:bg-rose-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-rose-300 mb-2">GitHub Auth Email Requirement</h3>
              <p className="text-stone-300 mb-3">
                Fixed issue #409 where GitHub authentication required email access, causing login failures
              </p>
              <a 
                href="https://github.com/vercel/platforms/issues/409" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-rose-300 hover:text-rose-200 underline"
              >
                View original issue
              </a>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-900/20 p-6 backdrop-blur-sm transition-all hover:bg-rose-900/30 hover:shadow-lg">
              <h3 className="font-cal text-xl text-rose-300 mb-2">Build Issues</h3>
              <p className="text-stone-300">
                Resolved build failures caused by Novel editor dependencies and configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/20 py-8 text-center bg-black/60 backdrop-blur-md">
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
