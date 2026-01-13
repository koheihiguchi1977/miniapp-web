"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { useRouter } from "next/navigation";

type Status = "initializing" | "ready" | "registering" | "error";

export default function RegisterPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("initializing");
  const [error, setError] = useState("");

  // LINE profile
  const [lineUserId, setLineUserId] = useState("");
  const [lineDisplayName, setLineDisplayName] = useState("");

  // Form (Teetime風)
  const [fullName, setFullName] = useState("");
  const [fullNameKana, setFullNameKana] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState(""); // YYYY-MM-DD
  const [zip, setZip] = useState("");
  const [pref, setPref] = useState("");
  const [city, setCity] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setError("");
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID が未設定です（Vercelの環境変数を確認）");

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setLineUserId(profile.userId);
        setLineDisplayName(profile.displayName);

        setStatus("ready");
      } catch (e: any) {
        setError(e.message || "LIFF初期化エラー");
        setStatus("error");
      }
    };

    init();
  }, []);

  const register = async () => {
    try {
      setError("");
      setStatus("registering");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 正（推奨）：line_user_id を採用
          line_user_id: lineUserId,
          display_name: lineDisplayName,

          // Teetime風入力
          full_name: fullName,
          full_name_kana: fullNameKana,
          phone,
          email,
          birthday,
          zip,
          pref,
          city,
          address1,
          address2,
          agreed,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? "register failed");
      }

      router.push(`/member-card?member_id=${json.member_id}`);
    } catch (e: any) {
      setError(e.message || "登録エラー");
      setStatus("error");
    }
  };

  if (status === "initializing") return <p style={{ padding: 20 }}>初期化中…</p>;
  if (status === "error")
    return (
      <main style={{ padding: 20 }}>
        <h2>会員登録</h2>
        <p style={{ color: "red" }}>{error}</p>
        <p>LINE内で開いているか、LIFF設定（Endpoint URL / Scope / LIFF ID）を確認してください。</p>
      </main>
    );

  return (
    <main style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>LINE会員登録</h2>
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        LINE表示名: {lineDisplayName} / userId: {lineUserId}
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <label>
          氏名（漢字）*
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
        </label>

        <label>
          氏名フリガナ（全角カナ）*
          <input value={fullNameKana} onChange={(e) => setFullNameKana(e.target.value)} style={inputStyle} />
        </label>

        <label>
          電話番号*
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} inputMode="tel" />
        </label>

        <label>
          メール*
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} inputMode="email" />
        </label>

        <label>
          生年月日*
          <input value={birthday} onChange={(e) => setBirthday(e.target.value)} style={inputStyle} type="date" />
        </label>

        <label>
          郵便番号（任意）
          <input value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} inputMode="numeric" />
        </label>

        <label>
          都道府県*
          <input value={pref} onChange={(e) => setPref(e.target.value)} style={inputStyle} />
        </label>

        <label>
          市区町村*
          <input value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
        </label>

        <label>
          番地・建物名（1行目）*
          <input value={address1} onChange={(e) => setAddress1(e.target.value)} style={inputStyle} />
        </label>

        <label>
          部屋番号など（2行目・任意）
          <input value={address2} onChange={(e) => setAddress2(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          利用規約・プライバシーポリシーに同意します*
        </label>

        <button
          onClick={register}
          disabled={status === "registering"}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: status === "registering" ? "#ddd" : "#fff",
            fontWeight: 700,
            cursor: status === "registering" ? "default" : "pointer",
          }}
        >
          {status === "registering" ? "登録中…" : "会員登録を完了する"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  marginTop: 6,
};