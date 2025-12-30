import React, { FC, useState, Suspense } from "react";
import { Box, Header, Page, Text, Sheet, useNavigate } from "zmp-ui";
import { User, ChevronRight, MapPin, Clock, Star, Phone } from "lucide-react";
import subscriptionDecor from "static/subscription-decor.svg";
import { ListRenderer } from "components/list-renderer";
import { useToBeImplemented } from "hooks";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { userState } from "state";
import { AddressPicker } from "components/address-picker";

const Subscription: FC = () => {
  // Suspense might be needed here too if userState suspends, but it's usually handled by RecoilRoot or upper bounds. 
  // However, for safety, we can wrap usage in components or rely on error boundaries.
  // Since we are in a Page, let's rely on the userState being loaded or suspended at Page level if we don't wrap.
  // BUT, ProfilePage is rendered directly.

  // Actually, safe to assume userState loads fast or we use Loadable.
  // But let's check if userState suspends. Yes it does (async).
  // So we should wrap the content of Subscription or the whole component call.
  const user = useRecoilValue(userState);

  return (
    <Box className="m-4">
      <Box
        className="bg-green text-white rounded-xl p-4 space-y-2"
        style={{
          backgroundImage: `url(${subscriptionDecor})`,
          backgroundPosition: "right 8px center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Text.Title className="font-bold">{user.name}</Text.Title>
        <Text size="xxSmall">Thành viên</Text>
      </Box>
    </Box>
  );
};

const Personal: FC = () => {
  const navigate = useNavigate();
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);

  return (
    <Box className="m-4">
      <ListRenderer
        title="Cá nhân"
        items={[
          {
            left: <User size={24} />,
            right: (
              <Box flex>
                <Text.Header className="flex-1 items-center font-normal">
                  Thông tin tài khoản
                </Text.Header>
                <ChevronRight size={24} />
              </Box>
            ),
          },
          {
            left: <MapPin size={24} />,
            right: (
              <Box flex onClick={() => setAddressSheetVisible(true)}>
                <Text.Header className="flex-1 items-center font-normal">
                  Sổ địa chỉ
                </Text.Header>
                <ChevronRight size={24} />
              </Box>
            ),
          },
          {
            left: <Clock size={24} />,
            right: (
              <Box flex onClick={() => navigate("/order-history")}>
                <Text.Header className="flex-1 items-center font-normal">
                  Lịch sử đơn hàng
                </Text.Header>
                <ChevronRight size={24} />
              </Box>
            ),
          },
        ]}
        renderLeft={(item) => item.left}
        renderRight={(item) => item.right}
      />

      <Sheet
        visible={addressSheetVisible}
        onClose={() => setAddressSheetVisible(false)}
        mask
        swipeToClose
        height="auto"
        title="Quản lý địa chỉ"
      >
        <Box className="p-4 pb-8">
          <Suspense fallback={<Box className="p-4 text-center">Đang tải...</Box>}>
            <AddressPicker />
          </Suspense>
        </Box>
      </Sheet>
    </Box>
  );
};

const ProfilePage: FC = () => {
  return (
    <Page>
      <Header showBackIcon={false} title="&nbsp;" />
      <Suspense fallback={<Box className="p-4">Đang tải thông tin...</Box>}>
        <Subscription />
      </Suspense>
      <Personal />
    </Page>
  );
};

export default ProfilePage;
