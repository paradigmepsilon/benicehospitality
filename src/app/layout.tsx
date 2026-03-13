import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Dancing_Script } from "next/font/google";
import "./globals.css";


const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://benicehospitalitygroup.com"),
  title: {
    default: "Be Nice Hospitality Group",
    template: "%s | Be Nice Hospitality Group",
  },
  description:
    "Boutique hotel consulting and technology for independent luxury hotels with 10–50 rooms. Direct booking strategy, operations, guest experience, and Guestally software.",
  keywords: [
    "boutique hotel consulting",
    "independent hotel revenue management",
    "boutique hotel direct booking strategy",
    "hotel guest experience consulting",
    "boutique hotel technology consulting",
    "hotel upsell automation",
    "small hotel operations consulting",
  ],
  authors: [{ name: "Be Nice Hospitality Group" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://benicehospitalitygroup.com",
    siteName: "Be Nice Hospitality Group",
    images: [
      {
        url: "/images/hero-banner.png",
        width: 1200,
        height: 630,
        alt: "Be Nice Hospitality Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/hero-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dancingScript.variable}`}
    >
      <head>
        <link rel="icon" href="/images/logo-icon.png" type="image/png" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
