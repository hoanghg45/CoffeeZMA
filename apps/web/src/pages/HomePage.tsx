import { Suspense, useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import type { Category } from "@muoi/core";
import { getPlatform } from "../platform";
import {
  bannersState,
  categoriesState,
  productsState,
  selectedCategoryIdState,
} from "../state/catalog";
import { Section } from "../components/Section";
import { ProductItem } from "../components/ProductItem";
import { SearchFab } from "../components/Navigation";

function WelcomeHeader() {
  return (
    <header className="shrink-0 px-4 py-3 bg-white border-b border-black/5">
      <h1 className="text-base font-semibold">Muối Coffee & Tea</h1>
    </header>
  );
}

function BannerCarousel() {
  const banners = useRecoilValue(bannersState);
  const navigate = useNavigate();
  const platform = getPlatform();

  const handleClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith("http")) {
      platform.openExternal(link);
    } else {
      navigate(link);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="bg-white relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={banners.length > 1}
        speed={800}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <button
              type="button"
              className="block w-full aspect-[2/1] bg-skeleton bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
              onClick={() => handleClick(banner.link)}
              aria-label={banner.title ?? "Banner"}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <SearchFab />
    </div>
  );
}

function CategoryGrid() {
  const categories = useRecoilValue(categoriesState);
  const navigate = useNavigate();
  const setSelectedCategoryId = useSetRecoilState(selectedCategoryIdState);

  const chunks = useMemo(() => {
    const size = 8;
    const result: Category[][] = [];
    for (let i = 0; i < categories.length; i += size) {
      result.push(categories.slice(i, i + size));
    }
    return result;
  }, [categories]);

  const gotoCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    navigate("/category");
  };

  if (categories.length === 0) return null;

  return (
    <div className="bg-white px-4 pt-6 pb-2 rounded-t-2xl relative -mt-3 z-10">
      <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="category-swiper">
        {chunks.map((chunk, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-4 gap-4">
              {chunk.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => gotoCategory(category.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-[#F5F5F5] flex items-center justify-center shadow-sm">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-center text-gray-600 line-clamp-2 h-8">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function ProductListContent() {
  const products = useRecoilValue(productsState);
  const categories = useRecoilValue(categoriesState);

  return (
    <div className="flex flex-col space-y-1 pb-6">
      {categories.map((category) => {
        const categoryProducts = products.filter((p) =>
          (p.categoryId ?? []).includes(category.id),
        );
        if (categoryProducts.length === 0) return null;

        return (
          <Section key={category.id} title={category.name}>
            <div className="grid grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

function ProductListFallback() {
  return (
    <Section title="Đang tải sản phẩm...">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-skeleton animate-pulse" />
        ))}
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <WelcomeHeader />
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="h-40 bg-skeleton animate-pulse m-4 rounded-xl" />}>
          <BannerCarousel />
        </Suspense>
        <Suspense fallback={null}>
          <CategoryGrid />
        </Suspense>
        <div className="h-px bg-black/5 my-2" />
        <Suspense fallback={<ProductListFallback />}>
          <ProductListContent />
        </Suspense>
      </div>
    </div>
  );
}
