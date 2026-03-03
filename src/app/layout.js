import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = { title: "מיני ישראל", description: "מיני ישראל" };

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable}`} dir="rtl">
        {children}
      </body>
    </html>
  );
}
