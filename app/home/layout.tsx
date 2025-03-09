import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enhanced Platform Starter Kit - Multi-Tenant Platform with Tests & Analytics",
  description: "A production-ready starter kit for building multi-tenant applications with Next.js, featuring comprehensive test coverage, Google Analytics integration, and modern development practices.",
  openGraph: {
    title: "Enhanced Platform Starter Kit - Multi-Tenant Platform with Tests & Analytics",
    description: "Build your own multi-tenant platform with comprehensive test coverage, Google Analytics integration, and modern development practices.",
    url: "https://wackywavelength.fyi",
    siteName: "Enhanced Platform Starter Kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enhanced Platform Starter Kit - Multi-Tenant Platform with Tests & Analytics",
    description: "Build your own multi-tenant platform with comprehensive test coverage, Google Analytics integration, and modern development practices.",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 