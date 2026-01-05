import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    member_id: "TEMP-0001",
    message: "register API is working (dummy)",
  });
}