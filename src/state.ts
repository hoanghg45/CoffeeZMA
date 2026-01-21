import { atom, selector, selectorFamily } from "recoil";
import { getCurrentPhoneNumber, getCurrentUserInfo } from "services/user-info";
import { getCurrentLocation } from "services/location";
import logo from "static/muoi-squarelogo.png";
import { Product } from "types/product";
import { Cart } from "types/cart";
import { Notification } from "types/notification";
import { Store } from "types/delivery";
import { Voucher, PriceBreakdown as PriceBreakdownType } from "types/voucher";
import { calculateDistance } from "utils/location";
import { calcFinalPrice } from "utils/product";
import { calculatePriceBreakdown } from "utils/pricing";
import { wait } from "utils/async";
import { getCategories } from "services/category";
import { getBanners } from "services/banner";
import { Banner } from "types/banner";
import { getProducts } from "services/product";
import { getVariants } from "services/variant";
import { estimateFee } from "services/ahamove";

import { getBranches } from "services/branch";
import { getVoucherByCode, validateVoucher } from "services/voucher";
import { getCustomerByZaloId, createCustomer, CustomerProfile, getCustomerAddresses, CustomerAddress } from "services/customer";
import { calculateEarnedPoints, calculateRedeemValue, canRedeem } from "utils/loyalty";
import appConfig from "../app-config.json";

export const userState = selector({
  key: "user",
  get: async () => {
    const userInfo = await getCurrentUserInfo({ autoRequestPermission: true });

    if (!userInfo) {
      throw new Error("Failed to get user info");
    }

    // Removed ensureUserExists - we don't want to create 'STAFF' users for customers anymore
    // The customerProfileState will handle creating 'Customer' records
    return userInfo;
  },
});

export const customerProfileState = selector<CustomerProfile | null>({
  key: "customerProfile",
  get: async ({ get }) => {
    try {
      const user = get(userState);
      if (!user || !user.id) {
        console.warn("[customerProfileState] No user available");
        return null;
      }

      console.log("[customerProfileState] Loading profile for user:", user.id);

      // Try to get existing customer
      let customer = await getCustomerByZaloId(user.id);

      // If not found, create them
      if (!customer) {
        console.log("[customerProfileState] Creating new customer");
        customer = await createCustomer(user.id, user.name, user.avatar);
      }

      console.log("[customerProfileState] Profile loaded:", customer);
      return customer;
    } catch (error) {
      console.error("[customerProfileState] Error loading profile:", error);
      // Return null instead of throwing to prevent blocking the UI
      return null;
    }
  },
});


export const loyaltyPromptState = atom<boolean>({
  key: "loyaltyPrompt",
  default: false, // false = not dismissed (show if eligible), true = dismissed
  effects: [
    ({ setSelf, onSet }) => {
      const saved = localStorage.getItem("loyaltyPromptDismissed");
      if (saved != null) {
        setSelf(saved === "true");
      }

      onSet((newValue, _, isReset) => {
        if (isReset) {
          localStorage.removeItem("loyaltyPromptDismissed");
        } else {
          localStorage.setItem("loyaltyPromptDismissed", String(newValue));
        }
      });
    },
  ],
});

export const categoriesState = selector({
  key: "categories",
  get: async () => {
    return await getCategories();
  },
});

export const bannersState = selector<Banner[]>({
  key: "banners",
  get: async () => {
    return await getBanners();
  },
});

export const productsState = selector<Product[]>({
  key: "products",
  get: async () => {
    const [products, variants] = await Promise.all([
      getProducts(),
      getVariants()
    ]);

    return products.map((product) => {
      // Access the variantId that comes from the DB service but isn't on the official Product type
      const productWithIds = product as unknown as { variantId?: string[] };

      return {
        ...product,
        variants: variants.filter((variant) =>
          productWithIds.variantId?.includes(variant.id)
        ),
      };
    });
  },
});

export const recommendProductsState = selector<Product[]>({
  key: "recommendProducts",
  get: ({ get }) => {
    const products = get(productsState);
    return products.filter((p) => p.sale);
  },
});

export const selectedCategoryIdState = atom({
  key: "selectedCategoryId",
  default: "coffee",
});

export const productsByCategoryState = selectorFamily<Product[], string>({
  key: "productsByCategory",
  get:
    (categoryId) =>
      ({ get }) => {
        const allProducts = get(productsState);
        return allProducts.filter((product) =>
          product.categoryId.includes(categoryId)
        );
      },
});

export const cartState = atom<Cart>({
  key: "cart",
  default: [],
});

export const totalQuantityState = selector({
  key: "totalQuantity",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
});

// Rename the original totalPriceState logic to requestTotalAmountState (or subtotal) for clarity if needed, 
// but for now let's keep totalPriceState as the FINAL price to minimize refactoring elsewhere.
// Wait! totalPriceState is used in many places. "subtotal" is what it was.
// Cleanest approach: 
// 1. Rename existing `totalPriceState` selector to `requestTotalAmountState` (internal use) or just use it as subtotal.
// 2. BUT `totalPriceState` name implies "Total". 
// Let's make `totalPriceState` depend on `calculatedDeliveryFeeState`.

// Calculating the subtotal of items
export const subtotalState = selector({
  key: "subtotal",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce(
      (total, item) =>
        total + item.quantity * calcFinalPrice(item.product, item.options),
      0
    );
  },
});

// Calculate final total (Subtotal + Shipping)
export const totalPriceState = selector({
  key: "totalPrice",
  get: ({ get }) => {
    const breakdown = get(priceBreakdownState);
    return breakdown.finalPrice;
  },
});

export const notificationsState = atom<Notification[]>({
  key: "notifications",
  default: [
    {
      id: 1,
      image: logo,
      title: "Chào bạn mới",
      content:
        "Cảm ơn đã sử dụng ZaUI Coffee, bạn có thể dùng ứng dụng này để tiết kiệm thời gian xây dựng",
    },
    {
      id: 2,
      image: logo,
      title: "Giảm 50% lần đầu mua hàng",
      content: "Nhập WELCOME để được giảm 50% giá trị đơn hàng đầu tiên order",
    },
  ],
});

export const keywordState = atom({
  key: "keyword",
  default: "",
});

export const resultState = selector<Product[]>({
  key: "result",
  get: async ({ get }) => {
    const keyword = get(keywordState);
    const products = get(productsState);

    // Show all products when keyword is empty (initial state)
    if (!keyword.trim()) {
      return products;
    }

    await wait(500);
    return products.filter((product) =>
      product.name.trim().toLowerCase().includes(keyword.trim().toLowerCase())
    );
  },
});

export const storesState = selector<Store[]>({
  key: "stores",
  get: async () => {
    const branches = await getBranches();
    // Fallback to hardcoded stores if database is empty
    if (branches.length === 0) {
      return [
        {
          id: "1",
          name: "VNG Campus Store",
          address:
            "Khu chế xuất Tân Thuận, Z06, Số 13, Tân Thuận Đông, Quận 7, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.741639,
          long: 106.714632,
          phone: "02873001234",
        },
        {
          id: "2",
          name: "The Independence Palace",
          address:
            "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.779159,
          long: 106.695271,
          phone: "02838223629",
        },
        {
          id: "3",
          name: "Saigon Notre-Dame Cathedral Basilica",
          address:
            "1 Công xã Paris, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.779738,
          long: 106.699092,
          phone: "02838223629",
        },
        {
          id: "4",
          name: "Bình Quới Tourist Village",
          address:
            "1147 Bình Quới, phường 28, Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.831098,
          long: 106.733128,
          phone: "02873001234",
        },
        {
          id: "5",
          name: "Củ Chi Tunnels",
          address: "Phú Hiệp, Củ Chi, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 11.051655,
          long: 106.494249,
          phone: "02873001234",
        },
      ];
    }
    return branches;
  },
});

export const nearbyStoresState = selector({
  key: "nearbyStores",
  get: ({ get }) => {
    // Get the current location from the locationState atom
    const location = get(locationState);

    // Get the list of stores from the storesState atom
    const stores = get(storesState);

    // Calculate the distance of each store from the current location
    if (location) {
      const storesWithDistance = stores.map((store) => ({
        ...store,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          store.lat,
          store.long
        ),
      }));

      // Sort the stores by distance from the current location
      const nearbyStores = storesWithDistance.sort(
        (a, b) => a.distance - b.distance
      );

      return nearbyStores;
    }
    return [];
  },
});

export const selectedStoreIdState = atom<string | null>({
  key: "selectedStoreId",
  default: null,
});

export const selectedStoreState = selector<Store | null>({
  key: "selectedStore",
  get: ({ get }) => {
    const storeId = get(selectedStoreIdState);
    const stores = get(storesState);

    if (storeId !== null) {
      const store = stores.find(s => s.id === storeId);
      if (store) return store;
    }

    // Fallback to first store if no selection
    return stores.length > 0 ? stores[0] : null;
  },
});

export const selectedDeliveryTimeState = atom({
  key: "selectedDeliveryTime",
  default: +new Date(),
});

export const requestLocationTriesState = atom({
  key: "requestLocationTries",
  default: 0,
});

export const requestPhoneTriesState = atom({
  key: "requestPhoneTries",
  default: 0,
});

export const locationState = selector<
  { latitude: string; longitude: string } | false
>({
  key: "location",
  get: async ({ get }) => {
    const requested = get(requestLocationTriesState);
    // Always attempt to get location when this selector is accessed (lazy)
    // The requested dependency ensures we can trigger a retry

    // Use the new location service that handles Zalo's token-based flow
    const coordinates = await getCurrentLocation();

    if (coordinates) {
      return {
        latitude: coordinates.latitude.toString(),
        longitude: coordinates.longitude.toString(),
      };
    }

    // Fallback: Return false if location is not available
    console.warn("Location not available. Make sure backend /api/location/convert endpoint is implemented.");
    return false;
  },
});

export const phoneState = selector<string | boolean>({
  key: "phone",
  get: async ({ get }) => {
    const requested = get(requestPhoneTriesState);
    if (requested) {
      try {
        // Use the new service that handles token conversion
        const phoneNumber = await getCurrentPhoneNumber();

        if (phoneNumber) {
          return phoneNumber;
        }

        console.warn("Phone number not available. Make sure VITE_ZALO_SECRET_KEY is set in environment variables.");
        return false;
      } catch (error) {
        console.error("Error getting phone number:", error);
        return false;
      }
    }

    return false;
  },
});

export const orderNoteState = atom({
  key: "orderNote",
  default: "",
});

// Checkout state
export const checkoutSheetVisibleState = atom({
  key: "checkoutSheetVisible",
  default: false,
});

export const appliedVoucherState = atom<string | null>({
  key: "appliedVoucher",
  default: null,
});

// Validated voucher from DB
export const voucherState = selector<{ voucher: Voucher | null; error: string | null }>({
  key: "voucher",
  get: async ({ get }) => {
    const code = get(appliedVoucherState);
    const cart = get(cartState);
    const subtotal = get(subtotalState);

    if (!code) {
      return { voucher: null, error: null };
    }

    const voucher = await getVoucherByCode(code);
    if (!voucher) {
      return { voucher: null, error: `Mã "${code}" không tồn tại` };
    }

    const validation = validateVoucher(voucher, cart, subtotal);
    return { voucher: validation.voucher, error: validation.error };
  },
});

// Unified price breakdown - single source of truth
export const priceBreakdownState = selector<PriceBreakdownType>({
  key: "priceBreakdown",
  get: async ({ get }) => {
    const cart = get(cartState);
    const shippingFee = get(calculatedDeliveryFeeState);
    const { voucher, error } = get(voucherState);

    const breakdown = calculatePriceBreakdown(cart, voucher, shippingFee, error);

    // Calculate earned points
    // Note: ensure access to proper typing for appConfig if possible, otherwise rely on known structure
    // appConfig.loyalty.earnPercent
    const earnPercent = (appConfig as any).loyalty?.earnPercent || 0;
    const earnedPoints = calculateEarnedPoints(breakdown.finalPrice, earnPercent);

    return {
      ...breakdown,
      earnedPoints
    };
  },
});

export const cutleryCountState = atom({
  key: "cutleryCount",
  default: 0,
});

export const deliveryFeeState = atom({
  key: "deliveryFee",
  default: 0,
});

// Delivery mode is now always "delivery" - pickup option removed
export const deliveryModeState = atom<"delivery">({
  key: "deliveryMode",
  default: "delivery",
});

export const selectedAddressState = atom<CustomerAddress | null>({
  key: "selectedAddress",
  default: null,
});

export const addressPickerVisibleState = atom({
  key: "addressPickerVisible",
  default: false,
});

export const addressEditingState = atom({
  key: "addressEditing",
  default: false,
});

export const voucherPickerVisibleState = atom({
  key: "voucherPickerVisible",
  default: false,
});

export const useCurrentLocationState = atom<boolean>({
  key: "useCurrentLocation",
  default: false,
});

export const userAddressesState = selector<CustomerAddress[]>({
  key: "userAddresses",
  get: async ({ get }) => {
    const user = get(userState);
    // Use the customer service to get addresses now
    return await getCustomerAddresses(user.id);
  },
});

// Shipping Service State
export const shippingServiceState = atom<"SGN-BIKE" | "SGN-ECO">({
  key: "shippingService",
  default: "SGN-ECO", // Default to cheap eco option
});

export const calculatedDeliveryFeeState = selector({
  key: "calculatedDeliveryFee",
  get: async ({ get }) => {
    const address = get(selectedAddressState);
    const store = get(selectedStoreState);
    const cart = get(cartState);
    const user = get(userState);
    const location = get(locationState);
    const useCurrentLocation = get(useCurrentLocationState);
    const serviceId = get(shippingServiceState);

    let destLat = 0;
    let destLng = 0;
    let destAddress = "";
    let destName = "";
    let destPhone = "";

    if (address) {
      destLat = address.lat;
      destLng = address.long;
      destAddress = address.address;
      destName = address.name || user.name;
      destPhone = address.phone;
    } else if (useCurrentLocation && location) {
      destLat = parseFloat(location.latitude);
      destLng = parseFloat(location.longitude);
      destAddress = "Vị trí hiện tại";
      destName = user.name;
      destPhone = ""; // Optional or use user's phone if available
    }

    if ((!destLat || !destLng) || !store || cart.length === 0) {
      return 0;
    }

    // Enriched fee estimation via AhaMove v3 API
    // Include name and mobile for both pickup and delivery points
    const fee = await estimateFee({
      path: [
        {
          lat: store.lat,
          lng: store.long,
          address: store.address,
          name: store.name,
          mobile: store.phone || "02873001234" // Fallback phone
        },
        {
          lat: destLat,
          lng: destLng,
          address: destAddress,
          name: destName,
          mobile: destPhone
        }
      ],
      items: cart.map(item => ({
        _id: String(item.product.id),
        name: item.product.name,
        price: item.product.price,
        num: item.quantity
      })),
      payment_method: "CASH_BY_RECIPIENT", // Default to cash on delivery
      serviceId: serviceId
    });

    return fee.total_pay;
  },
});
