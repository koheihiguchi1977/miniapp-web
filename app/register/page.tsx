"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("initializing");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("LIFF ID 未設定");

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setDisplayName(profile.displayName);
        setUserId(profile.userId);
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
      setStatus("registering");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_user_id: userId,
          display_name: displayName,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error("register failed");

      router.push(`/member-card?member_id=${json.member_id}`);
    } catch (e: any) {
      setError(e.message || "登録エラー");
      setStatus("error");
    }
  };

  if (status === "initializing") return <p>初期化中…</p>;
  if (status === "error") return <p style={{ color: "red" }}>{error}</p>;

  return (
    <main style={{ padding: 20 }}>
      <h2>会員登録（LIFF）</h2>
      <p>ログインOK</p>
      <p>displayName: {displayName}</p>
      <p>userId: {userId}</p>

      <button onClick={register} style={{ marginTop: 20 }}>
        会員登録を完了する
      </button>
    </main>
  );
}