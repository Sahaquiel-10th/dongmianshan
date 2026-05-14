"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sortOrder: number;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
};

export function ProductList({ products }: { products: ProductListItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function request(id: string, method: "DELETE" | "PATCH") {
    if (method === "DELETE" && !window.confirm("确定要删除这个产品吗？15 天内可一键恢复。")) {
      return;
    }

    setBusyId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/products/${id}`, { method });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "操作失败。");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="cms-admin-table-wrap">
      <div className="cms-admin-table-toolbar">
        <Link className="cms-admin-button cms-admin-button-primary" href="/admin/products/new">
          新建产品
        </Link>
      </div>
      {errorMessage ? <p className="cms-admin-alert cms-admin-alert-error">{errorMessage}</p> : null}
      {products.length === 0 ? (
        <div className="cms-admin-empty-state">
          <p>暂无产品内容，点击新建后官网产品区即可读取。</p>
        </div>
      ) : (
        <table className="cms-admin-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>Slug</th>
              <th>状态</th>
              <th>排序</th>
              <th>删除状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.slug}</td>
                <td>{product.status === "published" ? "已发布" : "草稿"}</td>
                <td>{product.sortOrder}</td>
                <td>{product.deletedAt ? "已删除，可恢复" : "正常"}</td>
                <td>{new Date(product.updatedAt).toLocaleString("zh-CN")}</td>
                <td>
                  <div className="cms-admin-row-actions">
                    {product.deletedAt ? (
                      <button
                        className="cms-admin-button cms-admin-button-primary"
                        type="button"
                        onClick={() => request(product.id, "PATCH")}
                        disabled={busyId === product.id}
                      >
                        {busyId === product.id ? "恢复中..." : "恢复"}
                      </button>
                    ) : (
                      <>
                        <Link className="cms-admin-button" href={`/admin/products/${product.id}/edit`}>
                          编辑
                        </Link>
                        {product.status === "published" ? (
                          <Link className="cms-admin-button" href={`/chanpin/${product.slug}`} target="_blank">
                            查看前台
                          </Link>
                        ) : null}
                        <button
                          className="cms-admin-button cms-admin-button-danger"
                          type="button"
                          onClick={() => request(product.id, "DELETE")}
                          disabled={busyId === product.id}
                        >
                          {busyId === product.id ? "删除中..." : "删除"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
