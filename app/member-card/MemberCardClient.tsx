"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function MemberCardClient() {
  const sp = useSearchParams();
  const memberId = sp.get("member_id");

  const [qrToken, setQrToken] = useState<string>("");
  const [apiJson, setApiJson] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  const qrValue = useMemo(() => (qrToken ? `qr_token:${qrToken}` : ""), [qrToken]);

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setApiJson(null);
        setQrToken("");

        if (!memberId) {
          setErr("member_id がURLにありません（/member-card?member_id=... を確認）");
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
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>会員証（LIFF）</h1>

      <div style={{ marginBottom: 16 }}>
        <div>member_id: {memberId ?? "(none)"}</div>
      </div>

      {err ? <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>ERROR: {err}</div> : null}

      {apiJson ? (
        <pre style={{ background: "#111", color: "#ddd", padding: 12, borderRadius: 8, overflow: "auto" }}>
          {JSON.stringify(apiJson, null, 2)}
        </pre>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {qrToken ? (
          <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
            <div>qr_token: {qrToken}</div>
            <QRCodeCanvas value={qrValue} size={220} includeMargin />
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              ※いまは検証用に「qr_token:{qrToken}」をQR化しています
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>QRを生成中...</div>
        )}
      </div>
    </main>
  );
}