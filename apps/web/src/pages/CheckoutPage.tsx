import { Suspense, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import {
  validateGuestCheckoutFields,
  getFirstValidationError,
} from "@muoi/core";
import { cartState } from "../state/cart";
import {
  guestNameState,
  guestPhoneState,
  selectedAddressState,
  selectedStoreIdState,
  selectedStoreState,
  selectedDeliveryTimeState,
  shippingServiceState,
  orderNoteState,
  calculatedDeliveryFeeState,
  priceBreakdownState,
} from "../state/checkout";
import { branchesState } from "../state/catalog";
import { DisplayPrice } from "../components/DisplayPrice";
import { getPlatform } from "../platform";

const OPENING_HOUR = 7;
const CLOSING_HOUR = 21;

function formatDeliveryTime(ts: number) {
  if (!ts) return "Chọn thời gian nhận hàng";
  const d = new Date(ts);
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BranchSection() {
  const branches = useRecoilValue(branchesState);
  const [storeId, setStoreId] = useRecoilState(selectedStoreIdState);

  return (
    <select
      id="checkout-store-section"
      value={storeId ?? ""}
      onChange={(e) => setStoreId(e.target.value || null)}
      className="w-full mt-1 p-2 border rounded-lg text-sm"
    >
      <option value="">Chọn cửa hàng</option>
      {branches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name} — {b.address}
        </option>
      ))}
    </select>
  );
}

function CheckoutForm() {
  const navigate = useNavigate();
  const platform = getPlatform();
  const cart = useRecoilValue(cartState);
  const [guestName, setGuestName] = useRecoilState(guestNameState);
  const [guestPhone, setGuestPhone] = useRecoilState(guestPhoneState);
  const [address, setAddress] = useRecoilState(selectedAddressState);
  const [deliveryTime, setDeliveryTime] = useRecoilState(
    selectedDeliveryTimeState,
  );
  const [shippingService, setShippingService] = useRecoilState(
    shippingServiceState,
  );
  const [note, setNote] = useRecoilState(orderNoteState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeLoadable = useRecoilValueLoadable(selectedStoreState);
  const feeLoadable = useRecoilValueLoadable(calculatedDeliveryFeeState);
  const breakdownLoadable = useRecoilValueLoadable(priceBreakdownState);

  const store =
    storeLoadable.state === "hasValue" ? storeLoadable.contents : null;
  const deliveryFee =
    feeLoadable.state === "hasValue" ? feeLoadable.contents : 0;
  const breakdown =
    breakdownLoadable.state === "hasValue"
      ? breakdownLoadable.contents
      : { subtotal: 0, discount: 0, finalPrice: 0, shippingFee: 0 };

  const validation = useMemo(
    () =>
      validateGuestCheckoutFields(
        guestName,
        guestPhone,
        address,
        store,
        deliveryTime,
      ),
    [guestName, guestPhone, address, store, deliveryTime],
  );

  const timeOptions = useMemo(() => {
    const times: { label: string; value: number }[] = [];
    const now = new Date();
    let cursor = new Date();
    if (now.getHours() >= CLOSING_HOUR) {
      cursor.setDate(cursor.getDate() + 1);
    }
    cursor.setHours(Math.max(OPENING_HOUR, now.getHours()), 0, 0, 0);
    if (cursor.getMinutes() > 0) {
      cursor.setMinutes(Math.ceil(cursor.getMinutes() / 30) * 30);
    }
    const end = new Date(cursor);
    end.setHours(CLOSING_HOUR, 0, 0, 0);
    while (cursor <= end && times.length < 20) {
      times.push({
        label: formatDeliveryTime(+cursor),
        value: +cursor,
      });
      cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
    }
    return times;
  }, []);

  const useCurrentLocation = async () => {
    const loc = await platform.getCurrentLocation();
    if (!loc) {
      setError("Không lấy được vị trí. Vui lòng nhập địa chỉ thủ công.");
      return;
    }
    setAddress({
      address: `Vị trí: ${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`,
      lat: loc.latitude,
      long: loc.longitude,
      name: guestName,
      phone: guestPhone,
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (feeLoadable.state === "hasError") {
      setError("Không tính được phí giao hàng. Kiểm tra địa chỉ và cửa hàng.");
      return;
    }
    if (!validation.isValid) {
      setError(getFirstValidationError(validation));
      return;
    }
    if (cart.length === 0) {
      setError("Giỏ hàng trống");
      return;
    }

    setSubmitting(true);
    try {
      const result = await platform.pay({
        amount: breakdown.finalPrice,
        cart,
        customerInfo: {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          address: address!.address,
        },
        fees: {
          subtotal: breakdown.subtotal,
          shipping: deliveryFee,
          discount: breakdown.discount,
          total: breakdown.finalPrice,
        },
        note,
        branchId: store!.id,
        deliveryLat: address!.lat,
        deliveryLng: address!.long,
        shippingServiceId: shippingService,
      });

      navigate("/order/success", {
        state: {
          orderId: result.backendOrderId,
          lookupCode: result.lookupCode,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-sm">Thông tin người nhận</h2>
          <input
            id="checkout-name-section"
            placeholder="Họ tên"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          />
          <input
            id="checkout-phone-section"
            placeholder="Số điện thoại (VD: 0901234567)"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          />
        </section>

        <section id="checkout-address-section" className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-sm">Địa chỉ giao hàng</h2>
          <textarea
            placeholder="Số nhà, đường, quận..."
            value={address?.address ?? ""}
            onChange={(e) =>
              setAddress((prev) => ({
                address: e.target.value,
                lat: prev?.lat ?? 0,
                long: prev?.long ?? 0,
                name: guestName,
                phone: guestPhone,
              }))
            }
            className="w-full p-2 border rounded-lg text-sm min-h-[80px]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Vĩ độ (lat)"
              value={address?.lat || ""}
              onChange={(e) =>
                setAddress((prev) => ({
                  address: prev?.address ?? "",
                  lat: parseFloat(e.target.value) || 0,
                  long: prev?.long ?? 0,
                  name: guestName,
                  phone: guestPhone,
                }))
              }
              className="p-2 border rounded-lg text-sm"
            />
            <input
              type="number"
              step="any"
              placeholder="Kinh độ (lng)"
              value={address?.long || ""}
              onChange={(e) =>
                setAddress((prev) => ({
                  address: prev?.address ?? "",
                  lat: prev?.lat ?? 0,
                  long: parseFloat(e.target.value) || 0,
                  name: guestName,
                  phone: guestPhone,
                }))
              }
              className="p-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-sm text-primary font-medium"
          >
            Dùng vị trí hiện tại
          </button>
        </section>

        <section className="bg-white rounded-xl p-4 space-y-2">
          <h2 className="font-semibold text-sm">Giao từ cửa hàng</h2>
          <Suspense fallback={<p className="text-sm text-gray-400">Đang tải...</p>}>
            <BranchSection />
          </Suspense>
        </section>

        <section className="bg-white rounded-xl p-4 space-y-2">
          <h2 className="font-semibold text-sm">Hình thức giao</h2>
          <select
            value={shippingService}
            onChange={(e) =>
              setShippingService(e.target.value as "SGN-BIKE" | "SGN-ECO")
            }
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="SGN-ECO">Tiết kiệm (SGN-ECO)</option>
            <option value="SGN-BIKE">Nhanh (SGN-BIKE)</option>
          </select>
        </section>

        <section id="checkout-time-section" className="bg-white rounded-xl p-4 space-y-2">
          <h2 className="font-semibold text-sm">Thời gian nhận</h2>
          <select
            value={deliveryTime || ""}
            onChange={(e) => setDeliveryTime(Number(e.target.value))}
            className="w-full p-2 border rounded-lg text-sm"
          >
            <option value="">Chọn thời gian</option>
            {timeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </section>

        <section className="bg-white rounded-xl p-4">
          <textarea
            placeholder="Ghi chú đơn hàng (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm min-h-[60px]"
          />
        </section>

        <section className="bg-white rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <DisplayPrice value={breakdown.subtotal} />
          </div>
          <div className="flex justify-between">
            <span>Phí giao hàng</span>
            {feeLoadable.state === "loading" ? (
              <span className="text-gray-400">Đang tính...</span>
            ) : feeLoadable.state === "hasError" ? (
              <span className="text-red-500 text-xs">Lỗi estimate</span>
            ) : (
              <DisplayPrice value={deliveryFee} />
            )}
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Tổng cộng</span>
            <DisplayPrice value={breakdown.finalPrice} />
          </div>
        </section>

        {error && (
          <p className="text-red-500 text-sm text-center px-2">{error}</p>
        )}
      </div>

      <div className="p-4 border-t bg-white safe-area-bottom">
        <button
          type="button"
          disabled={submitting || cart.length === 0}
          onClick={handleSubmit}
          className="w-full h-12 rounded-full bg-primary text-white font-semibold disabled:opacity-50"
        >
          {submitting ? "Đang xử lý..." : "Đặt hàng COD"}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="shrink-0 px-4 py-3 bg-white border-b">
        <h1 className="text-base font-semibold">Thanh toán</h1>
      </header>
      <CheckoutForm />
    </div>
  );
}
