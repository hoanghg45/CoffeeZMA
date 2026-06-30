import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useEffect } from "react";
import { cartState } from "../state/cart";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setCart = useSetRecoilState(cartState);
  const state = location.state as {
    orderId?: string;
    lookupCode?: string;
  } | null;

  useEffect(() => {
    if (!state?.orderId) {
      navigate("/", { replace: true });
      return;
    }
    setCart([]);
  }, [state?.orderId, navigate, setCart]);

  if (!state?.orderId) return null;

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-background">
      <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4">
        ✓
      </div>
      <h1 className="text-xl font-bold mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-600 text-sm mb-1">
        Mã đơn: <strong>{state.orderId}</strong>
      </p>
      {state.lookupCode && (
        <p className="text-gray-600 text-sm mb-6">
          Mã tra cứu: <strong>{state.lookupCode}</strong>
        </p>
      )}
      <p className="text-gray-500 text-sm mb-8">
        Thanh toán COD khi nhận hàng. Cảm ơn bạn!
      </p>
      <Link
        to="/"
        className="px-8 py-3 rounded-full bg-primary text-white font-medium"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
