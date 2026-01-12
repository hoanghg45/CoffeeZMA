import React, { FC } from "react";
import { Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Icon } from "zmp-ui";
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
    <Box className="bg-white relative" pb={0}>
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
          <SwiperSlide key={banner.id || i} className="px-0">
            <Box
              className="w-full aspect-[2/1] bg-cover bg-center bg-skeleton"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
              onClick={() => handleBannerClick(banner.link)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Box
        className="absolute top-4 right-4 z-10 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg"
        onClick={() => navigate("/search")}
      >
        <Icon icon="zi-search" size={24} />
      </Box>
    </Box>
  );
};
