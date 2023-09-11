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
import MetaTagsComponent from "@/components/Meta/MetaTagsComponent";
import Script from "next/script";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <MetaTagsComponent />
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <NextNProgress height={4} />
          <Toaster />
          <RootLayout>
            <Component {...pageProps} />
          </RootLayout>
        </ChakraProvider>
      </SessionProvider>

      {/* Google Analytics, block on dev because of weird errors */}
      {process.env.NODE_ENV !== "development" && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-MP1JB5G13Z"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MP1JB5G13Z');`}
          </Script>
        </>
      )}
      {/* 1. To check this is working correctly, open your browser's network tab, and filter for "gtag" requests. You should see a request to https://www.google-analytics.com/g/collect? followed by a long string of characters. If you see this, then you have successfully added Google Analytics to your Next.js app. */}
      {/* 2. Open the browser console, type dataleayer and press enter. You should see an array with argiments and events. If you see your measurement id here, then you have successfully added Google Analytics to your Next.js app. */}
    </>
  );
};

export default trpcClient.withTRPC(MyApp);
