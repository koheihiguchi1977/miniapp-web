import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const member_id = String(body?.member_id ?? "");

    if (!member_id) {
      return NextResponse.json({ ok: false, error: "member_id is required" }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString("hex"); // 32文字
    const expiresInSeconds = 300; // 5分
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from("qr_tokens")
      .insert({ member_id, token, expires_at: expiresAt })
      .select("token, expires_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      qr_token: data.token,
      expires_at: data.expires_at,
      expires_in_seconds: expiresInSeconds,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}