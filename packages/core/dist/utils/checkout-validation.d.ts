import type { CheckoutAddress, GuestCheckoutAddress, Store } from "../types/delivery";
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
export declare function validateCheckoutFields(address: CheckoutAddress | null, phone: string | boolean, store: Store | null, deliveryTime: number | null): CheckoutValidationResult;
export declare function getFirstValidationError(validation: CheckoutValidationResult): string | null;
/** Guest web checkout — validates name + Vietnamese phone in addition to delivery fields. */
export declare function validateGuestCheckoutFields(name: string, phone: string, address: GuestCheckoutAddress | CheckoutAddress | null, store: Store | null, deliveryTime: number | null): CheckoutValidationResult;
//# sourceMappingURL=checkout-validation.d.ts.map