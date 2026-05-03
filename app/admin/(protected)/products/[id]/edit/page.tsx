import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function jsonListToText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      summary: true,
      routineStep: true,
      coverImage: true,
      shopUrl: true,
      benefits: true,
      scenes: true,
      seoTitle: true,
      seoDescription: true,
      status: true,
      sortOrder: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Products</p>
          <h2>编辑产品</h2>
          <p>修改后前台会读取最新发布内容。</p>
        </div>
        <Link className="cms-admin-button" href="/admin/products">
          返回产品列表
        </Link>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          slug: product.slug,
          subtitle: product.subtitle ?? "",
          summary: product.summary ?? "",
          routineStep: product.routineStep ?? "",
          coverImage: product.coverImage ?? "",
          shopUrl: product.shopUrl ?? "",
          benefits: jsonListToText(product.benefits),
          scenes: jsonListToText(product.scenes),
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          status: product.status,
          sortOrder: String(product.sortOrder),
        }}
      />
    </section>
  );
}
