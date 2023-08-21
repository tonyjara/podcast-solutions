import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";
import { throwInternalServerError } from "@/lib/dictionaries/knownErrors";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const stripeRouter = createTRPCRouter({
  getProductsAndPrices: publicProcedure.query(async () => {
    if (!stripeKey)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe key not found",
      });
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
    });
    const products = await stripe.products.list();
    const prices = await stripe.prices.list();

    return { products, prices };
  }),

  //** Creates a checkout session and stores priceId and sessionId into a new payments row */
  getSessionUrlAndCreatePayment: protectedProcedure
    .input(
      z.object({
        productId: z.string().min(1),
        defaultPriceId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (!stripeKey || !webUrl || !user || !user.email)
        throwInternalServerError("Missing Stripe key or web url");
      //fail if user already has a subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
        },
      });
      if (existingSubscription)
        throwInternalServerError("User already has a subscription");

      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });

      const prices = await stripe.prices.list({
        product: input.productId,
      });
      const defaultPrice = prices.data.find(
        (x) => x.id === input.defaultPriceId,
      );

      /* if (!defaultPrice?.unit_amount) */
      /*   throwInternalServerError("No default price found"); */

      const line_items = prices.data.map((price) => {
        if (price.billing_scheme === "tiered") {
          return {
            price: price.id,
          };
        }
        return {
          price: price.id,
          quantity: price.id === input.defaultPriceId ? 1 : undefined,
        };
      });

      const session = await stripe.checkout.sessions.create({
        line_items,
        customer_email: user.email,
        mode: "subscription",
        success_url: `${webUrl}/home/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${webUrl}/home/plans`,
      });

      await prisma.payment.create({
        data: {
          stripeProductId: input.productId,
          stripeLineItems: line_items.map((x) => x.price),
          stripeSessionId: session.id,
          payedAmount: new Prisma.Decimal(defaultPrice?.unit_amount ?? 0), //The free plan doesnt have unit amount
          userId: user.id,
        },
      });

      return { url: session.url };
    }),
});
