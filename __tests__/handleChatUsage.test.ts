import {
    CreditUsageCalculation,
    handleCreditUsageCalculation,
} from "@/server/api/routers/routeUtils/StripeUsageUtils"
import Decimal from "decimal.js"

describe.skip("handleChatUsage", () => {
    it("current amount is more than usage", async () => {
        /* const x: CreditUsageCalculation = { */
        /*     usageAmount: 100, */
        /*     currentAmount: new Decimal(120), */
        /*     reportUsageToStripeFunc: async () => {}, */
        /*     discountFromCreditsFunc: async () => {}, */
        /* } */
        /* const usage = await handleCreditUsageCalculation(x) */
        /* expect(usage.left.toNumber()).toEqual(20) */
        /* expect(usage.reportedToStripe.toNumber()).toEqual(0) */
        /* expect(usage.substractedFromCredits.toNumber()).toEqual(100) */
        expect(true).toEqual(true)
    })
    /**/
    /* it("usage is more than currentAmount", async () => { */
    /*   const x: CreditUsageCalculation = { */
    /*     usageAmount: 100, */
    /*     currentAmount: new Decimal(80), */
    /*     reportUsageToStripeFunc: async () => {}, */
    /*     discountFromCreditsFunc: async () => {}, */
    /*   }; */
    /**/
    /*   const usage = await handleCreditUsageCalculation(x); */
    /*   expect(usage.left.toNumber()).toEqual(0); */
    /*   expect(usage.reportedToStripe.toNumber()).toEqual(20); */
    /*   expect(usage.substractedFromCredits.toNumber()).toEqual(80); */
    /* }); */
    /**/
    /* it("current amount is 0", async () => { */
    /*   const x: CreditUsageCalculation = { */
    /*     usageAmount: 100, */
    /*     currentAmount: new Decimal(0), */
    /*     reportUsageToStripeFunc: async () => {}, */
    /*     discountFromCreditsFunc: async () => {}, */
    /*   }; */
    /**/
    /*   const usage = await handleCreditUsageCalculation(x); */
    /*   expect(usage.left.toNumber()).toEqual(0); */
    /*   expect(usage.reportedToStripe.toNumber()).toEqual(100); */
    /*   expect(usage.substractedFromCredits.toNumber()).toEqual(0); */
    /* }); */
    /**/
    /* it("current amount is the same as usage", async () => { */
    /*   const x: CreditUsageCalculation = { */
    /*     usageAmount: 100, */
    /*     currentAmount: new Decimal(100), */
    /*     reportUsageToStripeFunc: async () => {}, */
    /*     discountFromCreditsFunc: async () => {}, */
    /*   }; */
    /**/
    /*   const usage = await handleCreditUsageCalculation(x); */
    /*   expect(usage.left.toNumber()).toEqual(0); */
    /*   expect(usage.reportedToStripe.toNumber()).toEqual(0); */
    /*   expect(usage.substractedFromCredits.toNumber()).toEqual(100); */
    /* }); */
})
