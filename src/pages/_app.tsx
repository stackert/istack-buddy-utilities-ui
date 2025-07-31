import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import ReduxProvider from "@/components/Providers/ReduxProvider";
import ThemeProvider from "@/components/Providers/ThemeProvider";
import AppLayout from "@/components/Layout/AppLayout";

// Component that handles layout logic
function AppWithLayout({
  Component,
  pageProps,
}: {
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
}) {
  const router = useRouter();

  // App pages (like /app and /app/*) should not use the main AppLayout
  // since they use AppViewLayout internally
  const isAppView = router.pathname.startsWith("/app");

  if (isAppView) {
    return <Component {...pageProps} />;
  }

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>iStack Buddy</title>
        <meta name="description" content="iStack Buddy Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ReduxProvider>
        <ThemeProvider>
          <AppWithLayout Component={Component} pageProps={pageProps} />
        </ThemeProvider>
      </ReduxProvider>
    </>
  );
}
