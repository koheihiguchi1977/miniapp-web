import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const line_user_id =
      body.line_user_id ?? body.lineUserId ?? body.userId ?? body.user_id;

    if (!line_user_id) {
      return NextResponse.json(
        { ok: false, error: "line_user_id がありません" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("members")
      .select("id, display_name, full_name, full_name_kana, phone, email, birthday, pref, city, address1, address2")
      .eq("line_user_id", line_user_id)
      .maybeSingle();

    if (error) {
      console.error("me api select error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 未登録
    if (!data) return NextResponse.json({ ok: true, exists: false });

    // 登録済み
    return NextResponse.json({ ok: true, exists: true, member: data });
  } catch (e: any) {
    console.error("me api error:", e);
    return NextResponse.json({ ok: false, error: e.message ?? "unknown error" }, { status: 500 });
  }
}