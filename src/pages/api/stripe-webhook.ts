import { prisma } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "stream/consumers";
import Stripe from "stripe";
import Cors from "micro-cors";
import { StripePriceTag } from "@prisma/client";
import { initializePlanCredits } from "@/server/serverUtils";
const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
export const config = {
  api: {
    bodyParser: false,
  },
};

const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeKey = process.env.STRIPE_SECRET_KEY;

const handleStripeWebhooks = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (!webHookSecret || !stripeKey)
    return res.status(500).json({ message: "Stripe webhook secret not set" });
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2022-11-15",
  });
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event | any;
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webHookSecret);

    if (event.type === "checkout.session.completed") {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        event.data.object.subscription,
      );
      // stripeSubscription is a subscription based on a product, when getting the object from subscription we also get the subscription items
      const subscriptionItems = stripeSubscription.items.data;
      const prodId = subscriptionItems[0]?.price.product as string;
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: prodId },
      });

      const payment = await prisma.payment.update({
        where: { stripeSessionId: event.data.object.id! },
        data: {
          stripeCheckouCompleteEventId: event.id,
          confirmedByWebhookAt: new Date(),
          validatedByStripeWebhook: true,
          invoiceId: event.data.object.invoice,
        },
      });

      // Every time a user subscribes, create a subscription in the database and create add credits to the user according to the plan
      const PSSubscription = await prisma.subscription.create({
        data: {
          id: event.data.object.subscription,
          productId: product.id,
          active: true,
          userId: payment.userId,
          stripeCustomerId: event.data.object.customer,
          payments: {
            connect: { id: payment.id },
          },
        },
      });
      const prices = await stripe.prices.list({
        limit: 100,
        active: true,
        product: product.id,
      });

      for await (const item of subscriptionItems) {
        const price = prices.data.find((x) => x.id === item.price.id);
        await prisma.subscriptionItem.create({
          data: {
            id: item.id,
            active: true,
            subscriptionId: PSSubscription.id,
            priceId: item.price.id,
            priceTag:
              (price?.metadata.tag as StripePriceTag | undefined) ?? "PLAN_FEE",
          },
        });
      }
      await initializePlanCredits({
        subscriptionId: PSSubscription.id,
        planType: product.planType,
      });
    }

    res.status(200).end();
  } catch (err: any) {
    // On error, log and return the error message
    console.error(`❌ Error message: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
};

export default cors(handleStripeWebhooks as any);

/* const stripeSubscriptionItemsExample = [ */
/*   { */
/*     id: "si_OVflMC9wo2o4zq", */
/*     object: "subscription_item", */
/*     billing_thresholds: null, */
/*     created: 1692886883, */
/*     metadata: {}, */
/*     plan: { */
/*       id: "price_1NVdubI6tK2Uorp9MBfgkjmM", */
/*       object: "plan", */
/*       active: true, */
/*       aggregate_usage: "sum", */
/*       amount: 100, */
/*       amount_decimal: "100", */
/*       billing_scheme: "per_unit", */
/*       created: 1689786701, */
/*       currency: "usd", */
/*       interval: "month", */
/*       interval_count: 1, */
/*       livemode: false, */
/*       metadata: {}, */
/*       nickname: "Storage per Gb over plan", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       tiers_mode: null, */
/*       transform_usage: null, */
/*       trial_period_days: null, */
/*       usage_type: "metered", */
/*     }, */
/*     price: { */
/*       id: "price_1NVdubI6tK2Uorp9MBfgkjmM", */
/*       object: "price", */
/*       active: true, */
/*       billing_scheme: "per_unit", */
/*       created: 1689786701, */
/*       currency: "usd", */
/*       custom_unit_amount: null, */
/*       livemode: false, */
/*       lookup_key: null, */
/*       metadata: {}, */
/*       nickname: "Storage per Gb over plan", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       recurring: [Object], */
/*       tax_behavior: "unspecified", */
/*       tiers_mode: null, */
/*       transform_quantity: null, */
/*       type: "recurring", */
/*       unit_amount: 100, */
/*       unit_amount_decimal: "100", */
/*     }, */
/*     subscription: "sub_1NiePWI6tK2Uorp94od7xZtV", */
/*     tax_rates: [], */
/*   }, */
/*   { */
/*     id: "si_OVflKlpUrYl7db", */
/*     object: "subscription_item", */
/*     billing_thresholds: null, */
/*     created: 1692886883, */
/*     metadata: {}, */
/*     plan: { */
/*       id: "price_1NVdtZI6tK2Uorp9TDKiDkvN", */
/*       object: "plan", */
/*       active: true, */
/*       aggregate_usage: "sum", */
/*       amount: 6, */
/*       amount_decimal: "6", */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       interval: "month", */
/*       interval_count: 1, */
/*       livemode: false, */
/*       metadata: {}, */
/*       nickname: "Whisper api transcription minute", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       tiers_mode: null, */
/*       transform_usage: null, */
/*       trial_period_days: null, */
/*       usage_type: "metered", */
/*     }, */
/*     price: { */
/*       id: "price_1NVdtZI6tK2Uorp9TDKiDkvN", */
/*       object: "price", */
/*       active: true, */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       custom_unit_amount: null, */
/*       livemode: false, */
/*       lookup_key: null, */
/*       metadata: {}, */
/*       nickname: "Whisper api transcription minute", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       recurring: [Object], */
/*       tax_behavior: "unspecified", */
/*       tiers_mode: null, */
/*       transform_quantity: null, */
/*       type: "recurring", */
/*       unit_amount: 6, */
/*       unit_amount_decimal: "6", */
/*     }, */
/*     subscription: "sub_1NiePWI6tK2Uorp94od7xZtV", */
/*     tax_rates: [], */
/*   }, */
/*   { */
/*     id: "si_OVflPhWzBPf1sA", */
/*     object: "subscription_item", */
/*     billing_thresholds: null, */
/*     created: 1692886883, */
/*     metadata: {}, */
/*     plan: { */
/*       id: "price_1NVdtZI6tK2Uorp9ZzpBl34S", */
/*       object: "plan", */
/*       active: true, */
/*       aggregate_usage: "sum", */
/*       amount: null, */
/*       amount_decimal: "0.002", */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       interval: "month", */
/*       interval_count: 1, */
/*       livemode: false, */
/*       metadata: {}, */
/*       nickname: "Chat GPT output tokens per unit", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       tiers_mode: null, */
/*       transform_usage: null, */
/*       trial_period_days: null, */
/*       usage_type: "metered", */
/*     }, */
/*     price: { */
/*       id: "price_1NVdtZI6tK2Uorp9ZzpBl34S", */
/*       object: "price", */
/*       active: true, */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       custom_unit_amount: null, */
/*       livemode: false, */
/*       lookup_key: null, */
/*       metadata: {}, */
/*       nickname: "Chat GPT output tokens per unit", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       recurring: [Object], */
/*       tax_behavior: "unspecified", */
/*       tiers_mode: null, */
/*       transform_quantity: null, */
/*       type: "recurring", */
/*       unit_amount: null, */
/*       unit_amount_decimal: "0.002", */
/*     }, */
/*     subscription: "sub_1NiePWI6tK2Uorp94od7xZtV", */
/*     tax_rates: [], */
/*   }, */
/*   { */
/*     id: "si_OVfly8cABRXNNO", */
/*     object: "subscription_item", */
/*     billing_thresholds: null, */
/*     created: 1692886883, */
/*     metadata: {}, */
/*     plan: { */
/*       id: "price_1NVdtZI6tK2Uorp9SNSXELdL", */
/*       object: "plan", */
/*       active: true, */
/*       aggregate_usage: "sum", */
/*       amount: null, */
/*       amount_decimal: "0.0015", */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       interval: "month", */
/*       interval_count: 1, */
/*       livemode: false, */
/*       metadata: {}, */
/*       nickname: "Chat GPT input tokens per unit", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       tiers_mode: null, */
/*       transform_usage: null, */
/*       trial_period_days: null, */
/*       usage_type: "metered", */
/*     }, */
/*     price: { */
/*       id: "price_1NVdtZI6tK2Uorp9SNSXELdL", */
/*       object: "price", */
/*       active: true, */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       custom_unit_amount: null, */
/*       livemode: false, */
/*       lookup_key: null, */
/*       metadata: {}, */
/*       nickname: "Chat GPT input tokens per unit", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       recurring: [Object], */
/*       tax_behavior: "unspecified", */
/*       tiers_mode: null, */
/*       transform_quantity: null, */
/*       type: "recurring", */
/*       unit_amount: null, */
/*       unit_amount_decimal: "0.0015", */
/*     }, */
/*     subscription: "sub_1NiePWI6tK2Uorp94od7xZtV", */
/*     tax_rates: [], */
/*   }, */
/*   { */
/*     id: "si_OVflQQHvnbBxxp", */
/*     object: "subscription_item", */
/*     billing_thresholds: null, */
/*     created: 1692886883, */
/*     metadata: {}, */
/*     plan: { */
/*       id: "price_1NVdtZI6tK2Uorp95CEBkTgp", */
/*       object: "plan", */
/*       active: true, */
/*       aggregate_usage: null, */
/*       amount: 700, */
/*       amount_decimal: "700", */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       interval: "month", */
/*       interval_count: 1, */
/*       livemode: false, */
/*       metadata: {}, */
/*       nickname: "hobby default", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       tiers_mode: null, */
/*       transform_usage: null, */
/*       trial_period_days: null, */
/*       usage_type: "licensed", */
/*     }, */
/*     price: { */
/*       id: "price_1NVdtZI6tK2Uorp95CEBkTgp", */
/*       object: "price", */
/*       active: true, */
/*       billing_scheme: "per_unit", */
/*       created: 1689786637, */
/*       currency: "usd", */
/*       custom_unit_amount: null, */
/*       livemode: false, */
/*       lookup_key: null, */
/*       metadata: {}, */
/*       nickname: "hobby default", */
/*       product: "prod_OIEMUf870cWK8Z", */
/*       recurring: [Object], */
/*       tax_behavior: "unspecified", */
/*       tiers_mode: null, */
/*       transform_quantity: null, */
/*       type: "recurring", */
/*       unit_amount: 700, */
/*       unit_amount_decimal: "700", */
/*     }, */
/*     quantity: 1, */
/*     subscription: "sub_1NiePWI6tK2Uorp94od7xZtV", */
/*     tax_rates: [], */
/*   }, */
/* ]; */

/* const successEventExample = { */
/*   id: "evt_1NieIHI6tK2Uorp9AaYNVYgw", */
/*   object: "event", */
/*   api_version: "2022-11-15", */
/*   created: 1692886433, */
/*   data: { */
/*     object: { */
/*       id: "cs_test_b1AJmpxtEPBIVVl3y439vUJmYx0f21Rq8RemqRxOlGUesNVwWQotnCY57q", */
/*       object: "checkout.session", */
/*       after_expiration: null, */
/*       allow_promotion_codes: null, */
/*       amount_subtotal: 700, */
/*       amount_total: 700, */
/*       automatic_tax: [Object], */
/*       billing_address_collection: null, */
/*       cancel_url: "http://localhost:3000/home/plans", */
/*       client_reference_id: null, */
/*       consent: null, */
/*       consent_collection: null, */
/*       created: 1692886419, */
/*       currency: "usd", */
/*       currency_conversion: null, */
/*       custom_fields: [], */
/*       custom_text: [Object], */
/*       customer: "cus_OVfdA28xcOhwaM", */
/*       customer_creation: "always", */
/*       customer_details: [Object], */
/*       customer_email: "pcastsolutions@gmail.com", */
/*       expires_at: 1692972818, */
/*       invoice: "in_1NieIEI6tK2Uorp9SbTiT7Au", */
/*       invoice_creation: null, */
/*       livemode: false, */
/*       locale: null, */
/*       metadata: {}, */
/*       mode: "subscription", */
/*       payment_intent: null, */
/*       payment_link: null, */
/*       payment_method_collection: "always", */
/*       payment_method_options: null, */
/*       payment_method_types: [Array], */
/*       payment_status: "paid", */
/*       phone_number_collection: [Object], */
/*       recovered_from: null, */
/*       setup_intent: null, */
/*       shipping_address_collection: null, */
/*       shipping_cost: null, */
/*       shipping_details: null, */
/*       shipping_options: [], */
/*       status: "complete", */
/*       submit_type: null, */
/*       subscription: "sub_1NieIEI6tK2Uorp96e6KKBWg", */
/*       success_url: */
/*         "http://localhost:3000/home/success?session_id={CHECKOUT_SESSION_ID}", */
/*       total_details: [Object], */
/*       url: null, */
/*     }, */
/*   }, */
/*   livemode: false, */
/*   pending_webhooks: 2, */
/*   request: { id: null, idempotency_key: null }, */
/*   type: "checkout.session.completed", */
/* }; */
