import StripePricesEditForm from "@/components/Forms/StripePricesEdit.form";
import { trpcClient } from "@/utils/api";
import { Text, Flex, VStack } from "@chakra-ui/react";
import React from "react";

const StripePrices = () => {
  const { data } = trpcClient.stripe.getProductsAndPrices.useQuery();

  return (
    <Flex flexDir={"column"}>
      <Flex>
        <Text fontSize={"xl"} px={"20px"} fontWeight={"bold"}>
          {" "}
          {data?.prices.data.length} Prices
        </Text>
      </Flex>
      <VStack w="full">
        {data?.prices.data.map((price) => {
          return (
            <StripePricesEditForm
              key={price.id}
              price={price}
              isDefault={data?.products.data.some(
                (product) => product.default_price === price.id,
              )}
            />
          );
        })}
      </VStack>
    </Flex>
  );
};

export default StripePrices;
