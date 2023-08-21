import { prisma } from "@/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "stream/consumers";
import Stripe from "stripe";
import Cors from "micro-cors";
const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
export const config = {
  api: {
    bodyParser: false,
  },
};

interface StripeObject extends Stripe.Event.Data.Object {
  id: string;
  invoice: string;
}
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
      await prisma.subscription.create({
        data: {
          active: true,
          userId: payment.userId,
          stripeCustomerId: event.data.object.customer,
          stripePriceIds: payment.stripeLineItems,
          stripeSubscriptionId: event.data.object.subscription,
          payments: {
            connect: { id: payment.id },
          },
        },
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
