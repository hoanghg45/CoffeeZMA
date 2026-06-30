import { Home, Bell, User, Search } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { CartNavLink } from "./CartNavLink";

const tabs = [
  { path: "/", label: "Trang chủ", icon: Home },
  { path: "/notification", label: "Thông báo", icon: Bell },
  { path: "/cart", label: "Giỏ hàng", component: CartNavLink },
  { path: "/profile", label: "Cá nhân", icon: User },
] as const;

const HIDDEN_ON = ["/search", "/category", "/checkout", "/order/success"];

export function Navigation() {
  const { pathname } = useLocation();

  if (HIDDEN_ON.includes(pathname)) {
    return null;
  }

  return (
    <nav className="shrink-0 border-t border-black/10 bg-white safe-area-bottom">
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.path}>
            {"component" in tab ? (
              <tab.component />
            ) : (
              <NavLink
                to={tab.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 text-xs ${
                    isActive ? "text-primary font-medium" : "text-gray-500"
                  }`
                }
              >
                <tab.icon size={22} strokeWidth={1.75} />
                <span className="mt-1">{tab.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SearchFab() {
  return (
    <NavLink
      to="/search"
      className="absolute top-4 right-4 z-10 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg"
      aria-label="Tìm kiếm"
    >
      <Search size={22} />
    </NavLink>
  );
}
