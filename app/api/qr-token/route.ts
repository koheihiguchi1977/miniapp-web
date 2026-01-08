import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const memberId = body?.member_id as string | undefined;

    if (!memberId) {
      return NextResponse.json({ ok: false, error: "member_id がありません" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const token = crypto.randomBytes(16).toString("hex");
    const expiresInSeconds = 300;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const { error } = await supabaseAdmin.from("member_qr_tokens").insert({
      member_id: memberId,
      qr_token: token,
      expires_at: expiresAt,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, qr_token: token, expires_in_seconds: expiresInSeconds });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}