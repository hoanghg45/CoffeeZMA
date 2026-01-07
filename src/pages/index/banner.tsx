import React, { FC } from "react";
import { Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { bannersState } from "state";
import { useNavigate } from "react-router";
import { openWebview } from "zmp-sdk";

export const Banner: FC = () => {
  const banners = useRecoilValue(bannersState);
  const navigate = useNavigate();

  const handleBannerClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith("http")) {
      openWebview({ url: link });
    } else {
      navigate(link);
    }
  };

  return (
    <Box className="bg-white" pb={4}>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop
        speed={800}
        touchEventsTarget="container"
      >
        {banners.map((banner, i) => (
          <SwiperSlide key={banner.id || i} className="px-4">
            <Box
              className="w-full rounded-lg aspect-[2/1] bg-cover bg-center bg-skeleton"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
              onClick={() => handleBannerClick(banner.link)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
