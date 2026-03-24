import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "المستشار | خبير القانون المدني العراقي",
  description: "المستشار هو مساعد ذكي متخصص في القانون المدني العراقي، يقدم استشارات وحلول قانونية مبنية على النصوص والمواد القانونية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlex.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
