import { FinalPrice } from "components/display/final-price";
import React, { FC } from "react";
import { Product } from "types/product";
import { Box, Text } from "zmp-ui";
import { ProductPicker } from "./picker";

export const ProductItem: FC<{ product: Product }> = ({ product }) => {
  return (
    <ProductPicker product={product}>
      {({ open }) => (
        <div className="space-y-3 p-3 bg-surface rounded-lg active:bg-surfaceVariant transition-colors duration-200" onClick={open}>
          <Box className="w-full aspect-square relative">
            <img
              loading="lazy"
              src={product.image}
              className="absolute left-0 right-0 top-0 bottom-0 w-full h-full object-cover object-center rounded-md bg-skeleton shadow-sm"
            />
          </Box>
          <div className="space-y-1">
            <Text size="normal" className="font-medium text-onSurface">{product.name}</Text>
            <Text size="xxSmall" className="text-onSurfaceVariant pb-1">
              <FinalPrice>{product}</FinalPrice>
            </Text>
          </div>
        </div>
      )}
    </ProductPicker>
  );
};
