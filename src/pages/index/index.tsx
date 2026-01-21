import React, { Suspense } from "react";
import { Box, Page } from "zmp-ui";

import { Welcome } from "./welcome";
import { Banner } from "./banner";
import { Categories } from "./categories";
import { Recommend } from "./recommend";
import { ProductList } from "./product-list";
import { Divider } from "components/divider";
import { CartFloat } from "components/cart/cart-float";

const HomePage: React.FunctionComponent = () => {
  return (
    <Page className="relative flex-1 flex flex-col bg-background">
      <Welcome />
      <Box className="flex-1 overflow-auto">

        <Suspense>
          <Banner />
        </Suspense>
        <Suspense>
          <Categories />
        </Suspense>
        {/* <Divider />
        <Recommend /> */}
        <Divider />
        <ProductList />
        <Divider />
        <Divider />
      </Box>
      <CartFloat />
    </Page>
  );
};

export default HomePage;
