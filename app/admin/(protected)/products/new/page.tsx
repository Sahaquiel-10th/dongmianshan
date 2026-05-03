import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <section className="cms-admin-panel">
      <div className="cms-admin-panel-header">
        <div>
          <p className="cms-admin-eyebrow">Products</p>
          <h2>新建产品</h2>
          <p>新增后设置为发布状态，即可显示在官网产品区。</p>
        </div>
        <Link className="cms-admin-button" href="/admin/products">
          返回产品列表
        </Link>
      </div>

      <ProductForm mode="create" />
    </section>
  );
}
