import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./api/providers";
import OnlineStatusTracker from "./components/OnlineStatusTracker";

const poppins = Poppins ({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Co-Living for Landlord",
  description: "Web App for Landlord",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins} antialiased h-screen w-screen flex select-none`}
      >
        <Providers>
          <OnlineStatusTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
