import React, { FC, MouseEventHandler, ReactNode } from "react";
import { Box, Text } from "zmp-ui";
import { ChevronRight } from "lucide-react";

export interface ListItemProps {
  title: ReactNode;
  subtitle: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const ListItem: FC<ListItemProps> = ({ title, subtitle, onClick }) => {
  return (
    <Box flex className="space-x-2" onClick={onClick}>
      <Box className="flex-1 space-y-[2px]">
        <Text size="small" className="font-medium text-sm text-gray-800">
          {title}
        </Text>
        <Text size="xSmall" className="text-gray">
          {subtitle}
        </Text>
      </Box>
      <ChevronRight className="text-gray-400" size={24} />
    </Box>
  );
};
