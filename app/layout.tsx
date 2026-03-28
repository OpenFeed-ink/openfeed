import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { Geist_Mono, Nunito, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenFeed: Open Source Alternative to Canny and Frill",
  description: "Collect feedback, manage your roadmap, and publish changelog updates",
  metadataBase: new URL("https://app.openfeed.ink"),
  applicationName: "OpenFeed",
   keywords: [
    'open source canny alternative',
    'canny alternative',
    'frill alternative',
    'open source feedback tool',
    'feature request board open source',
    'self hosted feedback tool',
    'changelog widget',
    'roadmap tool open source',
  ],
  openGraph: {
    title: "OpenFeed",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <main
            className="relative flex min-h-screen"
          >
            {children}
          </main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
