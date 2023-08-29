import { Box, Stack, Heading, Text, VStack } from "@chakra-ui/react";
import { trpcClient } from "@/utils/api";
import PricingCard from "@/components/Cards/PricingCard";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { handleUseMutationAlerts } from "@/components/Toasts & Alerts/MyToast";
import { type PricingPageProps } from "@/pages";

export default function Pricing({ prices, products }: PricingPageProps) {
  const session = useSession();

  const authenticated = session?.status === "authenticated";

  const { mutate } =
    trpcClient.stripe.getSessionUrlAndCreatePayment.useMutation(
      handleUseMutationAlerts({
        successText: "Redirecting to checkout...",
        callback: ({ url }) => {
          if (!url) return;
          window.location.assign(url);
        },
      }),
    );

  const handleCheckout = async (productId?: any, defaultPriceId?: any) => {
    if (!authenticated) return signIn();
    if (!productId || !defaultPriceId) return;
    mutate({ productId, defaultPriceId });
  };

  return (
    <Box id="pricing" py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading maxW="800px" as="h1" fontSize="4xl">
          Choose the plan that better fits your needs{" "}
        </Heading>
        <Text maxW="800px" fontSize="lg" color={"gray.500"}>
          Cancel any time, no questions asked. All values are cumulative, if you
          don&apos;t use them they remain in your account for as long as your
          subscription is active, in case of suspending your subscription your
          values will be held as is for 3 months.
        </Text>
      </VStack>
      <Stack
        direction={{ base: "column", md: "row" }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}
      >
        {products.data
          .sort(
            (a: any, b: any) =>
              (a.metadata?.sortOrder ?? "0") - (b.metadata?.sortOrder ?? "0"),
          )
          .map((product, i) => {
            const productPrices = prices.data.filter(
              (x) => x.product === product.id,
            );
            const features = product.metadata?.features;
            const payAsYouGo = product.metadata?.payAsYouGo;
            return (
              <PricingCard
                popular={i === 1}
                key={product.id}
                payAsYouGo={payAsYouGo ? payAsYouGo.split(",") : []}
                handleCheckout={() => {
                  if (!product.default_price || !product.id) return;
                  return handleCheckout(product.id, product.default_price);
                }}
                description={product.description ?? ""}
                autenticated={authenticated}
                defaultPriceId={product.default_price?.toString() ?? ""}
                prices={productPrices}
                title={product.name}
                features={features ? features.split(",") : []}
              />
            );
          })}
      </Stack>
    </Box>
  );
}
