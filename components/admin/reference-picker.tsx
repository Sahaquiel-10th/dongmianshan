"use client";
import { useEffect, useState } from "react";
type Item = {
  id: string;
  title?: string;
  name?: string;
  slug: string;
  status: string;
  deletedAt: string | null;
  category?: string;
};
export function ReferencePicker({
  kind,
  value,
  onChange,
  excludeId,
}: {
  kind: "articles" | "products";
  value: string;
  onChange: (value: string) => void;
  excludeId?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(20);
  useEffect(() => {
    let active = true;
    fetch(`/api/${kind}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("关联列表暂时无法加载，请检查数据库连接。");
        return r.json();
      })
      .then((data) => {
        if (active) {
          setItems(data.items);
          setLoaded(true);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [kind]);
  const ids = value
    .split(/[,，\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
  const keyOf = (x: Item) => (kind === "products" ? x.slug : x.id);
  const unknown = loaded
    ? ids.filter((id) => !items.some((x) => keyOf(x) === id))
    : [];
  const matches = items.filter(
    (x) =>
      x.id !== excludeId &&
      (!x.deletedAt || ids.includes(keyOf(x))) &&
      `${x.title ?? x.name ?? ""} ${x.slug}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="reference-picker editor-reference-picker">
      <p className="editor-reference-count">已选择 {ids.length} 项</p>
      {ids.length ? (
        <div className="editor-reference-selected">
          {ids.map((id) => (
            <button
              type="button"
              key={id}
              onClick={() => onChange(ids.filter((x) => x !== id).join("\n"))}
              aria-label={`移除关联：${items.find((x) => keyOf(x) === id)?.title ?? items.find((x) => keyOf(x) === id)?.name ?? id}`}
            >
              {items.find((x) => keyOf(x) === id)?.title ??
                items.find((x) => keyOf(x) === id)?.name ??
                id}{" "}
              ×
            </button>
          ))}
        </div>
      ) : null}
      <label className="editor-reference-search">
        查找要关联的{kind === "products" ? "产品" : "知识"}
        <input
          type="search"
          value={query}
          placeholder="输入标题关键词"
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(20);
          }}
        />
      </label>
      {!loaded ? <small>正在加载可关联内容…</small> : null}
      {loaded && !items.length && !error ? (
        <small>暂无可关联内容，请先新建文章或产品。</small>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <div className="editor-reference-options">
        {matches.slice(0, limit).map((x) => (
          <label key={x.id}>
            <input
              type="checkbox"
              checked={ids.includes(keyOf(x))}
              disabled={ids.length >= 12 && !ids.includes(keyOf(x))}
              onChange={(e) =>
                onChange(
                  (e.target.checked
                    ? [...ids, keyOf(x)]
                    : ids.filter((id) => id !== keyOf(x))
                  ).join("\n"),
                )
              }
            />
            <span>
              {x.title || x.name}{" "}
              {x.deletedAt
                ? "（已删除，官网不展示）"
                : x.status !== "published"
                  ? "（草稿，官网不展示）"
                  : ""}
            </span>
          </label>
        ))}
      </div>
      {loaded && !matches.length && !error ? (
        <small>没有匹配的内容，换个标题关键词试试。</small>
      ) : null}
      {matches.length > limit ? (
        <button
          className="cms-admin-button"
          type="button"
          onClick={() => setLimit((current) => current + 20)}
        >
          再显示 20 项（共 {matches.length} 项）
        </button>
      ) : null}
      {unknown.map((id) => (
        <label key={id}>
          <input
            type="checkbox"
            checked
            onChange={() => onChange(ids.filter((x) => x !== id).join("\n"))}
          />
          <span>未找到关联项：{id}</span>
        </label>
      ))}
      <small>
        最多 12 项；关联会在官网双向展示，仅公开已发布且未删除的内容。
      </small>
    </div>
  );
}
