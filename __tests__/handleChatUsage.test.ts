import {
  ChatUsageHandler,
  handleChatUsage,
} from "@/server/api/routers/routeUtils/StripeUsageUtils";
import Decimal from "decimal.js";

describe("handleChatUsage", () => {
  it("current amount is more than usage", async () => {
    const x: ChatUsageHandler = {
      usageAmount: 100,
      currentAmount: new Decimal(120),
      reportUsage: async () => {},
      discountFromCredits: async () => {},
    };
    const usage = await handleChatUsage(x);
    expect(usage.left.toNumber()).toEqual(20);
    expect(usage.reportedToStripe.toNumber()).toEqual(0);
    expect(usage.substractedFromCredits.toNumber()).toEqual(100);
  });

  it("usage is more than currentAmount", async () => {
    const x: ChatUsageHandler = {
      usageAmount: 100,
      currentAmount: new Decimal(80),
      reportUsage: async () => {},
      discountFromCredits: async () => {},
    };

    const usage = await handleChatUsage(x);
    expect(usage.left.toNumber()).toEqual(0);
    expect(usage.reportedToStripe.toNumber()).toEqual(20);
    expect(usage.substractedFromCredits.toNumber()).toEqual(80);
  });

  it("current amount is 0", async () => {
    const x: ChatUsageHandler = {
      usageAmount: 100,
      currentAmount: new Decimal(0),
      reportUsage: async () => {},
      discountFromCredits: async () => {},
    };

    const usage = await handleChatUsage(x);
    expect(usage.left.toNumber()).toEqual(0);
    expect(usage.reportedToStripe.toNumber()).toEqual(100);
    expect(usage.substractedFromCredits.toNumber()).toEqual(0);
  });

  it("current amount is the same as usage", async () => {
    const x: ChatUsageHandler = {
      usageAmount: 100,
      currentAmount: new Decimal(100),
      reportUsage: async () => {},
      discountFromCredits: async () => {},
    };

    const usage = await handleChatUsage(x);
    expect(usage.left.toNumber()).toEqual(0);
    expect(usage.reportedToStripe.toNumber()).toEqual(0);
    expect(usage.substractedFromCredits.toNumber()).toEqual(100);
  });
});
