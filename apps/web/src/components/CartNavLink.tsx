import { useRecoilValue } from "recoil";
import { NavLink } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { totalQuantityState } from "../state/cart";

export function CartNavLink() {
  const quantity = useRecoilValue(totalQuantityState);

  return (
    <NavLink
      to="/cart"
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center py-2 text-xs ${
          isActive ? "text-primary font-medium" : "text-gray-500"
        }`
      }
    >
      <ShoppingBag size={22} strokeWidth={1.75} />
      {quantity > 0 && (
        <span className="absolute top-1 right-[calc(50%-18px)] min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
          {quantity > 99 ? "99+" : quantity}
        </span>
      )}
      <span className="mt-1">Giỏ hàng</span>
    </NavLink>
  );
}
