"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ExampleImport() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <div>
      <p>
        首次搭建时可补齐示例页面。只创建尚不存在的内容，保留已有编辑、草稿和删除状态；示例可在对应后台编辑或删除。
      </p>
      <button
        className="cms-admin-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await fetch("/api/examples", { method: "POST" });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error);
            setMessage("示例已补齐，可进入对应板块编辑并查看官网。");
            router.refresh();
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "导入失败");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "补齐中…" : "补齐缺失的示例内容"}
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
