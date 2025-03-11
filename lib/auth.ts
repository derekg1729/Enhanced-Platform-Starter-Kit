import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import db from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Adapter } from "next-auth/adapters";
import { accounts, sessions, users, verificationTokens } from "./schema";
import { createUser, getUserById } from './user-db';

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

// This function ensures a user exists in our database
// It's used both in the auth callback and can be called directly
export async function ensureUserExists(profile: {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}): Promise<boolean> {
  if (!profile?.id || !profile?.email) {
    console.error('Invalid user profile:', profile);
    return false;
  }

  try {
    // Check if user exists in our database
    const existingUser = await getUserById(profile.id);
    
    // If user doesn't exist, create them
    if (!existingUser) {
      console.log('Creating new user in database:', profile.id);
      await createUser({
        id: profile.id,
        name: profile.name || null,
        email: profile.email,
        image: profile.image || null,
      });
    }
    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      },
      profile(profile, tokens) {
        console.log('GitHub profile:', JSON.stringify(profile, null, 2));
        return (async () => {
          let primaryEmail = null;
          try {
            // Fetch user's emails from GitHub API
            const emailRes = await fetch('https://api.github.com/user/emails', {
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });
            if (emailRes.ok) {
              const emails = await emailRes.json();
              console.log('GitHub emails:', JSON.stringify(emails, null, 2));
              primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
            } else {
              console.log('Failed to fetch GitHub emails:', await emailRes.text());
            }
          } catch (error) {
            console.error('Error fetching GitHub emails:', error);
          }

          // If we couldn't get the email, generate a placeholder one
          if (!primaryEmail) {
            primaryEmail = `${profile.id}@users.noreply.github.com`;
          }
          
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            gh_username: profile.login,
            email: primaryEmail,
            image: profile.avatar_url,
          };
        })();
      },
    }),
  ],
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: DrizzleAdapter(db, {
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    usersTable: users,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    accountsTable: accounts,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    sessionsTable: sessions,
    // @ts-ignore - Type compatibility issues with DrizzleAdapter
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Ensure the user exists in our database
      if (!profile?.email) {
        console.error('User profile missing email:', profile);
        return false;
      }

      // Create a profile object with the necessary fields
      const userProfile = {
        id: user.id,
        name: user.name,
        email: profile.email,
        image: user.image
      };

      // Ensure the user exists in our database
      return await ensureUserExists(userProfile);
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.user = user;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure session.user exists and has the correct type
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: string;
    };
  } | null>;
}

export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }

    const site = await db.query.sites.findFirst({
      where: (sites, { eq }) => eq(sites.id, siteId),
    });

    if (!site || site.userId !== session.user.id) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, site, key);
  };
}

export function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }

    const post = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, postId),
      with: {
        site: true,
      },
    });

    if (!post || post.userId !== session.user.id) {
      return {
        error: "Post not found",
      };
    }

    return action(formData, post, key);
  };
}

// Exported for testing
export async function authCallback({ user, account, profile }: any) {
  if (!profile?.email) {
    console.error('User profile missing email:', profile);
    return false;
  }

  // Create a profile object with the necessary fields
  const userProfile = {
    id: user.id,
    name: user.name,
    email: profile.email,
    image: user.image
  };

  // Ensure the user exists in our database
  return await ensureUserExists(userProfile);
}
