"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode.react";

export default function MemberCardPage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("member_id");

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!memberId) return;

    const fetchQr = async () => {
      try {
        const res = await fetch("/api/qr-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId }),
        });

        const json = await res.json();
        if (!json.ok) throw new Error("QR生成失敗");

        setQrToken(json.qr_token);
      } catch (e: any) {
        setError(e.message || "エラー");
      }
    };

    fetchQr();
  }, [memberId]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!qrToken) return <p>QR生成中…</p>;

  return (
    <main style={{ padding: 20 }}>
      <h2>会員証</h2>
      <QRCode value={qrToken} size={200} />
      <p style={{ marginTop: 10 }}>受付でこのQRを提示してください</p>
    </main>
  );
}