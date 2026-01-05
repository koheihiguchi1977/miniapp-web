import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const line_user_id = String(body?.line_user_id ?? "");
    const display_name = String(body?.display_name ?? "");

    if (!line_user_id) {
      return NextResponse.json({ ok: false, error: "line_user_id is required" }, { status: 400 });
    }

    // 既存があれば取得、なければ作成（upsert）
    const { data, error } = await supabaseAdmin
      .from("members")
      .upsert(
        { line_user_id, display_name },
        { onConflict: "line_user_id" }
      )
      .select("id, line_user_id, display_name")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      member_id: data.id,
      line_user_id: data.line_user_id,
      display_name: data.display_name,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}