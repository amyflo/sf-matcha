import type { Metadata } from "next";
import { ReceiptSoundProvider } from "@/app/components/receipt-sound-provider";
import { WoodBackground } from "@/app/components/wood-background";
import { Caveat, Patrick_Hand, Special_Elite } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick",
  subsets: ["latin"],
  weight: "400",
});

const specialElite = Special_Elite({
  variable: "--font-receipt",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Matcha Menu | San Francisco",
  description: "A little handwritten gallery of SF matcha cafe picks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${patrickHand.variable} ${specialElite.variable} h-dvh antialiased`}
    >
      <body className="relative flex h-dvh min-h-0 flex-col overflow-hidden font-menu text-ink antialiased">
        <ReceiptSoundProvider>
          <WoodBackground />
          {children}
        </ReceiptSoundProvider>
      </body>
    </html>
  );
}
