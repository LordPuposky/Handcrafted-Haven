import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/data/marketplace";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    min?: string;
    max?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const category = params.category ?? "All";
  const min =
    params.min && params.min.trim() !== "" && !Number.isNaN(Number(params.min))
      ? Number(params.min)
      : 0;
  const max =
    params.max && params.max.trim() !== "" && !Number.isNaN(Number(params.max))
      ? Number(params.max)
      : Number.POSITIVE_INFINITY;
  const [normalizedMin, normalizedMax] =
    min <= max ? [min, max] : [max, min];
  const sort = params.sort ?? "featured";

  const filtered = products
    .filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice =
        product.price >= normalizedMin && product.price <= normalizedMax;

      return matchesQuery && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }

      if (sort === "price-desc") {
        return b.price - a.price;
      }

      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

  return (
    <section className="section-block">
      <h1>Handcrafted product catalog</h1>
      <p>
        Browse by category, price range, and keyword to find the perfect item.
      </p>

      <form className="filters" role="search" aria-label="Product filters">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Ex: vase, bag, notebook"
          />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={category}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="min">Minimum price (R$)</label>
          <input
            id="min"
            name="min"
            type="number"
            min={0}
            step={1}
            defaultValue={params.min ?? ""}
          />
        </div>

        <div className="field">
          <label htmlFor="max">Maximum price (R$)</label>
          <input
            id="max"
            name="max"
            type="number"
            min={0}
            step={1}
            defaultValue={params.max ?? ""}
          />
        </div>

        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="featured">Featured</option>
            <option value="price-asc">Lowest price</option>
            <option value="price-desc">Highest price</option>
          </select>
        </div>

        <button className="btn-primary" type="submit">
          Apply filters
        </button>
      </form>

      <p aria-live="polite">{filtered.length} product(s) found</p>
      <div className="product-grid product-grid-catalog">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
