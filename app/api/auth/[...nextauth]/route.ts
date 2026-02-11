import { handlers, auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const REDIRECT_FIX_ORIGIN = "https://dreampic.site";
const REDIRECT_FIX_TARGET = "https://www.dreampic.site";
const HOST_WWW = "www.dreampic.site";

async function fixRedirectResponse(request: NextRequest, response: Response): Promise<Response> {
  const status = response.status;
  if (status !== 301 && status !== 302 && status !== 307 && status !== 308) return response;
  const location = response.headers.get("location");
  if (!location) return response;
  try {
    const url = new URL(location);
    if (url.origin !== REDIRECT_FIX_ORIGIN) return response;
    const requestHost = request.headers.get("host") ?? "";
    const hostname = requestHost.split(":")[0].toLowerCase();
    if (hostname === HOST_WWW) {
      const pathname = new URL(request.url).pathname;
      if (pathname.includes("/session")) {
        const session = await auth();
        return NextResponse.json(session ?? {});
      }
      if (pathname.includes("/csrf")) {
        const cookieStore = await cookies();
        const csrfCookie =
          cookieStore.get("__Host-next-auth.csrf-token") ??
          cookieStore.get("next-auth.csrf-token");
        const csrfToken = csrfCookie?.value ?? "";
        return NextResponse.json({ csrfToken });
      }
    }
    const newUrl = location.replace(REDIRECT_FIX_ORIGIN, REDIRECT_FIX_TARGET);
    const newHeaders = new Headers(response.headers);
    newHeaders.set("location", newUrl);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch {
    // ignore
  }
  return response;
}

async function wrapGet(req: NextRequest) {
  const res = await handlers.GET(req);
  return fixRedirectResponse(req, res);
}

async function wrapPost(req: NextRequest) {
  const res = await handlers.POST(req);
  return fixRedirectResponse(req, res);
}

export const GET = wrapGet;
export const POST = wrapPost;
