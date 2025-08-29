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
  const writeTokens: string[] | undefined =
    process.env.WRITE_ACCESS_TOKENS?.split(",").map((t) => t.trim());
  const adminTokens: string[] | undefined =
    process.env.ADMIN_ACCESS_TOKENS?.split(",").map((t) => t.trim());
  const allowedTokens: string[] = [
    ...(readTokens as string[]),
    ...(writeTokens as string[]),
    ...(adminTokens as string[]),
  ];

  if (token && allowedTokens?.includes(token)) {
    return NextResponse.next();
  }

  return new NextResponse(
    JSON.stringify({
      status: 401,
      message: "Unauthorized",
    }),
    { status: 401, headers: { "content-type": "application/json" } }
  );
}
