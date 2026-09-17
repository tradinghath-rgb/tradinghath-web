export interface User {
  id: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  isPro: boolean;
  proGrantedAt?: string;
  createdAt: string;
  paymentId?: string;
  utrId?: string;
}

export interface PostItem {
  id: string;
  title: string;
  description: string;
  type: 'chart' | 'video';
  language: 'english' | 'telugu' | 'both';
  chartUrl?: string;
  videoUrl?: string;
  downloadUrl?: string; // Charts can be downloaded, videos cannot
  scheduledAt?: string; // ISO String for schedule
  published: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId?: string;
  paymentId?: string;
  utrId?: string;
  userEmail: string;
  amount: number;
  status: 'captured' | 'pending_utr_verification' | 'failed' | 'verified';
  createdAt: string;
  method?: string;
}

export interface ReviewItem {
  id: string;
  userMasked: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

// Initial default posts matching the existing reels
export const INITIAL_POSTS: PostItem[] = [
  {
    id: 'p1',
    title: 'LQT Setup Strategy (Reel 24)',
    description: 'High probability Liquidity Sweep & Smart Money Setup with risk-reward ratio 1:3+.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    title: 'Why FVG Fails (Reel 15)',
    description: 'Avoid retail trap fair value gaps that get violated instantly.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/embed/ss24aZbCsYs?autoplay=1&rel=0&modestbranding=1',
    downloadUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  },

  {
    id: 'p3',
    title: 'Stop Loss Trap Identification (Reel 16)',
    description: 'How institutional market makers trigger retail stop loss clusters before moving.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-16(SL TRAP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    title: 'Head & Shoulders Anatomy (Reel 18)',
    description: 'True breakout confirmation vs false neckline breaches.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p5',
    title: 'Break of Structure (BOS) & CHOCH (Reel 11)',
    description: 'Market trend shift detection rule book with volume footprint.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/english/reel-11(BOS&CHOCH).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p6',
    title: 'Volume Secret & Fake Breakout Strategy (Reel 1 & 2)',
    description: 'Master institutional volume anomalies to capture explosive moves.',
    type: 'video',
    language: 'both',
    videoUrl: '/videos/english/reel-1(volume secret).mp4',
    published: true,
    createdAt: new Date().toISOString()
  }
];

// Helper to mask emails for privacy (e.g. tradinghath@gmail.com -> tr******th@gmail.com)
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'tr***@gmail.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const start = user.slice(0, 2);
  const end = user.slice(-2);
  const stars = '*'.repeat(Math.max(3, user.length - 4));
  return `${start}${stars}${end}@${domain}`;
}

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    userMasked: 'su******92@gmail.com',
    rating: 5,
    comment: 'The hand-made charts are exceptionally clear. The video explanation right beside the chart made the entry concepts crystal clear. Best ₹399 spent!',
    date: 'Today',
    verified: true
  },
  {
    id: 'r2',
    userMasked: 'pr****an@gmail.com',
    rating: 5,
    comment: 'Telugu & English videos both explain why SL traps happen. Saved me from 2 big fakeouts today already. Highly recommended.',
    date: 'Yesterday',
    verified: true
  },
  {
    id: 'r3',
    userMasked: 'ka****sh@gmail.com',
    rating: 5,
    comment: 'Lifetime access for 399 is unbelievable value. Instant activation after UPI payment with PhonePe.',
    date: '2 days ago',
    verified: true
  },
  {
    id: 'r4',
    userMasked: 'ra****07@gmail.com',
    rating: 5,
    comment: 'Very professional, clean layout, charts can be downloaded in high res on phone. Superb guidance by TradingHath.',
    date: '3 days ago',
    verified: true
  }
];
