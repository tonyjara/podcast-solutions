import SuccessPage from "@/pageContainers/Home/SuccessPage.home";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { type GetServerSideProps } from "next";
import Stripe from "stripe";

export default SuccessPage;

// This page retrieves the session from a checkout and redirects to the plans page if the user doesn't have a subscription or whose checkout failed

function returnHome() {
  return {
    redirect: {
      destination: "/home",
      permanent: false,
    },
    props: {},
  };
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const session_id = context.query.session_id as string | undefined;

    if (!session_id || !stripeKey) return returnHome();

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
    });

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    if (!checkoutSession.customer_details) return returnHome();
    if (checkoutSession.payment_status !== "paid") return returnHome();

    const payment = await prisma.payment.findUniqueOrThrow({
      where: { stripeSessionId: checkoutSession.id },
    });
    if (payment.validatedBySuccessPage) return returnHome();

    await prisma.payment.update({
      where: {
        stripeSessionId: checkoutSession.id,
      },
      data: {
        validatedBySuccessPage: true,
      },
    });
    return {
      props: { customerName: checkoutSession.customer_details.name },
    };
  } catch (error) {
    console.error(error);
  }

  return {
    props: {},
  };
};
