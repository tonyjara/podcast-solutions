import { trpcClient } from "@/utils/api";
import React from "react";

const StripeIndex = () => {
  const { data } = trpcClient.stripe.getProductsAndPrices.useQuery();
  return (
    <div>
      StripeIndex
      {JSON.stringify(data)}
    </div>
  );
};

export default StripeIndex;
