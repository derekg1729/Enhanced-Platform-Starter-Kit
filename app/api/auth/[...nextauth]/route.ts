import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

/**
 * NextAuth authentication handler
 * This route is modified to work during static builds
 * without requiring force-dynamic.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
