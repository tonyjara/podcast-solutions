import SettingsLayout from "@/components/Layouts/SettingsLayout";
import ProfileSettingsPage from "@/pageContainers/Home/Settings/ProfileSettings.home.settings";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { GetServerSideProps } from "next";
import React from "react";

const index = () => {
  return (
    <SettingsLayout>
      <ProfileSettingsPage />
    </SettingsLayout>
  );
};

export default index;

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
