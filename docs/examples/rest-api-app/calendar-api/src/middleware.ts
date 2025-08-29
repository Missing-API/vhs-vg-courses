import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  // match all /api/:path* except of /api/health
  matcher: ["/api/((?!health).*)"],
};

export function middleware(req: NextRequest) {
  const token = req.headers.get("Sheep-Token");

  // collect tokens from env
  const readTokens: string[] | undefined =
    process.env.READ_ACCESS_TOKENS?.split(",").map((t) => t.trim());
  const allowedTokens: string[] = [...(readTokens as string[])];

  if (token && allowedTokens?.includes(token)) {
    return NextResponse.next();
  }

  return Response.json(
    {
      status: 401,
      message: "Unauthorized",
    },
    { status: 401, headers: { "content-type": "application/json" } }
  );
}
