import { ProductList } from "@/components/admin/product-list";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
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

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Products</p>
          <h2>产品一览</h2>
          <p>管理产品图、卖点、场景、购买链接和 SEO 信息。</p>
        </div>
      </div>

      <ProductList products={products} />
    </section>
  );
}
