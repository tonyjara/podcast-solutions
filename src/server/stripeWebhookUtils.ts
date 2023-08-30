/// <reference types="stripe-event-types" />
import Stripe from "stripe";
import { prisma } from "./db";
import { StripePriceTag } from "@prisma/client";
import { fromUnixTime, isAfter } from "date-fns";
import {
  addSubscriptionCredits,
  creditsPerPlan,
} from "./api/routers/routeUtils/StripeUsageUtils";

export const handleCheckoutSessionCompleted = async ({
  stripe,
  event,
}: {
  stripe: Stripe;
  event: Stripe.DiscriminatedEvent;
}) => {
  if (event.type === "checkout.session.completed") {
    const eventObject = event.data.object;
    if (!eventObject.subscription || !eventObject.customer) {
      return;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      eventObject.subscription.toString(),
    );
    // stripeSubscription is a subscription based on a product, when getting the object from subscription we also get the subscription items
    const subscriptionItems = stripeSubscription.items.data;
    const prodId = subscriptionItems[0]?.price.product as string;
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: prodId },
    });

    const paymentIntent = await prisma.paymentIntent.update({
      where: { id: eventObject.id }, //session id
      data: {
        confirmedByWebhookAt: new Date(),
        validatedByWebhook: true,
        confirmationEventId: event.id,
      },
    });

    if (!paymentIntent.userId) {
      console.error(
        "No user id found for payment, subscription not created",
        paymentIntent.id,
      );
      return;
    }

    // Every time a user subscribes, create a subscription in the database and create add credits to the user according to the plan
    const PSSubscription = await prisma.subscription.create({
      data: {
        id: eventObject.subscription.toString(),
        productId: product.id,
        active: true,
        userId: paymentIntent.userId,
        stripeCustomerId: eventObject.customer.toString(),
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
  }
};

export const handleSubscriptionUpdated = async ({
  event,
}: {
  event: Stripe.DiscriminatedEvent;
}) => {
  if (event.type === "customer.subscription.updated") {
    const subscriptionEvent = event.data.object;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionEvent.id },
    });
    if (!subscription) {
      console.error("Subscription not found", subscriptionEvent.id);
      return;
    }
    const handleActiveState = () => {
      // When a subscription is canceled cancel_at is not null. When a subscription is reactivated cancel_at is null. In that case activate if the subbscription was inactive
      if (!subscriptionEvent.cancel_at && !subscription.active) {
        return true;
      }

      //If its past the cancelation date and the subscription is active, cancel it
      if (
        subscriptionEvent.cancel_at &&
        isAfter(new Date(), subscriptionEvent.cancel_at) &&
        subscription.active
      ) {
        return false;
      }

      return subscription.active;
    };

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        active: handleActiveState(),
        cancelAt: subscriptionEvent.cancel_at
          ? fromUnixTime(subscriptionEvent.cancel_at ?? 0)
          : null,

        canceledAt: subscriptionEvent.canceled_at
          ? fromUnixTime(subscriptionEvent.canceled_at ?? 0)
          : null,
        eventCancelationId: subscriptionEvent.cancel_at ? event.id : null,
      },
    });
  }
};

export const handleInvoicePaid = async ({
  e,
}: {
  e: Stripe.DiscriminatedEvent;
}) => {
  if (e.type === "invoice.paid") {
    const event = e.data.object;
    //If subscription is active add credits

    if (!event.subscription) return;

    const psSubscription = await prisma.subscription.findUnique({
      where: { id: event.subscription.toString() },
      include: { product: true },
    });
    if (!psSubscription) {
      console.error("Subscription not found", event.subscription);
      return;
    }
    if (psSubscription.product.planType === "FREE") return;

    const credits = creditsPerPlan(psSubscription.product.planType);

    //INPUT
    const lastInputAction = await prisma.subscriptionCreditsActions.findFirst({
      where: { subscriptionId: psSubscription.id, tag: "CHAT_INPUT" },
      orderBy: { id: "desc" },
    });
    await addSubscriptionCredits({
      tag: "CHAT_INPUT",
      lastAction: lastInputAction,
      amount: credits.chatInput,
      subscriptionId: psSubscription.id,
    });

    //OUTPUT
    const lastOutputAction = await prisma.subscriptionCreditsActions.findFirst({
      where: { subscriptionId: psSubscription.id, tag: "CHAT_OUTPUT" },
      orderBy: { id: "desc" },
    });
    await addSubscriptionCredits({
      tag: "CHAT_OUTPUT",
      lastAction: lastOutputAction,
      amount: credits.chatOutput,
      subscriptionId: psSubscription.id,
    });

    //TRANSCRIPTION
    const lastTranscriptionAction =
      await prisma.subscriptionCreditsActions.findFirst({
        where: {
          subscriptionId: psSubscription.id,
          tag: "TRANSCRIPTION_MINUTE",
        },
        orderBy: { id: "desc" },
      });
    await addSubscriptionCredits({
      tag: "TRANSCRIPTION_MINUTE",
      lastAction: lastTranscriptionAction,
      amount: credits.transcription,
      subscriptionId: psSubscription.id,
    });
  }
};
