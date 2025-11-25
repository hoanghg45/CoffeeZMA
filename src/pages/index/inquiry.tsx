import React from "react";
import { FC } from "react";
import { Box, Input, useNavigate } from "zmp-ui";

export const Inquiry: FC = () => {
  const navigate = useNavigate();
  return (
    <Box p={4} className="bg-background">
      <div
        className="bg-surface rounded-full shadow-sm p-1 flex items-center border border-divider"
        onClick={() => navigate("/search")}
      >
        <Input.Search
          className="border-none bg-transparent focus:outline-none w-full"
          placeholder="Tìm nhanh đồ uống, món mới ..."
          readOnly
        />
      </div>
    </Box>
  );
};
