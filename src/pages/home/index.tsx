import { manageSubscription } from "@/lib/utils/SubscriptionManagementUtils";
import HomePage from "@/pageContainers/Home/HomePage.home";
import { getServerAuthSession } from "@/server/auth";
import { type GetServerSideProps } from "next";
export default HomePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);

  const subManager = await manageSubscription(session?.user.id);

  return (
    subManager ?? {
      props: {},
    }
  );
};
