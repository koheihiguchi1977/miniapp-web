"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

type Status = "idle" | "initializing" | "ready" | "error";

export default function RegisterPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("initializing");

        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID が未設定です（Vercelの環境変数を確認してください）");

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          // LINEログインへ
          liff.login();
          return;
        }

        const p = await liff.getProfile();
        setProfile({ userId: p.userId, displayName: p.displayName });

        setStatus("ready");
      } catch (e: any) {
        setError(e?.message ?? String(e));
        setStatus("error");
      }
    };

    run();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>会員登録（LIFF）</h1>

      {status === "initializing" && <p>LINEログインを確認中...</p>}

      {status === "error" && (
        <>
          <p style={{ color: "red" }}>エラーが発生しました</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
          <p>（よくある原因：LIFF ID未設定 / Endpoint URL不一致 / Scope設定不足）</p>
        </>
      )}

      {status === "ready" && profile && (
        <>
          <p>ログインOK</p>
          <p>displayName: {profile.displayName}</p>
          <p>userId: {profile.userId}</p>
          <p>次はこの情報をサーバへ送って会員作成します。</p>
        </>
      )}
    </main>
  );
}