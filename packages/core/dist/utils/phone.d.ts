export declare function formatPhoneNumber(phoneNumber: string | null | undefined): string;
export declare function isValidVietnamesePhone(phoneNumber: string | null | undefined): boolean;
/** Normalize to E.164 without plus (e.g. 84912345678) for DB lookup keys. */
export declare function normalizePhoneE164(phoneNumber: string | null | undefined): string | null;
export declare function getPhoneDisplayText(phoneNumber: string | boolean | null | undefined, fallback?: string): string;
//# sourceMappingURL=phone.d.ts.map