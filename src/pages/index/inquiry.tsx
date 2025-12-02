import React from "react";
import { FC } from "react";
import { Box, Input, useNavigate } from "zmp-ui";

export const Inquiry: FC = () => {
  const navigate = useNavigate();
  return (
    <Box px={3} pt={2} pb={3} className="bg-background">
      <div
        className="home-search-bar flex items-center"
        onClick={() => navigate("/search")}
        style={{
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <Input.Search
          className="border-none bg-transparent focus:outline-none w-full h-full"
          placeholder="Tìm nhanh đồ uống, món mới ..."
          readOnly
        />
      </div>
    </Box>
  );
};
