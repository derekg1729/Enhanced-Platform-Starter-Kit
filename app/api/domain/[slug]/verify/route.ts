import {
  getConfigResponse,
  getDomainResponse,
  verifyDomain,
} from "@/lib/domains";
import { DomainVerificationStatusProps } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * Domain verification API
 * This route is designed to work in both build-time static generation and runtime contexts.
 * During build time, it returns a minimal static response.
 * During runtime, it provides the full domain verification functionality.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  // Check if we're in a static build context
  let isStaticBuild = false;
  try {
    // This will throw during static build when we can't access request properties
    const headers = _req.headers;
    // Access a header to make sure it's actually available
    headers.get('host');
  } catch (e) {
    isStaticBuild = true;
  }

  // If we're in a static build context, return a minimal static response
  if (isStaticBuild) {
    return NextResponse.json({
      status: "Static Build Response",
      note: "Domain verification is only available at runtime"
    });
  }

  // Normal runtime behavior
  const domain = decodeURIComponent(params.slug);
  let status: DomainVerificationStatusProps = "Valid Configuration";

  const [domainJson, configJson] = await Promise.all([
    getDomainResponse(domain),
    getConfigResponse(domain),
  ]);

  if (domainJson?.error?.code === "not_found") {
    // domain not found on Vercel project
    status = "Domain Not Found";

    // unknown error
  } else if (domainJson.error) {
    status = "Unknown Error";

    // if domain is not verified, we try to verify now
  } else if (!domainJson.verified) {
    status = "Pending Verification";
    const verificationJson = await verifyDomain(domain);

    // domain was just verified
    if (verificationJson && verificationJson.verified) {
      status = "Valid Configuration";
    }
  } else if (configJson.misconfigured) {
    status = "Invalid Configuration";
  } else {
    status = "Valid Configuration";
  }

  return NextResponse.json({
    status,
    domainJson,
  });
}
