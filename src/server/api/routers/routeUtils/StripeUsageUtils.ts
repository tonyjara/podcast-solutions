import Decimal from "decimal.js";
import Stripe from "stripe";

export const registerStripeUsage = async ({
  usage,
  subscriptionItemId,
  stripe,
}: {
  subscriptionItemId: string;
  usage: number;
  stripe: Stripe;
}) => {
  const registerUsage = await stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity: usage,
      timestamp: Math.floor(Date.now() / 1000),
      action: "set",
    },
  );
  return registerUsage;
};

export interface ChatUsageHandler {
  usageAmount: number;
  currentAmount: Decimal;
  reportUsage: (usage: number) => Promise<any>;
  discountFromCredits: (amountToSubstract: Decimal) => Promise<any>;
}

export const handleChatUsage = async ({
  usageAmount,
  currentAmount,
  reportUsage,
  discountFromCredits,
}: ChatUsageHandler) => {
  const amountLeft = currentAmount.sub(usageAmount);
  const usageDecimal = new Decimal(usageAmount);

  const response = {
    substractedFromCredits: new Decimal(0),
    reportedToStripe: new Decimal(0),
    left: amountLeft.lessThan(0) ? new Decimal(0) : amountLeft,
  };

  //credit handling
  if (currentAmount.greaterThan(0)) {
    if (amountLeft.greaterThanOrEqualTo(0)) {
      await discountFromCredits(usageDecimal);
      response.substractedFromCredits = usageDecimal;
    }
    if (amountLeft.lessThan(0)) {
      await discountFromCredits(currentAmount);
      response.substractedFromCredits = currentAmount;
    }
  }

  //stripe usage handling
  if (currentAmount.lessThanOrEqualTo(0)) {
    await reportUsage(usageAmount);
    response.reportedToStripe = usageDecimal;
  }
  if (amountLeft.lessThan(0)) {
    const usageLeft = usageDecimal.sub(currentAmount);
    await reportUsage(usageLeft.toNumber());
    response.reportedToStripe = usageLeft;
  }

  return response;
};

export const calculateAudioMinutes = (audioDuration: number) => {
  const decimalDuration = new Decimal(audioDuration);
  const minutes = decimalDuration.div(60).ceil().toNumber();
  return minutes;
};