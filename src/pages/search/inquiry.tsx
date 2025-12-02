import React, { useCallback } from "react";
import { FC } from "react";
import { useRecoilState } from "recoil";
import { keywordState } from "state";
import { Box, Input } from "zmp-ui";
import { debounce } from "lodash";

export const Inquiry: FC = () => {
  const [keyword, setKeyword] = useRecoilState(keywordState);

  const handleChange = useCallback(
    debounce((keyword: string) => {
      setKeyword(keyword);
    }, 500),
    [],
  );

  return (
    <Box
      px={3}
      pt={2}
      pb={3}
      className="bg-white transition-all ease-out flex-none"
    >
      <div
        className="home-search-bar flex items-center"
        style={{
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <Input.Search
          ref={(el) => {
            if (!el?.input?.value) {
              el?.focus();
            }
          }}
          defaultValue={keyword}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Tìm nhanh đồ uống, món mới ..."
          clearable
          allowClear
          className="border-none bg-transparent focus:outline-none w-full h-full"
        />
      </div>
    </Box>
  );
};
