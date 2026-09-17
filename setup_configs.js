const fs = require('fs');

const tsconfig = {
  compilerOptions: {
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: false,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [{ name: 'next' }],
    paths: { '@/*': ['./src/*'] }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
};
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  }
};
module.exports = nextConfig;
`;
fs.writeFileSync('next.config.js', nextConfigContent);

const envContent = `# TradingHath Configuration
NEXT_PUBLIC_APP_NAME="TradingHath"
NEXT_PUBLIC_PRICE="399"
NEXT_PUBLIC_SUPPORT_EMAIL="tradinghath@gmail.com"

# Razorpay Credentials (Live)
RAZORPAY_KEY_ID="rzp_live_TclwORJF0hO0sJ"
RAZORPAY_KEY_SECRET="5muzlTULoD2MTvD3Kyz8cHvC"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_TclwORJF0hO0sJ"

# Admin Access Credentials
ADMIN_USERNAME="tradinghath"
ADMIN_PASSWORD="22NE1A04E1@093"
ADMIN_SECRET_PIN="9390"
`;
fs.writeFileSync('.env.local', envContent);

console.log('Configs successfully created');
