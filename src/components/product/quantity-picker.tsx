import React, { FC } from "react";
import { Box, Button, Text } from "zmp-ui";
import { Minus, Plus } from "lucide-react";

export const QuantityPicker: FC<{
  value: number;
  onChange: (quantity: number) => void;
}> = ({ value, onChange }) => {
  return (
    <Box flex className="border border-[#e9ebed] rounded-full p-[6px]">
      <Button
        disabled={value < 1}
        onClick={() => onChange(value - 1)}
        variant="secondary"
        type="neutral"
        icon={<Minus size={20} />}
      />
      <Box flex justifyContent="center" alignItems="center" className="flex-1 px-3">
        <Text size="large" className="font-medium">
          {value}
        </Text>
      </Box>
      <Button
        onClick={() => onChange(value + 1)}
        variant="secondary"
        type="neutral"
        icon={<Plus size={20} />}
      />
    </Box>
  );
};
