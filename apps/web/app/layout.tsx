import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query";

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
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
