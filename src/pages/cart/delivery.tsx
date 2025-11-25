import { ElasticTextarea } from "components/elastic-textarea";
import { ListRenderer } from "components/list-renderer";
import React, { FC, Suspense } from "react";
import { Box, Icon, Input, Text } from "zmp-ui";
import { PersonPicker, RequestPersonPickerPhone } from "./person-picker";
import { RequestStorePickerLocation, StorePicker } from "./store-picker";
import { TimePicker } from "./time-picker";
import { useRecoilState } from "recoil";
import { orderNoteState } from "state";

export const Delivery: FC = () => {
  const [note, setNote] = useRecoilState(orderNoteState);

  return (
    <Box className="space-y-3 px-4">
      <Text.Header>Hình thức nhận hàng</Text.Header>
      <ListRenderer
        items={[
          {
            left: <Icon icon="zi-location" className="my-auto text-primary" />,
            right: (
              <Suspense fallback={<RequestStorePickerLocation />}>
                <StorePicker />
              </Suspense>
            ),
          },
          {
            left: <Icon icon="zi-clock-1" className="my-auto text-primary" />,
            right: (
              <Box flex className="space-x-2">
                <Box className="flex-1 space-y-[2px]">
                  <TimePicker />
                  <Text size="xSmall" className="text-outline">
                    Thời gian nhận hàng
                  </Text>
                </Box>
                <Icon icon="zi-chevron-right" />
              </Box>
            ),
          },
          {
            left: <Icon icon="zi-user" className="my-auto text-primary" />,
            right: <RequestPersonPickerPhone />,
          },
          {
            left: <Icon icon="zi-note" className="my-auto text-primary" />,
            right: (
              <Box flex>
                <ElasticTextarea
                  placeholder="Nhập ghi chú..."
                  className="border-none px-0 w-full focus:outline-none bg-transparent"
                  maxRows={4}
                  value={note}
                  onChange={(e) => setNote(e.currentTarget.value)}
                />
              </Box>
            ),
          },
        ]}
        limit={4}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
        noDivider
        className="space-y-3"
        itemClassName="p-3 bg-surface rounded-lg border border-divider shadow-sm flex items-center space-x-3"
      />
    </Box>
  );
};
