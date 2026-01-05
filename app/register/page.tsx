"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

type Status =
  | "initializing"
  | "logging-in"
  | "fetching-profile"
  | "registering"
  | "done"
  | "error";

export default function RegisterPage() {
  const [status, setStatus] = useState<Status>("initializing");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("LIFF ID 未設定");

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          setStatus("logging-in");
          liff.login();
          return;
        }

        setStatus("fetching-profile");
        const profile = await liff.getProfile();

        setStatus("registering");
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            line_user_id: profile.userId,
            display_name: profile.displayName,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? "register failed");
        }

        localStorage.setItem("member_id", json.member_id);

        setStatus("done");
        window.location.href = "/member-card";
      } catch (e: any) {
        setStatus("error");
        setError(e.message ?? String(e));
      }
    };

    run();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>会員登録</h1>
      <p>
        {status === "initializing" && "初期化中"}
        {status === "logging-in" && "LINEログイン中"}
        {status === "fetching-profile" && "プロフィール取得中"}
        {status === "registering" && "会員登録中"}
        {status === "done" && "完了"}
      </p>
      {status === "error" && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}