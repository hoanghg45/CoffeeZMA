export function formatPhoneNumber(
  phoneNumber: string | null | undefined,
): string {
  if (!phoneNumber) {
    return "";
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length < 9 || digits.length > 11) {
    return phoneNumber;
  }

  let normalized = digits;

  if (digits.startsWith("84") && digits.length === 11) {
    normalized = "0" + digits.substring(2);
  } else if (digits.startsWith("84") && digits.length === 12) {
    normalized = "0" + digits.substring(2);
  } else if (digits.startsWith("0")) {
    normalized = digits;
  } else if (digits.length === 9) {
    normalized = "0" + digits;
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    normalized = "0" + digits;
  }

  if (normalized.length === 10) {
    return `${normalized.substring(0, 4)} ${normalized.substring(4, 7)} ${normalized.substring(7)}`;
  }

  return normalized;
}

export function isValidVietnamesePhone(
  phoneNumber: string | null | undefined,
): boolean {
  if (!phoneNumber) {
    return false;
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("0")) {
    const prefix = digits.substring(0, 2);
    return ["03", "05", "07", "08", "09"].includes(prefix);
  }

  if (digits.length === 11 && digits.startsWith("84")) {
    const prefix = digits.substring(2, 4);
    return ["03", "05", "07", "08", "09"].includes(prefix);
  }

  return false;
}

/** Normalize to E.164 without plus (e.g. 84912345678) for DB lookup keys. */
export function normalizePhoneE164(
  phoneNumber: string | null | undefined,
): string | null {
  if (!phoneNumber || !isValidVietnamesePhone(phoneNumber)) {
    return null;
  }

  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("84") && digits.length === 11) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return "84" + digits.substring(1);
  }

  return null;
}

export function getPhoneDisplayText(
  phoneNumber: string | boolean | null | undefined,
  fallback: string = "Chưa có số điện thoại",
): string {
  if (phoneNumber == null) {
    return fallback;
  }

  if (phoneNumber === false) {
    return fallback;
  }

  if (typeof phoneNumber === "string") {
    return formatPhoneNumber(phoneNumber);
  }

  return fallback;
}
