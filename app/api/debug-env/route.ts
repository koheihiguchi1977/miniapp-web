import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  return NextResponse.json({
    hasUrl: !!url,
    hasKey: !!key,
    url: url ? url.replace(/^https:\/\/([^/]+).*/, "https://$1") : "",
    urlLooksSupabase: /^https:\/\/.+\.supabase\.co$/.test(url),
    keyHead: key.slice(0, 6),
    keyLen: key.length,
  });
}