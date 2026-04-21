import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "VetVisitCost.com | Find Affordable Vet Care",
  description: "Find out what your vet visit should cost, find affordable vets near you, and locate low-cost clinics in your area.",
  verification: {
    google: "U28_jDz5VuoQPDUSc7e3BVEPPasYOJKP9_wFTb54tAk",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
