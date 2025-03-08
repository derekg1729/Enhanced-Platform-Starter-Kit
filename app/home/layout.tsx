import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Starter Kit - A Test-Driven Multi-Tenant Platform",
  description: "A production-ready starter kit for building multi-tenant applications with Next.js, featuring comprehensive test coverage and modern development practices.",
  openGraph: {
    title: "Platform Starter Kit - A Test-Driven Multi-Tenant Platform",
    description: "Build your own multi-tenant platform with comprehensive test coverage and modern development practices.",
    url: "https://vercel.pub",
    siteName: "Platform Starter Kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Starter Kit - A Test-Driven Multi-Tenant Platform",
    description: "Build your own multi-tenant platform with comprehensive test coverage and modern development practices.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 