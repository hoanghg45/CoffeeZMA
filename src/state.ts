import { atom, selector, selectorFamily } from "recoil";
import { getCurrentPhoneNumber, getCurrentUserInfo } from "services/user-info";
import { getCurrentLocation } from "services/location";
import logo from "static/logo.png";
import { Product } from "types/product";
import { Cart } from "types/cart";
import { Notification } from "types/notification";
import { Store } from "types/delivery";
import { calculateDistance } from "utils/location";
import { calcFinalPrice } from "utils/product";
import { wait } from "utils/async";
import { getCategories } from "services/category";
import { getProducts } from "services/product";
import { getVariants } from "services/variant";
import { estimateFee } from "services/ahamove";
import { getUserAddresses, UserAddress, ensureUserExists } from "services/user";
import { getBranches } from "services/branch";

export const userState = selector({
  key: "user",
  get: async () => {
    const userInfo = await getCurrentUserInfo({ autoRequestPermission: true });

    if (!userInfo) {
      throw new Error("Failed to get user info");
    }

    // Ensure user exists in DB
    await ensureUserExists({
      id: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar
    });
    return userInfo;
  },
});

export const categoriesState = selector({
  key: "categories",
  get: async () => {
    return await getCategories();
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
    const subtotal = get(subtotalState);
    const deliveryFee = get(calculatedDeliveryFeeState);
    return subtotal + deliveryFee;
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
          id: 1,
          name: "VNG Campus Store",
          address:
            "Khu chế xuất Tân Thuận, Z06, Số 13, Tân Thuận Đông, Quận 7, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.741639,
          long: 106.714632,
          phone: "02873001234",
        },
        {
          id: 2,
          name: "The Independence Palace",
          address:
            "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.779159,
          long: 106.695271,
          phone: "02838223629",
        },
        {
          id: 3,
          name: "Saigon Notre-Dame Cathedral Basilica",
          address:
            "1 Công xã Paris, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.779738,
          long: 106.699092,
          phone: "02838223629",
        },
        {
          id: 4,
          name: "Bình Quới Tourist Village",
          address:
            "1147 Bình Quới, phường 28, Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam",
          lat: 10.831098,
          long: 106.733128,
          phone: "02873001234",
        },
        {
          id: 5,
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

export const selectedStoreIdState = atom<number | null>({
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

export const selectedAddressState = atom<UserAddress | null>({
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

export const userAddressesState = selector<UserAddress[]>({
  key: "userAddresses",
  get: async ({ get }) => {
    const user = get(userState);
    return await getUserAddresses(user.id);
  },
});

export const calculatedDeliveryFeeState = selector({
  key: "calculatedDeliveryFee",
  get: async ({ get }) => {
    const address = get(selectedAddressState);
    const store = get(selectedStoreState);
    const cart = get(cartState);
    const user = get(userState);
    const location = get(locationState);

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
    } else if (location) {
      destLat = parseFloat(location.latitude);
      destLng = parseFloat(location.longitude);
      destAddress = "Current Location";
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
      payment_method: "CASH" // Default to cash on delivery
    });

    return fee.total_pay;
  },
});
