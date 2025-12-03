import React, { FC } from "react";
import { Divider } from "components/divider";
import { Header, Page } from "zmp-ui";
import { CartItems } from "./cart-items";
import { CartPreview } from "./preview";
import { TermsAndPolicies } from "./term-and-policies";
import { Delivery } from "./delivery";
import { useVirtualKeyboardVisible } from "hooks";

const CartPage: FC = () => {
  const keyboardVisible = useVirtualKeyboardVisible();

  return (
    <Page className="flex flex-col bg-gray-100 min-h-screen">
      <Header title="Giỏ hàng" showBackIcon={false} className="bg-white" />
      <div className="flex-1 overflow-y-auto pb-4">
        <CartItems />
        <Delivery />
        <TermsAndPolicies />
      </div>
      {!keyboardVisible && <CartPreview />}
    </Page>
  );
};

export default CartPage;
