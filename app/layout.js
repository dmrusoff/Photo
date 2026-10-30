import "./globals.css";
import { eventConfig } from "../config/event";

export const metadata = {
  title: `${eventConfig.title} | ${eventConfig.location} - Share Your Photos`,
  description: eventConfig.welcomeMessage,
  openGraph: {
    title: `${eventConfig.title} | Share Your Photos ${eventConfig.faviconEmoji}`,
    description: `${eventConfig.welcomeMessage} (${eventConfig.location} · ${eventConfig.date})`,
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <link
          rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${encodeURIComponent(
            eventConfig.faviconEmoji
          )}</text></svg>`}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
