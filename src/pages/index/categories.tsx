import React from "react";
import { FC } from "react";
import { Box, Text } from "zmp-ui";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { categoriesState, selectedCategoryIdState } from "state";
import { useNavigate } from "react-router";
import { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

import { Category } from "types/category";

export const Categories: FC = () => {
  const categories = useRecoilValue(categoriesState);
  const navigate = useNavigate();
  const setSelectedCategoryId = useSetRecoilState(selectedCategoryIdState);

  const chunks = React.useMemo(() => {
    // 2 rows x 4 cols = 8 items per page
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

  return (
    <Box className="bg-white px-4 pt-6 pb-0 rounded-t-2xl relative -mt-3 z-10">
      <Swiper
        modules={[Pagination]}
        pagination={{
          clickable: true,
        }}
        className="category-swiper"
      >
        {chunks.map((chunk, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-4 gap-4">
              {chunk.map((category, i) => (
                <div
                  key={i}
                  onClick={() => gotoCategory(category.id)}
                  className="flex flex-col space-y-2 items-center"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-[#F5F5F5] flex items-center justify-center shadow-sm">
                    {category.image ? (
                      <img className="w-full h-full object-cover" src={category.image} />
                    ) : (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                  </div>
                  <Text size="xxSmall" className="text-gray text-center line-clamp-2 h-8">
                    {category.name}
                  </Text>
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
