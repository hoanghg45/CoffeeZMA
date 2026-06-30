import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/search" element={<PlaceholderPage title="Tìm kiếm" />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/success" element={<OrderSuccessPage />} />
              <Route path="/notification" element={<PlaceholderPage title="Thông báo" />} />
              <Route path="/profile" element={<PlaceholderPage title="Cá nhân" />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </RecoilRoot>
  );
}
