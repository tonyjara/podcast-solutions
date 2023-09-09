import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";
import { randomAvatar } from "@/lib/Constants";
import { validateVerify } from "@/components/Validations/verify.validate";
import { createServerLog } from "@/server/serverUtils";
import {
  addSubscriptionCredits,
  creditsPerPlan,
} from "./routeUtils/StripeUsageUtils";
import { addMonths } from "date-fns";

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(validateVerify).mutation(async ({ input }) => {
    const hashedPass = await bcrypt.hash(input.password, 10);

    const account = await prisma.account.create({
      data: {
        email: input.email,
        password: hashedPass,
        isVerified: true,
      },
    });
    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        image: randomAvatar(),
        account: {
          connect: {
            id: account.id,
          },
        },
      },
    });
    const subscription = await prisma.subscription.create({
      data: {
        active: true,
        isFreeTrial: true,
        cancellAt: addMonths(new Date(), 1),
        userId: user.id,
      },
    });

    const credits = creditsPerPlan("TRIAL");
    //INPUT
    const lastInputAction = await prisma.subscriptionCreditsActions.findFirst({
      where: { subscriptionId: subscription.id, tag: "CHAT_INPUT" },
      orderBy: { id: "desc" },
    });
    await addSubscriptionCredits({
      tag: "CHAT_INPUT",
      lastAction: lastInputAction,
      amount: credits.chatInput,
      subscriptionId: subscription.id,
    });

    //OUTPUT
    const lastOutputAction = await prisma.subscriptionCreditsActions.findFirst({
      where: { subscriptionId: subscription.id, tag: "CHAT_OUTPUT" },
      orderBy: { id: "desc" },
    });
    await addSubscriptionCredits({
      tag: "CHAT_OUTPUT",
      lastAction: lastOutputAction,
      amount: credits.chatOutput,
      subscriptionId: subscription.id,
    });

    //TRANSCRIPTION
    const lastTranscriptionAction =
      await prisma.subscriptionCreditsActions.findFirst({
        where: {
          subscriptionId: subscription.id,
          tag: "TRANSCRIPTION_MINUTE",
        },
        orderBy: { id: "desc" },
      });
    await addSubscriptionCredits({
      tag: "TRANSCRIPTION_MINUTE",
      lastAction: lastTranscriptionAction,
      amount: credits.transcription,
      subscriptionId: subscription.id,
    });
    await createServerLog(`User ${input.email} signed up`, "INFO");
    await prisma.accountVerificationLinks.updateMany({
      where: { id: input.linkId },
      data: { hasBeenUsed: true },
    });
  }),
});
