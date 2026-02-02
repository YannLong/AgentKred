import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentKred - Trust Layer",
  description: "Identity and Reputation Protocol for AI Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
