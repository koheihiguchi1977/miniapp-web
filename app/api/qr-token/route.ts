import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    qr_token: "DUMMY_QR_TOKEN",
    expires_in_seconds: 300,
  });
}