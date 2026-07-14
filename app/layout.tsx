import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WriteBook AI — Realistic Handwriting Generator",
  description:
    "Transform your text into beautiful, realistic handwritten notes on notebook paper. Multiple styles, templates, and export options.",
  keywords: [
    "handwriting generator",
    "handwritten notes",
    "notebook paper",
    "handwriting simulator",
    "student assignments",
    "handwriting AI",
  ],
  openGraph: {
    title: "WriteBook AI",
    description: "Generate realistic handwritten notes on notebook paper",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Caveat:wght@400;600&family=Architects+Daughter&family=Kalam:wght@300;400;700&family=Dancing+Script:wght@400;700&family=Schoolbell&family=Pacifico&family=Patrick+Hand&family=Chewy&family=Reenie+Beanie&family=Rock+Salt&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased overflow-hidden h-screen">{children}</body>
    </html>
  );
}
