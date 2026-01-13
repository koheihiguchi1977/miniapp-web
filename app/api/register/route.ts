import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function toKanaZenkaku(input: string) {
  // 最低限：前後空白除去。厳密なカナ正規化は後で強化可能。
  return input.trim();
}

function normalizePhone(input: string) {
  // 数字以外を削除（ハイフン等）
  return input.replace(/[^\d]/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 送信形式の揺れを吸収
    const line_user_id =
      body.line_user_id ?? body.lineUserId ?? body.userId ?? body.user_id;
    const display_name =
      body.display_name ?? body.displayName ?? body.display_name_line ?? body.name;

    // Teetime風フォーム項目
    const full_name = (body.full_name ?? body.fullName ?? "").trim();
    const full_name_kana = toKanaZenkaku(body.full_name_kana ?? body.fullNameKana ?? "");
    const phone = normalizePhone((body.phone ?? "").toString());
    const email = (body.email ?? "").toString().trim();
    const birthday = (body.birthday ?? body.birth_date ?? body.birthDate ?? "").toString().trim();

    const zip = (body.zip ?? body.postal_code ?? "").toString().trim();
    const pref = (body.pref ?? body.prefecture ?? "").toString().trim();
    const city = (body.city ?? "").toString().trim();
    const address1 = (body.address1 ?? body.address_line1 ?? "").toString().trim();
    const address2 = (body.address2 ?? body.address_line2 ?? "").toString().trim();

    const agreed = body.agreed === true || body.agreed === "true";

    if (!line_user_id) {
      return NextResponse.json(
        { ok: false, error: "line_user_id がありません（userId / line_user_id を送ってください）" },
        { status: 400 }
      );
    }
    if (!display_name) {
      return NextResponse.json(
        { ok: false, error: "display_name がありません（displayName を送ってください）" },
        { status: 400 }
      );
    }

    // ここから「Teetime風」の必須チェック（まずは必須にする想定）
    // 運用で緩めたければ、ここを外すだけでOK
    const requiredErrors: string[] = [];
    if (!full_name) requiredErrors.push("氏名（full_name）");
    if (!full_name_kana) requiredErrors.push("フリガナ（full_name_kana）");
    if (!phone) requiredErrors.push("電話番号（phone）");
    if (!email) requiredErrors.push("メール（email）");
    if (!birthday) requiredErrors.push("生年月日（birthday）");
    if (!pref || !city || !address1) requiredErrors.push("住所（pref/city/address1）");
    if (!agreed) requiredErrors.push("利用規約同意（agreed）");

    if (requiredErrors.length > 0) {
      return NextResponse.json(
        { ok: false, error: `未入力: ${requiredErrors.join(", ")}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 既存会員を探す
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("line_user_id", line_user_id)
      .maybeSingle();

    if (selErr) {
      console.error("Supabase select error:", selErr);
      return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
    }

    const payload = {
      line_user_id,
      display_name,
      full_name,
      full_name_kana,
      phone,
      email,
      birthday, // supabase-js は date に文字列でも入る
      zip,
      pref,
      city,
      address1,
      address2,
      agreed_at: new Date().toISOString(),
    };

    if (existing?.id) {
      // 既存なら更新（upsertでも可だが、ここは明示updateにしておく）
      const { error: updErr } = await supabaseAdmin
        .from("members")
        .update(payload)
        .eq("id", existing.id);

      if (updErr) {
        console.error("Supabase update error:", updErr);
        return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, member_id: existing.id, already: true });
    }

    // 新規作成
    const { data, error: insErr } = await supabaseAdmin
      .from("members")
      .insert(payload)
      .select("id")
      .single();

    if (insErr) {
      console.error("Supabase insert error:", insErr);
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, member_id: data.id, already: false });
  } catch (e: any) {
    console.error("register api error:", e);
    return NextResponse.json({ ok: false, error: e.message ?? "unknown error" }, { status: 500 });
  }
}