import React from "react";
import type { Metadata } from "next";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "Pusoy Dos",
  description: "Pusoy Dos, a card shedding game for 2 players",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
        }}
      >
        {/* Wrap children with a client-side ThemeRegistry */}
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
