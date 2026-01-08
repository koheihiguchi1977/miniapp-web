"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function MemberCardPage() {
  const sp = useSearchParams();
  const memberId = sp.get("member_id");

  const [qrToken, setQrToken] = useState<string>("");
  const [apiJson, setApiJson] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setApiJson(null);
        setQrToken("");

        if (!memberId) {
          setErr("member_id がURLにありません（/member-card?member_id=... になっているか確認）");
          return;
        }

        const res = await fetch("/api/qr-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId }),
        });

        const json = await res.json();
        setApiJson({ status: res.status, json });

        if (!res.ok || !json.ok) {
          throw new Error(json?.error ?? "qr-token API failed");
        }

        setQrToken(json.qr_token);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    };

    run();
  }, [memberId]);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h2>会員証</h2>

      <div style={{ marginBottom: 12 }}>
        <div><b>member_id:</b> {memberId ?? "(none)"}</div>
        <div><b>qr_token:</b> {qrToken ? "(generated)" : "(not yet)"}</div>
      </div>

      {err && <p style={{ color: "red" }}>ERROR: {err}</p>}

      {qrToken && (
        <div style={{ marginTop: 16 }}>
          <QRCodeCanvas value={qrToken} size={220} />
          <p style={{ marginTop: 10 }}>受付でこのQRを提示してください</p>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />
      <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(apiJson, null, 2)}
      </pre>
    </main>
  );
}