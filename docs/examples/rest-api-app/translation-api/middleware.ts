import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/api/", "/api/translate"],
};

export function middleware(req: NextRequest) {
  const token = req.headers.get("Sheep-Token");
  const allowedTokens: String[] | undefined = process.env.ALLOWED_TOKENS?.split(
    ","
  ).map((t) => t.trim());

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
