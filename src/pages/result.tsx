import React, { FC, ReactNode, useEffect, useState } from "react";
import { Box, Button, Header, Page, Text, useNavigate } from "zmp-ui";
import {
  AsyncCallbackFailObject,
  CheckTransactionReturns,
  Payment,
  events,
  EventName,
} from "zmp-sdk";
import { useLocation } from "react-router";
import { useResetRecoilState } from "recoil";
import { cartState } from "state";
import {
  IconPaymentFail,
  IconPaymentLoading,
  IconPaymentSuccess,
} from "components/payment-icon";

interface RenderResultProps {
  title?: string;
  message: string;
  icon: ReactNode;
}

const CheckoutResultPage: FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [paymentResult, setPaymentResult] = useState<
    CheckTransactionReturns | AsyncCallbackFailObject
  >();

  useEffect(() => {
    let timeout;

    const check = (eventData?: any) => {
      let data = state;

      // 1. Priority: Event Data (from OpenApp event)
      if (eventData && eventData.path) {
        // Extract query params from path
        const queryString = eventData.path.split('?')[1];
        if (queryString) {
          data = queryString;
          console.log("Using OpenApp data:", data);
        }
      }
      // 2. Fallback: State (if valid)
      else if (data) {
        if ("appTransID" in data || "orderId" in data) {
          data = {
            appTransID: data.appTransID,
            orderId: data.orderId
          };
        } else if ("path" in data) {
          data = data.path;
        } else if ("data" in data) {
          data = data.data;
        }
      }
      // 3. Fallback: Current URL Query Params
      else {
        data = window.location.search.slice(1);
      }

      console.log("Checking transaction with data:", data);

      if (!data) {
        console.warn("No data for checkTransaction");
        return;
      }

      Payment.checkTransaction({
        data,
        success: (rs) => {
          setPaymentResult(rs);
          if (rs.resultCode === 0) {
            timeout = setTimeout(() => check(eventData), 3000);
          }
        },
        fail: (err) => {
          setPaymentResult(err);
        },
      });
    };

    // Initial check (in case we already have params)
    check();

    // Listen for OpenApp event (when payment closes)
    const onOpenApp = (data) => {
      console.log("OpenApp event received:", data);
      check(data);
    };
    events.on(EventName.OpenApp, onOpenApp);

    // Listen for PaymentClose event (Momo / Manual Close behavior)
    const onPaymentClose = (data: any = {}) => {
      console.log("PaymentClose event received:", data);
      const { resultCode } = data;

      if (resultCode === 0) {
        // Processing: Verify transaction again
        console.log("PaymentClose: Processing... Verifying transaction...");
        // If we have zmpOrderId, we can check.
        // But checkTransaction expects 'data' object or string.
        // Docs say: Payment.checkTransaction({ data: { zmpOrderId: ... } })
        if (data.zmpOrderId) {
          Payment.checkTransaction({
            data: { zmpOrderId: data.zmpOrderId },
            success: (rs) => setPaymentResult(rs),
            fail: (err) => setPaymentResult(err)
          });
        } else {
          // Fallback to generic check
          check();
        }
      } else {
        // Final Result (Success/Fail) directly from event
        setPaymentResult(data);
      }
    };
    events.on(EventName.PaymentClose, onPaymentClose);

    return () => {
      clearTimeout(timeout);
      events.off(EventName.OpenApp, onOpenApp);
      events.off(EventName.PaymentClose, onPaymentClose);
    };
  }, []);

  const clearCart = useResetRecoilState(cartState);
  useEffect(() => {
    // Only clear cart if payment is strictly SUCCESS (1).
    // Do not clear on Pending (0) or Fail (-1) to allow retry.
    if (paymentResult?.resultCode === 1) {
      clearCart();
    }
  }, [paymentResult]);

  return (
    <Page className="flex flex-col bg-white">
      <Header title="Kết quả thanh toán" />
      {(function (render: (result: RenderResultProps) => ReactNode) {
        if (paymentResult && paymentResult.resultCode) {
          if (paymentResult.resultCode === 1) {
            return render({
              title: "Thanh toán thành công",
              message: `Đơn hàng của bạn đã được thanh toán thành công. Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.`,
              icon: <IconPaymentSuccess />,
            });
          } else {
            return render({
              title: "Thanh toán thất bại",
              message: `Có lỗi trong quá trình xử lý, vui lòng kiểm tra lại hoặc liên hệ Shop để được hỗ trợ`,
              icon: <IconPaymentFail />,
            });
          }
        }
        return render({
          message: `Hệ thống đang xử lý thanh toán, vui lòng chờ trong ít phút...`,
          icon: <IconPaymentLoading />,
        });
      })(({ title, message, icon }: RenderResultProps) => (
        <Box className="p-6 space-y-3 flex-1 flex flex-col justify-center items-center text-center">
          <div className="p-4">{icon}</div>
          {title && (
            <Text size="xLarge" className="font-medium">
              {title}
            </Text>
          )}
          <Text className="text-[#6F7071]">{message}</Text>
        </Box>
      ))}
      {paymentResult && (
        <div className="p-4">
          <Button fullWidth onClick={() => navigate("/", { replace: true })}>
            {paymentResult.resultCode === 1 ? "Hoàn tất" : "Đóng"}
          </Button>
        </div>
      )}
    </Page>
  );
};

export default CheckoutResultPage;
