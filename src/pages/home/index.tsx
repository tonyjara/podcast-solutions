import HomePage from "@/pageContainers/Home/HomePage.home";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { type GetServerSideProps } from "next";
export default HomePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      subscription: true,
    },
  });

  if (!user?.subscription?.active) {
    return {
      redirect: {
        destination: "/home/plans",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};
