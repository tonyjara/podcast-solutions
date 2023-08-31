import StripeProductCreateFrom from "@/components/Forms/StripeProductCreate.form";
import StripeProductUpdateForm from "@/components/Forms/StripeProductUpdateForm";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { trpcClient } from "@/utils/api";
import { Text, Flex, VStack, useDisclosure, Button } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { BiPlus } from "react-icons/bi";

const StripeProducts = () => {
  const trpcContext = trpcClient.useContext();
  const [missingProducts, setMissingProducts] = React.useState<string[]>([]);
  const [missingPrices, setMissingPrices] = React.useState<string[]>([]);
  const { data } = trpcClient.stripe.getProductsAndPrices.useQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (
      data?.psPrices.length === data?.prices.data.length &&
      data?.psProducts.length === data?.products?.data.length
    )
      return;

    const findMissingProducts = data?.products.data.filter(
      (prod) => !data.psProducts.some((psProd) => psProd.id === prod.id),
    );
    setMissingProducts(findMissingProducts?.map((x) => x.id) ?? []);

    const findMissingPrices = data?.prices.data.filter(
      (price) => !data.psProducts.some((psPrice) => psPrice.id === price.id),
    );
    setMissingPrices(findMissingPrices?.map((x) => x.id) ?? []);
    return () => {};
  }, [data]);

  const { mutate: introspect } =
    trpcClient.stripe.pullStripePricesAndProducts.useMutation(
      handleUseMutationAlerts({
        successText: "Successfully pulled products and prices from Stripe",
        callback: () => {
          trpcContext.invalidate();
        },
      }),
    );

  return (
    <Flex flexDir={"column"}>
      {(missingProducts.length > 0 || missingPrices.length > 0) && (
        <Flex gap={"20px"} px={"20px"}>
          <Text fontSize={"xl"} pb={"20px"} fontWeight={"bold"}>
            {missingProducts.length &&
              `${missingProducts.length} Products missing`}{" "}
            from the database <br />
            {missingPrices.length &&
              `${missingPrices.length} Prices missing`}{" "}
            from the database
          </Text>
          <Button
            onClick={() =>
              introspect({
                productIds: missingProducts,
                priceIds: missingPrices,
              })
            }
          >
            Instrospect
          </Button>
        </Flex>
      )}
      <Flex>
        <Text fontSize={"xl"} px={"20px"} fontWeight={"bold"}>
          {" "}
          {data?.products.data.length} Products and {data?.prices.data.length}{" "}
          Prices
        </Text>
        <Button onClick={onOpen} leftIcon={<BiPlus />}>
          Create product
        </Button>
      </Flex>
      <VStack w="full">
        {data?.products.data
          .sort(
            (a: any, b: any) =>
              (a.metadata?.sortOrder ?? "0") - (b.metadata?.sortOrder ?? "0"),
          )
          .map((product) => {
            const productPrices = data.prices.data.filter(
              (x) => x.product === product.id,
            );

            return (
              <StripeProductUpdateForm
                key={product.id}
                product={product}
                prices={productPrices}
              />
            );
          })}
      </VStack>
      <StripeProductCreateFrom isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default StripeProducts;
