import { getSiteCopy } from "@/lib/site-copy";
import Link from "next/link";
export default async function NotFound() {
  const copy = await getSiteCopy();
  return (
    <main className="brand-subpage">
      <section className="site-section">
        <div className="site-container narrow-copy">
          <p className="site-eyebrow">{copy["error.eyebrow"]}</p>
          <h1>{copy["error.notFoundTitle"]}</h1>
          <p>{copy["error.notFoundBody"]}</p>
          <div className="hero-actions">
            <Link
              className="site-button site-button-primary"
              href="/hufuzhishi"
            >
              {copy["nav.care"]}
            </Link>
            <Link className="site-button site-button-outline" href="/chanpin">
              {copy["common.viewProducts"]}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
