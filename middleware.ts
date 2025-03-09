import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const hostname = req.headers.get("host")!;

  // 1. Handle authentication for app subdomains (all environments)
  if (hostname.startsWith('app.') || hostname.startsWith('app-')) {
    const session = await getToken({ req });
    if (!session && pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    url.pathname = `/app${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2. Handle preview deployments and localhost
  const isPreviewDeployment = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX && 
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`);
  const isVercelPreviewUrl = hostname.includes('-dereks-projects-32c37a6a.vercel.app');
  const isLocalhost = hostname === "localhost:3000" || hostname.includes('.localhost:3000');
  
  if (isPreviewDeployment || isVercelPreviewUrl || isLocalhost) {
    // Handle local subdomains
    if (hostname.includes('.localhost:3000')) {
      const subdomain = hostname.replace('.localhost:3000', '');
      url.pathname = `/${subdomain}${pathname === '/' ? '/' : pathname}`;
      return NextResponse.rewrite(url);
    }
    
    // For preview and localhost root, serve home
    url.pathname = pathname === "/" ? "/home" : pathname;
    return NextResponse.rewrite(url);
  }

  // 3. Special redirects (could be moved to configuration)
  if (hostname === "vercel.pub") {
    return NextResponse.redirect("https://vercel.com/blog/platforms-starter-kit");
  }

  // 4. Root domain handling
  if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    url.pathname = pathname === "/" ? "/home" : pathname;
    return NextResponse.rewrite(url);
  }

  // 5. Default case: multi-tenant site lookup
  url.pathname = `/${hostname}${pathname}`;
  return NextResponse.rewrite(url);
}
