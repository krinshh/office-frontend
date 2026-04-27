import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    minimumScale: 0.5,
    maximumScale: 2,
    userScalable: true,
  };
}

export const metadata: Metadata = {
  title: "Office Management System",
  description: "Manage staff tasks, attendance, and salary calculations",
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preload" href="/Frame 11.png" as="image" />
      </head>
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"' }}>
        {children}
      </body>
    </html>
  );
}