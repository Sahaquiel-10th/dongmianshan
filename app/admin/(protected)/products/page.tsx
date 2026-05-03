import { ProductList } from "@/components/admin/product-list";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  let setupError: string | null = null;
  let products: {
    id: string;
    name: string;
    slug: string;
    status: string;
    sortOrder: number;
    deletedAt: Date | null;
    updatedAt: Date;
  }[] = [];

  try {
    products = await prisma.product.findMany({
      orderBy: [{ deletedAt: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        sortOrder: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  } catch {
    try {
      const legacyProducts = await prisma.product.findMany({
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          sortOrder: true,
          updatedAt: true,
        },
      });

      products = legacyProducts.map((product) => ({
        ...product,
        deletedAt: null,
      }));
      setupError = "数据库还没有同步 deletedAt 字段，产品可查看编辑，但删除恢复功能需要先执行 npm run prisma:push。";
    } catch {
      setupError = "产品表暂时无法读取。通常是线上数据库还没有同步 Product 表，请先执行 npm run prisma:push。";
    }
  }

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Products</p>
          <h2>产品一览</h2>
          <p>管理产品图、卖点、场景、购买链接和 SEO 信息。</p>
        </div>
      </div>

      {setupError ? <p className="cms-admin-alert cms-admin-alert-error">{setupError}</p> : null}
      <ProductList products={products} />
    </section>
  );
}
