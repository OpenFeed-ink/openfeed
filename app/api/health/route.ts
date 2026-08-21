import { NextResponse } from "next/server";

// Liveness check for fly.toml's [[http_service.checks]] — deliberately just
// confirms the Next.js server itself is up and responding, not its
// dependencies. A deep check (DB/Redis) here would make a transient blip in
// either take healthy app machines down with it.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
