import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control | The AI Desktop Agent",
  description: "Control performs the tasks you don't want to do — an era where you don't need to know everything about an application to use it. No more 'how-to' tutorials. Private, powerful, and invisible.",
  icons: {
    icon: '/icon-removebg-preview.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <script
        defer
        data-website-id="dfid_LiSnGhW8MKZTGO5MjdjnX"
        data-domain="controlbeta.vercel.app"
        src="https://datafa.st/js/script.js">
      </script>
      <meta name="google-site-verification" content="Z5jtrNKeBp7wHAjIz8Qe5zVY0N07BFwdh_feY7ouwhY" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
