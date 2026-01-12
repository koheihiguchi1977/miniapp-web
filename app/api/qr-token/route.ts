import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const member_id = body.member_id ?? body.memberId;

    if (!member_id) {
      return NextResponse.json(
        { ok: false, error: "member_id がありません（member_id または memberId を送ってください）" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 使い捨てトークン生成（32bytes = 64hex）
    const token = crypto.randomBytes(32).toString("hex");

    // 有効期限（例：10分）
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // ★テーブル名は qr_tokens（あなたのDBに合わせる）
    const { error } = await supabaseAdmin.from("qr_tokens").insert({
      member_id,
      token,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("qr-token insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, qr_token: token, expires_at: expiresAt });
  } catch (e: any) {
    console.error("qr-token api error:", e);
    return NextResponse.json({ ok: false, error: e.message ?? "unknown error" }, { status: 500 });
  }
}