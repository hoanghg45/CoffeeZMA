import { Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { cartState, totalQuantityState } from "../state/cart";
import { CartItemRow } from "../components/cart/CartItemRow";

function CartContent() {
  const [cart, setCart] = useRecoilState(cartState);
  const quantity = useRecoilValue(totalQuantityState);
  const navigate = useNavigate();

  if (quantity === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <p className="text-gray-500 mb-4">Giỏ hàng trống</p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-primary text-white font-medium"
        >
          Xem thực đơn
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item, index) => (
          <CartItemRow
            key={`${item.product.id}-${index}`}
            item={item}
            onIncrease={() =>
              setCart((c) =>
                c.map((ci, i) =>
                  i === index ? { ...ci, quantity: ci.quantity + 1 } : ci,
                ),
              )
            }
            onDecrease={() =>
              setCart((c) =>
                c
                  .map((ci, i) =>
                    i === index ? { ...ci, quantity: ci.quantity - 1 } : ci,
                  )
                  .filter((ci) => ci.quantity > 0),
              )
            }
            onRemove={() =>
              setCart((c) => c.filter((_, i) => i !== index))
            }
          />
        ))}
      </div>
      <div className="p-4 border-t bg-white safe-area-bottom">
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="w-full h-12 rounded-full bg-primary text-white font-semibold"
        >
          Tiếp tục đặt hàng ({quantity} món)
        </button>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="shrink-0 px-4 py-3 bg-white border-b">
        <h1 className="text-base font-semibold">Giỏ hàng</h1>
      </header>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Đang tải...
          </div>
        }
      >
        <CartContent />
      </Suspense>
    </div>
  );
}
