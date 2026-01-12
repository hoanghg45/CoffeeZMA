import React, { FC, Suspense } from "react";
import { Section } from "components/section";
import { useRecoilValue } from "recoil";
import { productsState, categoriesState } from "state";
import { Box } from "zmp-ui";
import { ProductItem } from "components/product/item";
import { ProductItemSkeleton } from "components/skeletons";

export const ProductListContent: FC = () => {
  const products = useRecoilValue(productsState);
  const categories = useRecoilValue(categoriesState);

  return (
    <Box className="flex flex-col space-y-1">
      {categories.map((category) => {
        const categoryProducts = products.filter((product) =>
          product.categoryId.includes(category.id)
        );

        if (categoryProducts.length === 0) {
          return null;
        }

        return (
          <Section key={category.id} title={category.name}>
            <Box className="grid grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </Box>
          </Section>
        );
      })}
    </Box>
  );
};

export const ProductListFallback: FC = () => {
  const products = [...new Array(12)];

  return (
    <Section title="Danh sách sản phẩm">
      <Box className="grid grid-cols-2">
        {products.map((_, i) => (
          <ProductItemSkeleton key={i} />
        ))}
      </Box>
    </Section>
  );
};

export const ProductList: FC = () => {
  return (
    <Suspense fallback={<ProductListFallback />}>
      <ProductListContent />
    </Suspense>
  );
};
