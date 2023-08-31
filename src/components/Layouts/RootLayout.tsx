import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import DrawerWithTopBar from "../Nav/DrawerWithTopBar";
import BottomSubscriptionEndBanner from "./BottomSubscriptionEndBanner";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = router.pathname.split("/");
  const title = pathName[pathName.length - 1];
  const isDevEnv = process.env.NODE_ENV;
  const handleTitles = (x: string) => {
    const titlesDictionary: any = {
      ["home"]: "PS Home",
      ["seed"]: "Seed",
    };
    return (x = titlesDictionary[x]
      ? `${titlesDictionary[x]}${isDevEnv ? " DEV" : ""}`
      : `PS${isDevEnv ? " DEV" : ""}`);
  };
  return (
    <>
      <DrawerWithTopBar>
        <Head>
          <title>{handleTitles(title ?? "")}</title>
        </Head>
        {children}
      </DrawerWithTopBar>
      <BottomSubscriptionEndBanner />
    </>
  );
};

export default RootLayout;
