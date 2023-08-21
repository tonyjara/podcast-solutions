import Pricing from "@/pageContainers/Pricing";
import { TRPCError } from "@trpc/server";
import { type GetServerSideProps } from "next/types";
import Stripe from "stripe";

export default Pricing;

export const getServerSideProps: GetServerSideProps = async () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe key not found",
    });
  const stripe = new Stripe(stripeKey, {
    apiVersion: "2022-11-15",
  });
  const products = await stripe.products.list();
  const prices = await stripe.prices.list({ limit: 100 });

  return {
    props: { products, prices },
  };
};
