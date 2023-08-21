import "react-day-picker/dist/style.css";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import NextNProgress from "nextjs-progressbar";
import "@/styles/globals.css";
import "react-quill/dist/quill.snow.css";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/styles/Theme";
import RootLayout from "@/components/Layouts/RootLayout";
import { trpcClient } from "@/utils/api";
import { Toaster } from "react-hot-toast";
import "../styles/customize-progress-bar.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <NextNProgress height={4} />
        <Toaster />
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default trpcClient.withTRPC(MyApp);
