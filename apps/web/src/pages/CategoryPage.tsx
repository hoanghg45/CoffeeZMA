import { Suspense } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { categoriesState, productsState, selectedCategoryIdState } from "../state/catalog";
import { ProductItem } from "../components/ProductItem";
import { Section } from "../components/Section";
import { ArrowLeft } from "lucide-react";

function CategoryContent() {
  const categories = useRecoilValue(categoriesState);
  const products = useRecoilValue(productsState);
  const selectedId = useRecoilValue(selectedCategoryIdState);
  const category = categories.find((c) => c.id === selectedId) ?? categories[0];
  const filtered = products.filter((p) =>
    category ? (p.categoryId ?? []).includes(category.id) : true,
  );

  return (
    <Section title={category?.name ?? "Danh mục"}>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}

export default function CategoryPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-black/5 bg-white">
        <button type="button" onClick={() => navigate(-1)} aria-label="Quay lại">
          <ArrowLeft size={22} />
        </button>
        <span className="font-medium">Danh mục</span>
      </header>
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-4 text-sm text-gray-500">Đang tải...</div>}>
          <CategoryContent />
        </Suspense>
      </div>
    </div>
  );
}
