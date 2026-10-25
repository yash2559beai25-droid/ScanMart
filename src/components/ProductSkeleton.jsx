// ProductSkeleton — placeholder cards shown only while products are loading.
// The layout matches ScanMart product cards so the page does not jump.

function ProductSkeleton() {
  return (
    <article className="card product-card product-skeleton" aria-hidden="true">
      <div className="skeleton-block skeleton-image" />
      <div className="product-body">
        <div className="skeleton-block skeleton-line short" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line medium" />
        <div className="skeleton-block skeleton-line tiny" />
      </div>
    </article>
  );
}

export default ProductSkeleton;
