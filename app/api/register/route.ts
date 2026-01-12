import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const line_user_id = body.user_id ?? body.userId;
    const display_name = body.display_name ?? body.displayName;

    if (!line_user_id) {
      return NextResponse.json(
        { ok: false, error: "user_id がありません（LINEの userId を送ってください）" },
        { status: 400 }
      );
    }

    if (!display_name) {
      return NextResponse.json(
        { ok: false, error: "display_name がありません" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 既存会員チェック（LINEユーザーIDで）
    const { data: existing, error: selErr } = await supabase
      .from("members")
      .select("id")
      .eq("line_user_id", line_user_id)
      .maybeSingle();

    if (selErr) {
      console.error("select error:", selErr);
      return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
    }

    if (existing?.id) {
      return NextResponse.json({
        ok: true,
        member_id: existing.id,
        already: true,
      });
    }

    // 新規登録
    const { data, error } = await supabase
      .from("members")
      .insert({
        line_user_id,
        display_name,
      })
      .select("id")
      .single();

    if (error) {
      console.error("insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      member_id: data.id,
      already: false,
    });
  } catch (e: any) {
    console.error("register api error:", e);
    return NextResponse.json(
      { ok: false, error: e.message ?? "unknown error" },
      { status: 500 }
    );
  }
}