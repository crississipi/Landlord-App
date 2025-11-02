import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./api/providers";

const poppins = Poppins ({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Co-Living",
  description: "Tenant-Landlord App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins} antialiased h-[100vh] w-[100vw] flex select-none`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
