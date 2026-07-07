import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import Navbar from "./components/navbar";
import { Toaster } from "sonner";
import { getCurrentUser } from "@/lib/auth";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Carreiros do Paraná",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const queryClient = new QueryClient();
  queryClient.setQueryData(["me"], user);

  return (
    <html lang="pt">
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Navbar />
            <main className="flex flex-1">{children}</main>
          </HydrationBoundary>
        </QueryProvider>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{ style: { fontSize: 16 } }}
        />
      </body>
    </html>
  );
}
