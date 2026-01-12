"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type ApiJson = { status: number; json: any } | null;

export default function MemberCardClient() {
  const sp = useSearchParams();
  const memberId = sp.get("member_id");

  const [qrToken, setQrToken] = useState<string>("");
  const [apiJson, setApiJson] = useState<ApiJson>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setApiJson(null);
        setQrToken("");

        if (!memberId) {
          setErr("member_id がURLにありません（例：/member-card?member_id=...）");
          return;
        }

        setLoading(true);

        const res = await fetch("/api/qr-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId }),
        });

        let json: any = null;
        try {
          json = await res.json();
        } catch (e) {
          // JSONで返ってこない場合に備える
          json = { parse_error: true };
        }

        setApiJson({ status: res.status, json });

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error ?? "qr-token API failed");
        }

        setQrToken(json.qr_token);
      } catch (e: any) {
        setErr(e?.message ?? "unknown error");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [memberId]);

  return (
    <div style={{ maxWidth: 720 }}>
      {/* 2) APIレスポンスを画面に表示（デバッグ） */}
      {apiJson && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>APIレスポンス（デバッグ）</h2>
          <pre
            style={{
              fontSize: 12,
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(apiJson, null, 2)}
          </pre>
        </div>
      )}

      {err && (
        <p style={{ color: "crimson", marginBottom: 12 }}>
          エラー: {err}
        </p>
      )}

      {loading && <p>QRトークン取得中...</p>}

      {!loading && !err && !qrToken && (
        <p>QRトークン未取得（member_id を確認してください）</p>
      )}

      {/* QR表示（最小構成で確実に出す） */}
      {qrToken && (
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <p style={{ marginBottom: 8, fontSize: 14 }}>
            member_id: <b>{memberId}</b>
          </p>

          <QRCodeCanvas value={qrToken} size={220} />

          <p style={{ fontSize: 12, marginTop: 12, wordBreak: "break-all" }}>
            token: {qrToken}
          </p>
        </div>
      )}
    </div>
  );
}