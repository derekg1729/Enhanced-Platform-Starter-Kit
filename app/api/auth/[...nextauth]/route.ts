import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

/**
 * Force this route to be dynamically rendered
 * Required for authentication routes that need access to cookies/headers
 */
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
