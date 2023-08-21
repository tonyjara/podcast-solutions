import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import DrawerWithTopBar from "../Nav/DrawerWithTopBar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathName = router.pathname.split("/");
  const title = pathName[pathName.length - 1];
  const defaultText = `PS ${
    process.env.NODE_ENV === "development" ? "DEV" : ""
  }`;
  const handleTitles = (x: string) => {
    const titlesDictionary: any = {
      ["money-accounts"]: "Cuentas",
      ["seed"]: "Seed",
      ["imbursements"]: "Desembolsos",
      ["requests"]: "Solicitudes",
      ["money-account-offset"]: "Ajustes",
    };
    return titlesDictionary[x] ?? defaultText;
  };
  return (
    <DrawerWithTopBar>
      <Head>
        <title>{handleTitles(title ?? "")}</title>
      </Head>
      {children}
    </DrawerWithTopBar>
  );
};

export default RootLayout;
