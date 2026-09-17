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

// 1. DEDICATED CHARTS (Only Hand-Made Charts with downloadable blueprints)
export const DEFAULT_CHARTS: PostItem[] = [
  {
    id: 'chart_1',
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
    id: 'chart_2',
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
    id: 'chart_3',
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
    id: 'chart_4',
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
    id: 'chart_5',
    title: 'Break of Structure (BOS) & CHOCH (Reel 11)',
    description: 'Market trend shift detection rule book with volume footprint.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/english/reel-11(BOS&CHOCH).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: new Date().toISOString()
  }
];

// 2. DEDICATED VIDEOS (Standalone Protected Video Reels)
export const DEFAULT_VIDEOS: PostItem[] = [
  {
    id: 'vid_1',
    title: 'Reel 24: High Probability LQT Setup',
    description: 'Master institutional liquidity sweep & trade execution rules.',
    type: 'video',
    language: 'both',
    videoUrl: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_2',
    title: 'Reel 15: Why FVG Fails in Retail Traps',
    description: 'Learn why retail fair value gaps fail and how smart money enters.',
    type: 'video',
    language: 'telugu',
    videoUrl: 'https://www.youtube.com/embed/ss24aZbCsYs?autoplay=1&rel=0&modestbranding=1',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_3',
    title: 'Reel 16: Stop Loss Trap (SL Trap)',
    description: 'How retail stop losses are hunted before massive directional moves.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-16(SL TRAP).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_4',
    title: 'Reel 17: Support & Resistance Truth',
    description: 'The real mechanics behind support & resistance levels in smart money trading.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_5',
    title: 'Reel 18: Head & Shoulder True Pattern',
    description: 'Identify institutional traps in traditional head & shoulder patterns.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_6',
    title: 'Reel 19: Liquidity Grab & Sweep Mechanics',
    description: 'Understanding price sweeps and liquidity pool grabs by large institutions.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_7',
    title: 'Reel 20: Fake Breakout Anatomy',
    description: 'How to avoid entering false breakouts and trade the true reversal.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_8',
    title: 'Reel 21: Perfect Sniper Entry Strategy',
    description: 'Precision entry criteria with tight stop loss and max risk-to-reward.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_9',
    title: 'Reel 22: Double Top Institutional Rules',
    description: 'Why standard retail double tops get liquidated and when to actually trade them.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_10',
    title: 'Reel 23: Double Bottom Trap Avoidance',
    description: 'How institutional market makers create fake double bottoms to accumulate orders.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_11',
    title: 'Reel 1: Volume Secret Formula',
    description: 'Master institutional volume anomalies to capture explosive moves.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-1(volume secret).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_12',
    title: 'Reel 11: BOS & CHOCH Trend Shifts',
    description: 'Market trend shift detection rule book with volume footprint in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-11(BOS&CHOCH).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_13',
    title: 'Reel 5: Institutional Liquidity Concepts',
    description: 'Core concepts of how banks and financial institutions source liquidity.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-5(liquiduty).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_14',
    title: 'Reel 6: High Win-Rate Order Block Strategy',
    description: 'High probability order block selection and risk mitigation guidelines.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-6(order block).mp4',
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vid_15',
    title: 'Reel 4: Professional Trading Psychology',
    description: 'Mental discipline and execution frameworks for high-frequency trading.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-4(trading psychology).mp4',
    published: true,
    createdAt: new Date().toISOString()
  }
];

// Combine all initial posts into INITIAL_POSTS
export const INITIAL_POSTS: PostItem[] = [...DEFAULT_CHARTS, ...DEFAULT_VIDEOS];

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
