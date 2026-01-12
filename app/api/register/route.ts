import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 入力ゆれ吸収（どれで来てもOK）
    // - line_user_id（あなたのregisterページが送っている）
    // - lineUserId
    // - user_id / userId（旧仕様）
    const line_user_id =
      body.line_user_id ?? body.lineUserId ?? body.user_id ?? body.userId;

    const display_name =
      body.display_name ?? body.displayName;

    if (!line_user_id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "line_user_id がありません（line_user_id / lineUserId / user_id / userId のいずれかを送ってください）",
        },
        { status: 400 }
      );
    }

    if (!display_name) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "display_name がありません（display_name または displayName を送ってください）",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 既存チェック（members.line_user_id で照合）
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("line_user_id", line_user_id)
      .maybeSingle();

    if (selErr) {
      console.error("Supabase select error:", selErr);
      return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
    }

    if (existing?.id) {
      return NextResponse.json({ ok: true, member_id: existing.id, already: true });
    }

    // 新規登録（members.line_user_id に保存）
    const { data, error } = await supabaseAdmin
      .from("members")
      .insert({
        line_user_id,
        display_name,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, member_id: data.id, already: false });
  } catch (e: any) {
    console.error("register api error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}