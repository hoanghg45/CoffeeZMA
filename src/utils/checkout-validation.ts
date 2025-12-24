import { CustomerAddress } from "services/customer";
import { Store } from "types/delivery";

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: {
    address: boolean;
    phone: boolean;
    store: boolean;
    time: boolean;
  };
}

/**
 * Validates all required checkout fields before proceeding to payment
 */
export function validateCheckoutFields(
  address: CustomerAddress | null,
  phone: string | boolean,
  store: Store | null,
  deliveryTime: number | null
): CheckoutValidationResult {
  const errors: string[] = [];
  const missingFields = {
    address: false,
    phone: false,
    store: false,
    time: false,
  };

  // Validate address
  if (!address || !address.address || !address.address.trim()) {
    errors.push("Vui lòng chọn địa chỉ giao hàng");
    missingFields.address = true;
  }

  // Validate phone number
  // phoneState returns string | boolean, where false means not requested/available
  if (
    phone === false ||
    (typeof phone === "string" && (!phone || !phone.trim()))
  ) {
    errors.push("Vui lòng cung cấp số điện thoại người nhận");
    missingFields.phone = true;
  }

  // Validate store
  if (!store) {
    errors.push("Vui lòng chọn cửa hàng");
    missingFields.store = true;
  }

  // Validate delivery time
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

/**
 * Gets a user-friendly error message for the first missing field
 */
export function getFirstValidationError(
  validation: CheckoutValidationResult
): string | null {
  if (validation.isValid) {
    return null;
  }
  return validation.errors[0] || "Vui lòng điền đầy đủ thông tin trước khi đặt hàng";
}

