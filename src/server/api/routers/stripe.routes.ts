import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { PlanType, StripePriceTag } from "@prisma/client";
import { throwInternalServerError } from "@/lib/dictionaries/knownErrors";
import { createId } from "@paralleldrive/cuid2";
import { validatePSStripeProductUpdate } from "@/components/Validations/StripeProductUpdate.validate";
import { validateStripePriceEdit } from "@/components/Validations/StripePriceEdit.validate";
import { validateStripePriceCreate } from "@/components/Validations/StripePriceCreate.validate";
import { validateStripeProductCreate } from "@/components/Validations/StripeProductCreate.validate";
import { decimalDivBy100, decimalTimes100 } from "@/lib/utils/DecimalUtils";

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
    const products = await stripe.products.list({ limit: 100, active: true });
    const prices = await stripe.prices.list({ limit: 100, active: true });
    const psProducts = await prisma.product.findMany({
      where: { active: true },
    });
    const psPrices = await prisma.price.findMany({ where: { active: true } });

    return { products, prices, psProducts, psPrices };
  }),

  //** Creates a checkout session and stores priceId and sessionId into a new payments row */
  getSessionUrlAndCreatePaymentIntent: protectedProcedure
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
      const defaultPrice = prices.data.find(
        (x) => x.id === input.defaultPriceId,
      );

      await prisma.paymentIntent.create({
        data: {
          unit_amount_decimal: decimalDivBy100(
            defaultPrice?.unit_amount_decimal ?? "0",
          ),
          stripeProductId: input.productId,
          id: session.id, // Only when created from a checkout session, session id becomes the id
          userId: user.id,
        },
      });

      return { url: session.url };
    }),
  createProduct: adminProcedure
    .input(validateStripeProductCreate)
    .mutation(async ({ input }) => {
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });
      const prodId = `ps_prod_${createId()}`;

      const stripeProd = await stripe.products.create({
        id: prodId,
        name: input.prodName,
        description: input.prodDescription,
        metadata: {
          features: input.features,
          payAsYouGo: input.payAsYouGo,
          sortOrder: input.sortOrder,
          planType: input.planType,
        },
        default_price_data: {
          currency: "usd",
          unit_amount_decimal: decimalTimes100(input.unit_amount_decimal),
          recurring: {
            interval: input.interval,
          },
        },
      });
      const price = await stripe.prices.update(
        stripeProd.default_price as string,
        {
          nickname: `default price for ${input.prodName}`,
          metadata: { tag: "PLAN_FEE", sortOrder: "1" },
        },
      );

      if (!stripeProd || !price) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe product creation failed",
        });
      }

      await prisma.product.create({
        data: {
          id: prodId,
          name: input.prodName,
          description: input.prodDescription,
          features: input.features,
          payAsYouGo: input.payAsYouGo,
          sortOrder: input.sortOrder,
          planType: input.planType,

          prices: {
            create: {
              id: stripeProd.default_price as string,
              active: true,
              nickName: `default price for ${input.prodName}`,
              unit_amount_decimal: input.unit_amount_decimal,
              currency: "usd",
              interval: input.interval,
              sortOrder: "1",
              tag: "PLAN_FEE",
            },
          },
        },
      });
    }),
  editProduct: adminProcedure
    .input(validatePSStripeProductUpdate)
    .mutation(async ({ input }) => {
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });
      const product = await stripe.products.update(input.id, {
        name: input.name,
        active: input.active,
        metadata: {
          features: input.features,
          payAsYouGo: input.payAsYouGo,
          sortOrder: input.sortOrder,
          planType: input.planType,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe product creation failed",
        });
      }
      await prisma.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          features: input.features,
          payAsYouGo: input.payAsYouGo,
          sortOrder: input.sortOrder,
          planType: input.planType,
        },
      });
    }),
  editPrice: adminProcedure
    .input(validateStripePriceEdit)
    .mutation(async ({ input }) => {
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });

      const price = await stripe.prices.update(input.id, {
        nickname: input.nickName,
        active: input.active,
        metadata: { sortOrder: input.sortOrder, tag: input.tag },
      });

      if (!price) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe price edit failed",
        });
      }
      await prisma.price.update({
        where: { id: input.id },
        data: {
          active: input.active,
          nickName: input.nickName,
          sortOrder: input.sortOrder,
          tag: input.tag,
        },
      });
    }),
  createPrice: adminProcedure
    .input(validateStripePriceCreate)
    .mutation(async ({ input }) => {
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });

      const price = await stripe.prices.create({
        currency: "usd",
        product: input.productId,
        metadata: { tag: input.tag, sortOrder: input.sortOrder },
        unit_amount_decimal: decimalTimes100(input.unit_amount_decimal),
        nickname: input.nickName,
        recurring: {
          interval: input.interval,
          usage_type: input.usage_type,
        },
      });
      if (!price) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe price creation failed",
        });
      }
      await prisma.price.create({
        data: {
          id: price.id,
          active: true,
          nickName: input.nickName,
          unit_amount_decimal: input.unit_amount_decimal,
          currency: "usd",
          interval: input.interval,
          sortOrder: input.sortOrder,
          tag: input.tag,
          productId: input.productId,
        },
      });
    }),
  pullStripePricesAndProducts: adminProcedure
    .input(
      z.object({
        priceIds: z.string().array(),
        productIds: z.string().array(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!stripeKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2022-11-15",
      });
      const prices = await stripe.prices.list({ limit: 100, active: true });
      const products = await stripe.products.list({ limit: 100, active: true });
      let defaultPriceIds: string[] = [];

      for await (const id of input.productIds) {
        const match = products.data.find((x) => x.id === id);
        const defaultPrice = prices.data.find(
          (x) => x.id === match?.default_price,
        );
        if (!match || !defaultPrice) continue;
        defaultPriceIds.push(defaultPrice.id);

        await prisma.product.create({
          data: {
            id,
            name: match.name,
            description: match.description ?? "",
            features: match.metadata?.features ?? "",
            payAsYouGo: match.metadata?.payAsYouGo ?? "",
            sortOrder: match.metadata?.sortOrder ?? "",
            planType: (match.metadata?.planType as PlanType) ?? "PLAN_FEE",

            prices: {
              create: {
                id: defaultPrice.id,
                active: true,
                nickName: `default price for ${match.name}`,
                unit_amount_decimal: defaultPrice.unit_amount_decimal ?? "0",
                currency: "usd",
                interval: defaultPrice.recurring?.interval ?? "month",
                sortOrder: "1",
                tag: "PLAN_FEE",
              },
            },
          },
        });
      }
      for await (const id of input.priceIds) {
        if (defaultPriceIds.includes(id)) continue;
        const match = prices.data.find((x) => x.id === id);
        if (!match) continue;
        await prisma.price.create({
          data: {
            id,
            active: true,
            nickName: match.nickname ?? "",
            unit_amount_decimal: match.unit_amount_decimal ?? "0",
            currency: "usd",
            interval: match.recurring?.interval ?? "month",
            sortOrder: match.metadata?.sortOrder ?? "",
            tag: (match.metadata?.tag as StripePriceTag) ?? "CHAT_INPUT",
            productId: match.product as string,
          },
        });
      }
    }),
});
