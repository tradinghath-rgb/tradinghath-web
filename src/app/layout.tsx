import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'TradingHath | Premium Hand-Made Trading Charts & Video Explanations',
  description: 'Master Smart Money Concepts, Liquidity setups, Stop loss traps, and Price Action with verified hand-made trading charts and step-by-step video lessons.',
  icons: {
    icon: '/logo/general-profile-picture.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/logo/general-profile-picture.png" />
      </head>
      <body>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
