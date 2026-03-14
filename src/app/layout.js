import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin", "hebrew"] });

const BASE_URL = "https://mini-israel.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "מיני ישראל – המשחק הישראלי",
  description: "בנה את הבית שלך, אסוף ביצים, קנה פריטים ותתחרה עם חברים במשחק הישראלי הכי כיף ברשת!",
  keywords: ["מיני ישראל", "משחק ישראלי", "משחק אונליין", "mini israel"],
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "מיני ישראל",
    title: "מיני ישראל – המשחק הישראלי",
    description: "בנה את הבית שלך, אסוף ביצים, קנה פריטים ותתחרה עם חברים במשחק הישראלי הכי כיף ברשת!",
    images: [
      {
        url: `${BASE_URL}/assets/splash.png`,
        width: 1200,
        height: 630,
        alt: "מיני ישראל – המשחק הישראלי",
      },
    ],
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "מיני ישראל – המשחק הישראלי",
    description: "בנה את הבית שלך, אסוף ביצים, קנה פריטים ותתחרה עם חברים במשחק הישראלי הכי כיף ברשת!",
    images: [`${BASE_URL}/assets/splash.png`],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico", rel: "shortcut icon" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "manifest", url: "/favicon/site.webmanifest" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={fredoka.variable} dir="rtl">
        {children}
      </body>
    </html>
  );
}
