import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
