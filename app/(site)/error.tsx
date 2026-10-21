"use client";
import { useSiteCopy } from "@/components/site/copy-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const copy = useSiteCopy();
  return (
    <main className="brand-subpage">
      <section className="site-section">
        <div className="site-container">
          <h1>{copy["error.loadTitle"]}</h1>
          <p>{copy["error.loadBody"]}</p>
          <button className="site-button site-button-primary" onClick={reset}>
            {copy["error.retry"]}
          </button>
        </div>
      </section>
    </main>
  );
}
