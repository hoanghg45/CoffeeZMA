import type { Cart } from "@muoi/core";
import { atom, selector } from "recoil";
import { calcFinalPrice, isIdentical } from "@muoi/core";

export const cartState = atom<Cart>({
  key: "web/cart",
  default: [],
});

export const totalQuantityState = selector({
  key: "web/totalQuantity",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const subtotalState = selector({
  key: "web/subtotal",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce(
      (total, item) =>
        total + item.quantity * calcFinalPrice(item.product, item.options),
      0,
    );
  },
});

export function mergeCartItem(cart: Cart, newItem: Cart[number], editingOptions?: Cart[number]["options"]) {
  const res = [...cart];
  if (editingOptions) {
    const editing = cart.find(
      (item) =>
        item.product.id === newItem.product.id &&
        isIdentical(item.options, editingOptions),
    );
    if (!editing) return res.concat(newItem);
    if (newItem.quantity === 0) {
      res.splice(cart.indexOf(editing), 1);
      return res;
    }
    const duplicate = cart.find(
      (item, i) =>
        i !== cart.indexOf(editing) &&
        item.product.id === newItem.product.id &&
        isIdentical(item.options, newItem.options),
    );
    res.splice(cart.indexOf(editing), 1, {
      ...editing,
      options: newItem.options,
      quantity: duplicate ? duplicate.quantity + newItem.quantity : newItem.quantity,
    });
    if (duplicate) res.splice(cart.indexOf(duplicate), 1);
    return res;
  }

  const existed = cart.find(
    (item) =>
      item.product.id === newItem.product.id &&
      isIdentical(item.options, newItem.options),
  );
  if (existed) {
    res.splice(cart.indexOf(existed), 1, {
      ...existed,
      quantity: existed.quantity + newItem.quantity,
    });
    return res;
  }
  return res.concat(newItem);
}
