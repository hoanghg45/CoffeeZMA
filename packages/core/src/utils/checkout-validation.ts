import type {
  CheckoutAddress,
  GuestCheckoutAddress,
  Store,
} from "../types/delivery";
import { isValidVietnamesePhone } from "./phone";

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: {
    address: boolean;
    phone: boolean;
    store: boolean;
    time: boolean;
    name?: boolean;
  };
}

export function validateCheckoutFields(
  address: CheckoutAddress | null,
  phone: string | boolean,
  store: Store | null,
  deliveryTime: number | null,
): CheckoutValidationResult {
  const errors: string[] = [];
  const missingFields = {
    address: false,
    phone: false,
    store: false,
    time: false,
  };

  if (!address || !address.address || !address.address.trim()) {
    errors.push("Vui lòng chọn địa chỉ giao hàng");
    missingFields.address = true;
  }

  if (
    phone === false ||
    (typeof phone === "string" && (!phone || !phone.trim()))
  ) {
    errors.push("Vui lòng cung cấp số điện thoại người nhận");
    missingFields.phone = true;
  }

  if (!store) {
    errors.push("Vui lòng chọn cửa hàng");
    missingFields.store = true;
  }

  if (!deliveryTime || deliveryTime <= 0) {
    errors.push("Vui lòng chọn thời gian nhận hàng");
    missingFields.time = true;
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
  };
}

export function getFirstValidationError(
  validation: CheckoutValidationResult,
): string | null {
  if (validation.isValid) {
    return null;
  }
  return (
    validation.errors[0] || "Vui lòng điền đầy đủ thông tin trước khi đặt hàng"
  );
}

/** Guest web checkout — validates name + Vietnamese phone in addition to delivery fields. */
export function validateGuestCheckoutFields(
  name: string,
  phone: string,
  address: GuestCheckoutAddress | CheckoutAddress | null,
  store: Store | null,
  deliveryTime: number | null,
): CheckoutValidationResult {
  const base = validateCheckoutFields(address, phone, store, deliveryTime);
  const errors = [...base.errors];
  const missingFields = { ...base.missingFields, name: false };

  if (!name || !name.trim()) {
    errors.push("Vui lòng nhập tên người nhận");
    missingFields.name = true;
  }

  if (phone && typeof phone === "string" && phone.trim() && !isValidVietnamesePhone(phone)) {
    errors.push("Số điện thoại không hợp lệ");
    missingFields.phone = true;
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
  };
}
