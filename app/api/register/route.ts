import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body?.userId as string | undefined;
    const displayName = body?.displayName as string | undefined;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId がありません" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing, error: selErr } = await supabaseAdmin
      .from("members")
      .select("member_id,user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing?.member_id) {
      return NextResponse.json({ ok: true, member_id: existing.member_id, existed: true });
    }

    const memberId = `M-${Date.now()}`;

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("members")
      .insert({
        member_id: memberId,
        user_id: userId,
        display_name: displayName ?? null,
      })
      .select("member_id")
      .single();

    if (insErr) throw insErr;

    return NextResponse.json({ ok: true, member_id: inserted.member_id, existed: false });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}