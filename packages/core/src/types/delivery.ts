export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  phone?: string;
}

export interface CheckoutAddress {
  address: string;
}

/** Full delivery address for guest web checkout (maps to ZMA CustomerAddress subset). */
export interface GuestCheckoutAddress {
  address: string;
  lat: number;
  long: number;
  name?: string;
  phone?: string;
}
