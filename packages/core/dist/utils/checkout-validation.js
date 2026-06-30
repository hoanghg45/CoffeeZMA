"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCheckoutFields = validateCheckoutFields;
exports.getFirstValidationError = getFirstValidationError;
exports.validateGuestCheckoutFields = validateGuestCheckoutFields;
const phone_1 = require("./phone");
function validateCheckoutFields(address, phone, store, deliveryTime) {
    const errors = [];
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
    if (phone === false ||
        (typeof phone === "string" && (!phone || !phone.trim()))) {
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
function getFirstValidationError(validation) {
    if (validation.isValid) {
        return null;
    }
    return (validation.errors[0] || "Vui lòng điền đầy đủ thông tin trước khi đặt hàng");
}
/** Guest web checkout — validates name + Vietnamese phone in addition to delivery fields. */
function validateGuestCheckoutFields(name, phone, address, store, deliveryTime) {
    const base = validateCheckoutFields(address, phone, store, deliveryTime);
    const errors = [...base.errors];
    const missingFields = { ...base.missingFields, name: false };
    if (!name || !name.trim()) {
        errors.push("Vui lòng nhập tên người nhận");
        missingFields.name = true;
    }
    if (phone && typeof phone === "string" && phone.trim() && !(0, phone_1.isValidVietnamesePhone)(phone)) {
        errors.push("Số điện thoại không hợp lệ");
        missingFields.phone = true;
    }
    return {
        isValid: errors.length === 0,
        errors,
        missingFields,
    };
}
