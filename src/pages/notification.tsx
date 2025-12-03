import React, { FC } from "react";
import { ListRenderer } from "components/list-renderer";
import { useRecoilValue } from "recoil";
import { notificationsState } from "state";
import { Box, Header, Page, Text } from "zmp-ui";
import { Divider } from "components/divider";

const NotificationList: FC = () => {
  const notifications = useRecoilValue(notificationsState);
  
  if (notifications.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center py-16 px-4">
        <Box className="w-20 h-20 rounded-full bg-surfaceVariant flex items-center justify-center mb-4">
          <Text size="xLarge" className="text-gray-400">🔔</Text>
        </Box>
        <Text.Title size="small" className="text-gray-500 mb-2 text-center">
          Chưa có thông báo
        </Text.Title>
        <Text size="small" className="text-gray-400 text-center">
          Các thông báo mới sẽ hiển thị tại đây
        </Text>
      </Box>
    );
  }

  return (
    <Box className="bg-background">
      <ListRenderer
        noDivider
        items={notifications}
        renderLeft={(item) => (
          <Box className="flex-shrink-0">
            <img 
              className="w-14 h-14 rounded-full object-cover shadow-sm border border-divider" 
              src={item.image}
              alt={item.title}
            />
          </Box>
        )}
        renderRight={(item) => (
          <Box key={item.id} className="flex flex-col space-y-1 min-w-0">
            <Text.Header className="font-bold text-primary mb-0.5">
              {item.title}
            </Text.Header>
            {item.content && (
              <Text
                size="small"
                className="text-gray-500 leading-relaxed overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {item.content}
              </Text>
            )}
          </Box>
        )}
        itemClassName="flex space-x-4 p-4 active:bg-surfaceVariant transition-colors duration-200 rounded-lg mx-2 my-1"
      />
    </Box>
  );
};

const NotificationPage: FC = () => {
  return (
    <Page className="bg-background">
      <Header title="Thông báo" showBackIcon={false} />
      <Divider />
      <Box className="py-2">
        <NotificationList />
      </Box>
    </Page>
  );
};

export default NotificationPage;
