import type { ReactElement } from "react";

export function LoadingCards({ label = "در حال دریافت اطلاعات…" }: { readonly label?: string }): ReactElement {
  return (
    <div className="product-loading" role="status">
      <span className="sr-only">{label}</span>
      <div className="product-loading-grid" aria-hidden="true">
        {[0, 1, 2].map((slot) => <div className="product-loading-card" key={slot}><div /><span /><span /><span /></div>)}
      </div>
    </div>
  );
}
