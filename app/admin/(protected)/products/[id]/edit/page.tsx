import { IncomingLinks } from "@/components/admin/incoming-links";
import { stringList } from "@/lib/content-fields";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { EditorContext } from "@/components/admin/editor-context";
import {
  getEditorPage,
  editorPageHref,
  editorPublicReturnPath,
} from "@/lib/editor-map";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ from?: string; returnTo?: string }>;
};

function jsonListToText(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string").join("\n")
    : "";
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const query = await searchParams;
  const origin =
    getEditorPage(query.from ?? "products") ?? getEditorPage("products")!;
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
      usage: true,
      features: true,
      ingredients: true,
      relatedArticleIds: true,
      isExample: true,
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
  const returnTo = query.returnTo ? editorPublicReturnPath(query.returnTo, `/chanpin/${product.slug}`) : undefined;

  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header cms-admin-panel-header-row">
        <div>
          <p className="editor-kicker">产品卡片与详情页</p>
          <h2>{product.name}</h2>
          <p>这份资料同时用于产品卡片、产品详情与购买入口。</p>
        </div>
        <Link className="cms-admin-button" href={returnTo ?? editorPageHref(origin.id)}>
          {returnTo ? "返回官网原位置" : "返回页面内容"}
        </Link>
      </div>

      <EditorContext
        pageId={origin.id}
        title={product.name}
        publicPath={editorPublicReturnPath(
          query.returnTo,
          query.from ? origin.path : `/chanpin/${product.slug}`,
        )}
        shared="首页产品卡片（已发布且排序在前三项时）、产品列表、产品详情、官方购买，以及引用此产品的知识文章。"
      />
      <IncomingLinks
        productSlug={product.slug}
        ownArticleIds={stringList(product.relatedArticleIds)}
      />
      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          usage: product.usage ?? "",
          features: product.features ?? "",
          ingredients: product.ingredients ?? "",
          relatedArticleIds: jsonListToText(product.relatedArticleIds),
          isExample: product.isExample,
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
