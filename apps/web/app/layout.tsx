import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import Navbar from "./components/navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Carreiros do Paraná",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1">
          <QueryProvider>{children}</QueryProvider>
        </main>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{ style: { fontSize: 16 } }}
        />
      </body>
    </html>
  );
}
