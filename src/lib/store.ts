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
  videoUrlTelugu?: string;
  videoUrlEnglish?: string;
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

// 1. DEDICATED CHARTS (All 24 Hand-Made Chart Setups with Downloadable Blueprints & Dual-Language Explanations)
export const DEFAULT_CHARTS: PostItem[] = [
  {
    id: 'chart_1',
    title: 'Chart 1: Volume Secret Formula (Reel 1)',
    description: 'Master institutional volume anomalies to capture explosive directional moves with smart money volume footprint.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-1(volume secret).mp4',
    videoUrlTelugu: '/videos/telugu/reel-1(volume secret).mp4',
    videoUrlEnglish: '/videos/english/reel-1(volume secret).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_2',
    title: 'Chart 2: Fake Breakout Anatomy (Reel 2)',
    description: 'Identify retail fake breakout traps before entering and catch the high-probability institutional reversal.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-2(fake breakout).mp4',
    videoUrlTelugu: '/videos/telugu/reel-2(fake breakout).mp4',
    videoUrlEnglish: '/videos/english/reel-2(fake breakout).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_3',
    title: 'Chart 3: Support & Resistance Truth (Reel 3)',
    description: 'The real mechanics behind support & resistance levels in smart money institutional trading.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-3(supportt&resistance).mp4',
    videoUrlTelugu: '/videos/telugu/reel-3(supportt&resistance).mp4',
    videoUrlEnglish: '/videos/english/reel-3(supportt&resistance).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_4',
    title: 'Chart 4: Professional Trading Psychology (Reel 4)',
    description: 'Mental discipline, risk mitigation, and systematic execution frameworks for high-winrate trading.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-4(trading psychology).mp4',
    videoUrlTelugu: '/videos/telugu/reel-4(trading psychology).mp4',
    videoUrlEnglish: '/videos/english/reel-4(trading psychology).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_5',
    title: 'Chart 5: Institutional Liquidity Concepts (Reel 5)',
    description: 'Core concepts of how banks and financial institutions source liquidity from retail orders.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-5(liquiduty).mp4',
    videoUrlTelugu: '/videos/telugu/reel-5(liquiduty).mp4',
    videoUrlEnglish: '/videos/english/reel-5(liquiduty).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_6',
    title: 'Chart 6: High Win-Rate Order Block (Reel 6)',
    description: 'High probability order block selection rules and invalidation levels.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-6(order block).mp4',
    videoUrlTelugu: '/videos/telugu/reel-6(order block).mp4',
    videoUrlEnglish: '/videos/english/reel-6(order block).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_7',
    title: 'Chart 7: Trendline Traps & Liquidity (Reel 7)',
    description: 'Why standard retail trendlines fail and how smart money hunts liquidity around diagonal lines.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-7(trendline).mp4',
    videoUrlTelugu: '/videos/telugu/reel-7(trendline).mp4',
    videoUrlEnglish: '/videos/english/reel-7(trendline).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_8',
    title: 'Chart 8: Doji Candlestick Masterclass (Reel 8)',
    description: 'Decoding indecision candles in institutional supply & demand zones.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-8 (doji).mp4',
    videoUrlTelugu: '/videos/telugu/reel-8 (doji).mp4',
    videoUrlEnglish: '/videos/english/reel-8 (doji).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_9',
    title: 'Chart 9: 91% Accuracy Confluence (Reel 9)',
    description: 'Proven confluence setup combining liquidity sweeps and order flow confirmation.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-9(91% accurcy).mp4',
    videoUrlTelugu: '/videos/telugu/reel-9(91% accurcy).mp4',
    videoUrlEnglish: '/videos/english/reel-9(91% accurcy).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_10',
    title: 'Chart 10: Trade with Liquidity (Reel 10)',
    description: 'Entering along with liquidity grabs rather than getting swept by institutional algorithms.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-10(trade with lqty).mp4',
    videoUrlTelugu: '/videos/telugu/reel-10(trade with lqty).mp4',
    videoUrlEnglish: '/videos/english/reel-10(trade with lqty).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_11',
    title: 'Chart 11: BOS & CHOCH Trend Shifts (Reel 11)',
    description: 'Break of Structure (BOS) and Change of Character (CHOCH) trend detection rules.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-11(BOS&CHOCH).mp4',
    videoUrlTelugu: '/videos/telugu/reel-11(BOS&CHOCH).mp4',
    videoUrlEnglish: '/videos/english/reel-11(BOS&CHOCH).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_12',
    title: 'Chart 12: Bullish Candlestick Pattern (Reel 12)',
    description: 'Institutional buying footprint and high-momentum candlestick confirmation.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-12(BULLISH CANDLE PATTERN).mp4',
    videoUrlTelugu: '/videos/telugu/reel-12(BULLISH CANDLE PATTERN).mp4',
    videoUrlEnglish: '/videos/english/reel-12(BULLISH CANDLE PATTERN).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_13',
    title: 'Chart 13: Bearish Candlestick Pattern (Reel 13)',
    description: 'Institutional selling absorption and bearish continuation rules.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-13(BEARISH CANDLE PATTERN).mp4',
    videoUrlTelugu: '/videos/telugu/reel-13(BEARISH CANDLE PATTERN).mp4',
    videoUrlEnglish: '/videos/english/reel-13(BEARISH CANDLE PATTERN).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_14',
    title: 'Chart 14: Nifty Special Strategy (Reel 14)',
    description: 'Nifty index day-trading strategy for opening bell volatility and liquidity sweeps.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/reel-14(nifty ststrategy).mp4',
    videoUrlTelugu: '/videos/telugu/reel-14(nifty ststrategy).mp4',
    videoUrlEnglish: '/videos/english/reel-14(nifty ststrategy).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_15',
    title: 'Chart 15: Why FVG Fails in Retail Traps (Reel 15)',
    description: 'Avoid retail trap fair value gaps that get violated instantly.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4',
    videoUrlEnglish: '/videos/english/REEL-15(WHY FVG FAIL).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_16',
    title: 'Chart 16: Stop Loss Trap (SL Trap) (Reel 16)',
    description: 'How retail stop losses are hunted before massive directional moves occur.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-16(SL TRAP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-16(SL TRAP).mp4',
    videoUrlEnglish: '/videos/english/REEL-16(SL TRAP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_17',
    title: 'Chart 17: Support & Resistance Advanced (Reel 17)',
    description: 'Advanced liquidity level verification for high risk-to-reward executions.',
    type: 'chart',
    language: 'telugu',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    videoUrlEnglish: '',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_18',
    title: 'Chart 18: Head & Shoulder True Pattern (Reel 18)',
    description: 'Identify institutional traps in traditional head & shoulder patterns.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    videoUrlEnglish: '/videos/english/REEL-18(HEAD AND SHOULDE).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_19',
    title: 'Chart 19: Liquidity Grab & Sweep Mechanics (Reel 19)',
    description: 'Understanding price sweeps and liquidity pool grabs by large institutions.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    videoUrlEnglish: '/videos/english/REEL-19(LQT GRAB AND SWEEP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_20',
    title: 'Chart 20: Fake Breakout Reversal Mastery (Reel 20)',
    description: 'How to avoid entering false breakouts and trade the true reversal.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    videoUrlEnglish: '/videos/english/REEL-20(FAKE BREAKOUT).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_21',
    title: 'Chart 21: Perfect Sniper Entry Strategy (Reel 21)',
    description: 'Precision entry criteria with tight stop loss and maximum risk-to-reward.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    videoUrlEnglish: '/videos/english/REEL-21(PERFECT ENTRY).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_22',
    title: 'Chart 22: Double Top Institutional Rules (Reel 22)',
    description: 'Why standard retail double tops get liquidated and when to actually trade them.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    videoUrlEnglish: '/videos/english/REEL-22(DOUBLE TOP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_23',
    title: 'Chart 23: Double Bottom Trap Avoidance (Reel 23)',
    description: 'How institutional market makers create fake double bottoms to accumulate orders.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    videoUrlEnglish: '/videos/english/REEL-23(DOUBLE BOTTOM).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_24',
    title: 'Chart 24: High Probability LQT Setup (Reel 24)',
    description: 'Master institutional liquidity sweep & trade execution rules with tight invalidation.',
    type: 'chart',
    language: 'both',
    chartUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    videoUrl: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    videoUrlEnglish: '/videos/english/REE;-24(LQT SETUP).mp4',
    downloadUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

// 2. DEDICATED VIDEOS (Standalone Protected Video Reels)
export const DEFAULT_VIDEOS: PostItem[] = [
  // --- TELUGU REELS (All 24 Lessons) ---
  {
    id: 'vid_te_1',
    title: 'Reel 1: Volume Secret Formula (Telugu)',
    description: 'Master institutional volume anomalies to capture explosive directional moves.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-1(volume secret).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_2',
    title: 'Reel 2: Fake Breakout Anatomy (Telugu)',
    description: 'How to identify fake breakouts before entering and catch the true reversal.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-2(fake breakout).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_3',
    title: 'Reel 3: Support & Resistance Truth (Telugu)',
    description: 'The real mechanics behind support & resistance levels in smart money trading.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-3(supportt&resistance).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_4',
    title: 'Reel 4: Professional Trading Psychology (Telugu)',
    description: 'Mental discipline and execution frameworks for high-winrate trading.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-4(trading psychology).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_5',
    title: 'Reel 5: Institutional Liquidity Concepts (Telugu)',
    description: 'Core concepts of how banks and financial institutions source liquidity.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-5(liquiduty).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_6',
    title: 'Reel 6: High Win-Rate Order Block Strategy (Telugu)',
    description: 'High probability order block selection and risk mitigation guidelines.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-6(order block).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_7',
    title: 'Reel 7: Trendline Traps & Liquidity (Telugu)',
    description: 'Why standard retail trendlines fail and how smart money hunts liquidity.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-7(trendline).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_8',
    title: 'Reel 8: Doji Candlestick Masterclass (Telugu)',
    description: 'Decoding indecision candles in institutional supply & demand zones.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-8 (doji).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_9',
    title: 'Reel 9: 91% Accuracy Setup (Telugu)',
    description: 'Proven confluence setup combining liquidity sweeps and order flow.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-9(91% accurcy).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_10',
    title: 'Reel 10: Trade with Liquidity (Telugu)',
    description: 'Entering along with liquidity grabs rather than getting swept.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-10(trade with lqty).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_11',
    title: 'Reel 11: BOS & CHOCH Trend Shifts (Telugu)',
    description: 'Market trend shift detection rule book with volume footprint.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-11(BOS&CHOCH).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_12',
    title: 'Reel 12: Bullish Candle Pattern (Telugu)',
    description: 'Institutional buying footprint and high-momentum candlestick confirmation.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-12(BULLISH CANDLE PATTERN).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_13',
    title: 'Reel 13: Bearish Candle Pattern (Telugu)',
    description: 'Institutional selling absorption and bearish continuation rules.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-13(BEARISH CANDLE PATTERN).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_14',
    title: 'Reel 14: Nifty Special Strategy (Telugu)',
    description: 'Nifty index day-trading strategy for opening bell volatility.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/reel-14(nifty ststrategy).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_15',
    title: 'Reel 15: Why FVG Fails in Retail Traps (Telugu)',
    description: 'Avoid retail trap fair value gaps that get violated instantly.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_16',
    title: 'Reel 16: Stop Loss Trap (SL Trap) (Telugu)',
    description: 'How retail stop losses are hunted before massive directional moves.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-16(SL TRAP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_17',
    title: 'Reel 17: Support & Resistance Advanced (Telugu)',
    description: 'Advanced liquidity level verification for high RR executions.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_18',
    title: 'Reel 18: Head & Shoulder True Pattern (Telugu)',
    description: 'Identify institutional traps in traditional head & shoulder patterns.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_19',
    title: 'Reel 19: Liquidity Grab & Sweep Mechanics (Telugu)',
    description: 'Understanding price sweeps and liquidity pool grabs by large institutions.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_20',
    title: 'Reel 20: Fake Breakout Reversal Mastery (Telugu)',
    description: 'How to avoid entering false breakouts and trade the true reversal.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_21',
    title: 'Reel 21: Perfect Sniper Entry Strategy (Telugu)',
    description: 'Precision entry criteria with tight stop loss and max risk-to-reward.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_22',
    title: 'Reel 22: Double Top Institutional Rules (Telugu)',
    description: 'Why standard retail double tops get liquidated and when to actually trade them.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_23',
    title: 'Reel 23: Double Bottom Trap Avoidance (Telugu)',
    description: 'How institutional market makers create fake double bottoms to accumulate orders.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_te_24',
    title: 'Reel 24: High Probability LQT Setup (Telugu)',
    description: 'Master institutional liquidity sweep & trade execution rules.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },

  // --- ENGLISH REELS (All 23 Lessons) ---
  {
    id: 'vid_en_1',
    title: 'Reel 1: Volume Secret Formula (English)',
    description: 'Master institutional volume anomalies to capture explosive moves in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-1(volume secret).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_2',
    title: 'Reel 2: Fake Breakout Anatomy (English)',
    description: 'Identify false breakouts and trade high-probability smart money reversals.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-2(fake breakout).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_3',
    title: 'Reel 3: Support & Resistance Truth (English)',
    description: 'The real mechanics behind support & resistance levels in smart money trading.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-3(supportt&resistance).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_4',
    title: 'Reel 4: Professional Trading Psychology (English)',
    description: 'Mental discipline and execution frameworks for high-frequency trading.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-4(trading psychology).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_5',
    title: 'Reel 5: Institutional Liquidity Concepts (English)',
    description: 'Core concepts of how banks and financial institutions source liquidity.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-5(liquiduty).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_6',
    title: 'Reel 6: High Win-Rate Order Block Strategy (English)',
    description: 'High probability order block selection and risk mitigation guidelines.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-6(order block).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_7',
    title: 'Reel 7: Trendline Traps & Liquidity (English)',
    description: 'Why standard retail trendlines fail and how smart money hunts liquidity.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-7(trendline).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_8',
    title: 'Reel 8: Doji Candlestick Masterclass (English)',
    description: 'Decoding indecision candles in institutional supply & demand zones.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-8 (doji).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_9',
    title: 'Reel 9: 91% Accuracy Setup (English)',
    description: 'Proven confluence setup combining liquidity sweeps and order flow.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-9(91% accurcy).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_10',
    title: 'Reel 10: Trade with Liquidity (English)',
    description: 'Entering along with liquidity grabs rather than getting swept.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-10(trade with lqty).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_11',
    title: 'Reel 11: BOS & CHOCH Trend Shifts (English)',
    description: 'Market trend shift detection rule book with volume footprint in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-11(BOS&CHOCH).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_12',
    title: 'Reel 12: Bullish Candle Pattern (English)',
    description: 'Institutional buying footprint and high-momentum candlestick confirmation.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-12(BULLISH CANDLE PATTERN).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_13',
    title: 'Reel 13: Bearish Candle Pattern (English)',
    description: 'Institutional selling absorption and bearish continuation rules.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-13(BEARISH CANDLE PATTERN).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_14',
    title: 'Reel 14: Nifty Special Strategy (English)',
    description: 'Nifty index day-trading strategy for opening bell volatility.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/reel-14(nifty ststrategy).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_15',
    title: 'Reel 15: Why FVG Fails in Retail Traps (English)',
    description: 'Learn why retail fair value gaps fail and how smart money enters.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-15(WHY FVG FAIL).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_16',
    title: 'Reel 16: Stop Loss Trap (SL Trap) (English)',
    description: 'How retail stop losses are hunted before massive directional moves.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-16(SL TRAP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_18',
    title: 'Reel 18: Head & Shoulder True Pattern (English)',
    description: 'Identify institutional traps in traditional head & shoulder patterns.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-18(HEAD AND SHOULDE).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_19',
    title: 'Reel 19: Liquidity Grab & Sweep Mechanics (English)',
    description: 'Understanding price sweeps and liquidity pool grabs by large institutions.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-19(LQT GRAB AND SWEEP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_20',
    title: 'Reel 20: Fake Breakout Reversal Mastery (English)',
    description: 'How to avoid entering false breakouts and trade the true reversal in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-20(FAKE BREAKOUT).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_21',
    title: 'Reel 21: Perfect Sniper Entry Strategy (English)',
    description: 'Precision entry criteria with tight stop loss and max risk-to-reward.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-21(PERFECT ENTRY).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_22',
    title: 'Reel 22: Double Top Institutional Rules (English)',
    description: 'Why standard retail double tops get liquidated and when to actually trade them.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-22(DOUBLE TOP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_23',
    title: 'Reel 23: Double Bottom Trap Avoidance (English)',
    description: 'How institutional market makers create fake double bottoms to accumulate orders.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-23(DOUBLE BOTTOM).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'vid_en_24',
    title: 'Reel 24: High Probability LQT Setup (English)',
    description: 'Master institutional liquidity sweep & trade execution rules in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REE;-24(LQT SETUP).mp4',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
];

// Combine all initial posts into INITIAL_POSTS
export const INITIAL_POSTS: PostItem[] = [...DEFAULT_CHARTS, ...DEFAULT_VIDEOS];

// Helper: extract chart or reel numeric index (e.g. "Chart 24" -> 24, "Reel 24" -> 24)
export function getPostOrderNumber(post: PostItem): number {
  const match = (post.title || '').match(/(?:chart|reel)\s*(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

// Master descending sorting:
// 1. Newly created admin posts (e.g. post_123456789 or ISO timestamp after 2025-01-01) appear first (newest on top)
// 2. Default hand-made charts and reels appear in strict descending order: 24, 23, 22, ... down to 1 at the very bottom
export function sortPostsDescending(posts: PostItem[]): PostItem[] {
  const baselineEpoch = new Date('2025-01-02T00:00:00.000Z').getTime();

  return [...posts].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    const isDynamicA = timeA > baselineEpoch || a.id.startsWith('post_');
    const isDynamicB = timeB > baselineEpoch || b.id.startsWith('post_');

    // Both are new dynamic uploads: sort newest created first
    if (isDynamicA && isDynamicB) {
      return timeB - timeA;
    }
    // Dynamic post always goes above default 24
    if (isDynamicA && !isDynamicB) return -1;
    if (!isDynamicA && isDynamicB) return 1;

    // Both are default hand-made charts/reels: strict descending order 24, 23, 22 ... 3, 2, 1
    const orderA = getPostOrderNumber(a);
    const orderB = getPostOrderNumber(b);

    if (orderA !== orderB && orderA > 0 && orderB > 0) {
      return orderB - orderA; // 24 comes first, 1 comes last
    }

    return timeB - timeA;
  });
}

// "Recently Added" badge ONLY for posts created within 24 hours of today, and NEVER for default baseline posts
export function isRecentlyAdded(createdAt?: string, id?: string): boolean {
  if (!createdAt) return false;
  // Never badge default 24 hand-made charts and reels
  if (id && (id.startsWith('chart_') || id.startsWith('vid_te_') || id.startsWith('vid_en_') || id === 'vid_1' || id === 'vid_2')) {
    return false;
  }
  try {
    const postTime = new Date(createdAt).getTime();
    if (isNaN(postTime)) return false;
    const baselineEpoch = new Date('2025-01-02T00:00:00.000Z').getTime();
    if (postTime <= baselineEpoch) return false;

    const now = Date.now();
    const diffHours = (now - postTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  } catch (e) {
    return false;
  }
}


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
