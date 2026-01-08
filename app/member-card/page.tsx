// app/member-card/page.tsx
import { Suspense } from "react";
import MemberCardClient from "./MemberCardClient";

// ★これで prerender（静的生成）を止める
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MemberCardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>読み込み中...</div>}>
      <MemberCardClient />
    </Suspense>
  );
}