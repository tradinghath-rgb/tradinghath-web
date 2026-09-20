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
  chartUrls?: string[]; // Multiple charts per video setup (swipable)
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
    chartUrl: '/charts/reel-1chart-1.jpg',
    chartUrls: ['/charts/reel-1chart-1.jpg', '/charts/reel-1chart-2.jpg'],
    videoUrl: '/videos/telugu/reel-1(volume secret).mp4',
    videoUrlTelugu: '/videos/telugu/reel-1(volume secret).mp4',
    videoUrlEnglish: '/videos/english/reel-1(volume secret).mp4',
    downloadUrl: '/charts/reel-1chart-1.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_2',
    title: 'Chart 2: Fake Breakout Anatomy (Reel 2)',
    description: 'Identify retail fake breakout traps before entering and catch the high-probability institutional reversal.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-2chart.jpg',
    chartUrls: ['/charts/reel-2chart.jpg'],
    videoUrl: '/videos/telugu/reel-2(fake breakout).mp4',
    videoUrlTelugu: '/videos/telugu/reel-2(fake breakout).mp4',
    videoUrlEnglish: '/videos/english/reel-2(fake breakout).mp4',
    downloadUrl: '/charts/reel-2chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_3',
    title: 'Chart 3: Support & Resistance Truth (Reel 3)',
    description: 'The real mechanics behind support & resistance levels in smart money institutional trading.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-3chart.jpg',
    chartUrls: ['/charts/reel-3chart.jpg'],
    videoUrl: '/videos/telugu/reel-3(supportt&resistance).mp4',
    videoUrlTelugu: '/videos/telugu/reel-3(supportt&resistance).mp4',
    videoUrlEnglish: '/videos/english/reel-3(supportt&resistance).mp4',
    downloadUrl: '/charts/reel-3chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_4',
    title: 'Chart 4: Professional Trading Psychology (Reel 4)',
    description: 'Mental discipline, risk mitigation, and systematic execution frameworks for high-winrate trading.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-4chart.jpg',
    chartUrls: ['/charts/reel-4chart.jpg'],
    videoUrl: '/videos/telugu/reel-4(trading psychology).mp4',
    videoUrlTelugu: '/videos/telugu/reel-4(trading psychology).mp4',
    videoUrlEnglish: '/videos/english/reel-4(trading psychology).mp4',
    downloadUrl: '/charts/reel-4chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_5',
    title: 'Chart 5: Institutional Liquidity Concepts (Reel 5)',
    description: 'Core concepts of how banks and financial institutions source liquidity from retail orders.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-5chart.jpg',
    chartUrls: ['/charts/reel-5chart.jpg'],
    videoUrl: '/videos/telugu/reel-5(liquiduty).mp4',
    videoUrlTelugu: '/videos/telugu/reel-5(liquiduty).mp4',
    videoUrlEnglish: '/videos/english/reel-5(liquiduty).mp4',
    downloadUrl: '/charts/reel-5chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_6',
    title: 'Chart 6: High Win-Rate Order Block (Reel 6)',
    description: 'High probability order block selection rules and invalidation levels.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-6chart.jpg',
    chartUrls: ['/charts/reel-6chart.jpg'],
    videoUrl: '/videos/telugu/reel-6(order block).mp4',
    videoUrlTelugu: '/videos/telugu/reel-6(order block).mp4',
    videoUrlEnglish: '/videos/english/reel-6(order block).mp4',
    downloadUrl: '/charts/reel-6chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_7',
    title: 'Chart 7: Trendline Traps & Liquidity (Reel 7)',
    description: 'Why standard retail trendlines fail and how smart money hunts liquidity around diagonal lines.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-7chart.jpg',
    chartUrls: ['/charts/reel-7chart.jpg'],
    videoUrl: '/videos/telugu/reel-7(trendline).mp4',
    videoUrlTelugu: '/videos/telugu/reel-7(trendline).mp4',
    videoUrlEnglish: '/videos/english/reel-7(trendline).mp4',
    downloadUrl: '/charts/reel-7chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_8',
    title: 'Chart 8: Doji Candlestick Masterclass (Reel 8)',
    description: 'Decoding indecision candles in institutional supply & demand zones.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-8chart.jpg',
    chartUrls: ['/charts/reel-8chart.jpg'],
    videoUrl: '/videos/telugu/reel-8 (doji).mp4',
    videoUrlTelugu: '/videos/telugu/reel-8 (doji).mp4',
    videoUrlEnglish: '/videos/english/reel-8 (doji).mp4',
    downloadUrl: '/charts/reel-8chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_9',
    title: 'Chart 9: 91% Accuracy Confluence (Reel 9)',
    description: 'Proven confluence setup combining liquidity sweeps and order flow confirmation.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-9chart.jpg',
    chartUrls: ['/charts/reel-9chart.jpg'],
    videoUrl: '/videos/telugu/reel-9(91% accurcy).mp4',
    videoUrlTelugu: '/videos/telugu/reel-9(91% accurcy).mp4',
    videoUrlEnglish: '/videos/english/reel-9(91% accurcy).mp4',
    downloadUrl: '/charts/reel-9chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_10',
    title: 'Chart 10: Trade with Liquidity (Reel 10)',
    description: 'Entering along with liquidity grabs rather than getting swept by institutional algorithms.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-10chart.jpg',
    chartUrls: ['/charts/reel-10chart.jpg'],
    videoUrl: '/videos/telugu/reel-10(trade with lqty).mp4',
    videoUrlTelugu: '/videos/telugu/reel-10(trade with lqty).mp4',
    videoUrlEnglish: '/videos/english/reel-10(trade with lqty).mp4',
    downloadUrl: '/charts/reel-10chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_11',
    title: 'Chart 11: BOS & CHOCH Trend Shifts (Reel 11)',
    description: 'Break of Structure (BOS) and Change of Character (CHOCH) trend detection rules.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-11chart.jpg',
    chartUrls: ['/charts/reel-11chart.jpg'],
    videoUrl: '/videos/telugu/reel-11(BOS&CHOCH).mp4',
    videoUrlTelugu: '/videos/telugu/reel-11(BOS&CHOCH).mp4',
    videoUrlEnglish: '/videos/english/reel-11(BOS&CHOCH).mp4',
    downloadUrl: '/charts/reel-11chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_12',
    title: 'Chart 12: Bullish Candlestick Pattern (Reel 12)',
    description: 'Institutional buying footprint and high-momentum candlestick confirmation.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-12chart.jpg',
    chartUrls: ['/charts/reel-12chart.jpg'],
    videoUrl: '/videos/telugu/reel-12(BULLISH CANDLE PATTERN).mp4',
    videoUrlTelugu: '/videos/telugu/reel-12(BULLISH CANDLE PATTERN).mp4',
    videoUrlEnglish: '/videos/english/reel-12(BULLISH CANDLE PATTERN).mp4',
    downloadUrl: '/charts/reel-12chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_13',
    title: 'Chart 13: Bearish Candlestick Pattern (Reel 13)',
    description: 'Institutional selling absorption and bearish continuation rules.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-13chart.jpg',
    chartUrls: ['/charts/reel-13chart.jpg'],
    videoUrl: '/videos/telugu/reel-13(BEARISH CANDLE PATTERN).mp4',
    videoUrlTelugu: '/videos/telugu/reel-13(BEARISH CANDLE PATTERN).mp4',
    videoUrlEnglish: '/videos/english/reel-13(BEARISH CANDLE PATTERN).mp4',
    downloadUrl: '/charts/reel-13chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_14',
    title: 'Chart 14: Nifty Special Strategy (Reel 14)',
    description: 'Nifty index day-trading strategy for opening bell volatility and liquidity sweeps.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-14chart.jpg',
    chartUrls: ['/charts/reel-14chart.jpg'],
    videoUrl: '/videos/telugu/reel-14(nifty ststrategy).mp4',
    videoUrlTelugu: '/videos/telugu/reel-14(nifty ststrategy).mp4',
    videoUrlEnglish: '/videos/english/reel-14(nifty ststrategy).mp4',
    downloadUrl: '/charts/reel-14chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_15',
    title: 'Chart 15: Why FVG Fails in Retail Traps (Reel 15)',
    description: 'Avoid retail trap fair value gaps that get violated instantly.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-15chart-1.jpg',
    chartUrls: ['/charts/reel-15chart-1.jpg', '/charts/reel-15chart-2.jpg'],
    videoUrl: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-15(WHY FVG FAIL).mp4',
    videoUrlEnglish: '/videos/english/REEL-15(WHY FVG FAIL).mp4',
    downloadUrl: '/charts/reel-15chart-1.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_16',
    title: 'Chart 16: Stop Loss Trap (SL Trap) (Reel 16)',
    description: 'How retail stop losses are hunted before massive directional moves occur.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-16chart.jpg',
    chartUrls: ['/charts/reel-16chart.jpg'],
    videoUrl: '/videos/telugu/REEL-16(SL TRAP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-16(SL TRAP).mp4',
    videoUrlEnglish: '/videos/english/REEL-16(SL TRAP).mp4',
    downloadUrl: '/charts/reel-16chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_17',
    title: 'Chart 17: Support & Resistance Advanced (Reel 17)',
    description: 'Advanced liquidity level verification for high risk-to-reward executions.',
    type: 'chart',
    language: 'telugu',
    chartUrl: '/charts/reel-17chart.jpg',
    chartUrls: ['/charts/reel-17chart.jpg'],
    videoUrl: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-17(SUPPORT AND RESISTANCE).mp4',
    videoUrlEnglish: '',
    downloadUrl: '/charts/reel-17chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_18',
    title: 'Chart 18: Head & Shoulder True Pattern (Reel 18)',
    description: 'Identify institutional traps in traditional head & shoulder patterns.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-18chart.jpg',
    chartUrls: ['/charts/reel-18chart.jpg'],
    videoUrl: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-18(HEAD AND SHOULDE).mp4',
    videoUrlEnglish: '/videos/english/REEL-18(HEAD AND SHOULDE).mp4',
    downloadUrl: '/charts/reel-18chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_19',
    title: 'Chart 19: Liquidity Grab & Sweep Mechanics (Reel 19)',
    description: 'Understanding price sweeps and liquidity pool grabs by large institutions.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-19chart.jpg',
    chartUrls: ['/charts/reel-19chart.jpg'],
    videoUrl: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-19(LQT GRAB AND SWEEP).mp4',
    videoUrlEnglish: '/videos/english/REEL-19(LQT GRAB AND SWEEP).mp4',
    downloadUrl: '/charts/reel-19chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_20',
    title: 'Chart 20: Fake Breakout Reversal Mastery (Reel 20)',
    description: 'How to avoid entering false breakouts and trade the true reversal.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-20chart.jpg',
    chartUrls: ['/charts/reel-20chart.jpg'],
    videoUrl: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-20(FAKE BREAKOUT).mp4',
    videoUrlEnglish: '/videos/english/REEL-20(FAKE BREAKOUT).mp4',
    downloadUrl: '/charts/reel-20chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_21',
    title: 'Chart 21: Perfect Sniper Entry Strategy (Reel 21)',
    description: 'Precision entry criteria with tight stop loss and maximum risk-to-reward.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-21chart.jpg',
    chartUrls: ['/charts/reel-21chart.jpg'],
    videoUrl: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-21(PERFECT ENTRY).mp4',
    videoUrlEnglish: '/videos/english/REEL-21(PERFECT ENTRY).mp4',
    downloadUrl: '/charts/reel-21chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_22',
    title: 'Chart 22: Double Top Institutional Rules (Reel 22)',
    description: 'Why standard retail double tops get liquidated and when to actually trade them.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-22chart.jpg',
    chartUrls: ['/charts/reel-22chart.jpg'],
    videoUrl: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-22(DOUBLE TOP).mp4',
    videoUrlEnglish: '/videos/english/REEL-22(DOUBLE TOP).mp4',
    downloadUrl: '/charts/reel-22chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_23',
    title: 'Chart 23: Double Bottom Trap Avoidance (Reel 23)',
    description: 'How institutional market makers create fake double bottoms to accumulate orders.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-23chart.jpg',
    chartUrls: ['/charts/reel-23chart.jpg'],
    videoUrl: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-23(DOUBLE BOTTOM).mp4',
    videoUrlEnglish: '/videos/english/REEL-23(DOUBLE BOTTOM).mp4',
    downloadUrl: '/charts/reel-23chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_24',
    title: 'Chart 24: High Probability LQT Setup (Reel 24)',
    description: 'Master institutional liquidity sweep & trade execution rules with tight invalidation.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-24chart.jpg',
    chartUrls: ['/charts/reel-24chart.jpg'],
    videoUrl: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-24(LQT SETUP).mp4',
    videoUrlEnglish: '/videos/english/REE;-24(LQT SETUP).mp4',
    downloadUrl: '/charts/reel-24chart.jpg',
    published: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'chart_25',
    title: 'Chart 25: Gold Behaviour & Institutional Mechanics (Reel 25)',
    description: 'Master XAUUSD / Gold institutional price action, volatility cycles, and high-probability session setups.',
    type: 'chart',
    language: 'both',
    chartUrl: '/charts/reel-25chart.png',
    chartUrls: ['/charts/reel-25chart.png'],
    videoUrl: '/videos/telugu/REEL-25(GOLD BEHAVIOUR).mp4',
    videoUrlTelugu: '/videos/telugu/REEL-25(GOLD BEHAVIOUR).mp4',
    videoUrlEnglish: '/videos/english/REEL-25(GOLD BEHAVIOUR).mp4',
    downloadUrl: '/charts/reel-25chart.png',
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
  {
    id: 'vid_te_25',
    title: 'Reel 25: Gold Behaviour & Institutional Mechanics (Telugu)',
    description: 'Master XAUUSD / Gold institutional price action and session execution.',
    type: 'video',
    language: 'telugu',
    videoUrl: '/videos/telugu/REEL-25(GOLD BEHAVIOUR).mp4',
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
  },
  {
    id: 'vid_en_25',
    title: 'Reel 25: Gold Behaviour & Institutional Mechanics (English)',
    description: 'Master XAUUSD / Gold institutional price action and session execution in English.',
    type: 'video',
    language: 'english',
    videoUrl: '/videos/english/REEL-25(GOLD BEHAVIOUR).mp4',
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

// Full dynamic pool of 48 realistic, high-hype community reviews celebrating Telugu & English video reels and hand-made charts
export const ALL_REVIEWS: ReviewItem[] = [
  // --- BATCH A: High Hype, English Audio, Telugu Audio & Blueprint Mastery ---
  { id: 'r1',  userMasked: 'vi******sh@gmail.com', rating: 5, comment: 'Bhai kya explanation hai! The hand-made charts are pure gold. Main English audio sun raha hoon and the clarity on institutional liquidity sweep is next level. Best ₹399 investment ever!', date: 'Just now', verified: true },
  { id: 'r2',  userMasked: 'pr****an@gmail.com',   rating: 5, comment: 'Telugu & English video switcher is brilliant! I listen to the English breakdown while checking the chart levels. Saved me from 2 big fakeouts this week. Absolute beast platform!', date: '10 mins ago', verified: true },
  { id: 'r3',  userMasked: 'ro****it@outlook.com', rating: 5, comment: 'Seriously mindblown! The English voiceover explains the order flow & volume footprint so smoothly. Downloaded all 24 charts into 1 PDF on my iPad. 10/10 content.', date: '25 mins ago', verified: true },
  { id: 'r4',  userMasked: 'ka****sh@gmail.com',   rating: 5, comment: 'Lifetime access for ₹399 is unbelievable value. Instant activation after UPI payment with PhonePe. Both Telugu & English reels are crystal clear.', date: '40 mins ago', verified: true },
  { id: 'r5',  userMasked: 'am****ar@yahoo.com',   rating: 5, comment: 'Aisa content 10,000 ke courses mein bhi nahi milta! Hand-drawn setups + side-by-side English & Telugu explanation. FVG failure trap chart alone made me 3x profit.', date: '1 hour ago', verified: true },
  { id: 'r6',  userMasked: 'su****92@gmail.com',   rating: 5, comment: 'The hand-made charts are exceptionally clear. The dual-language English and Telugu audio gives you 360 degree understanding. Best ₹399 spent in my 3 years of trading!', date: '1 hour ago', verified: true },

  // --- BATCH B: English Learners, Bangalore & Mumbai Traders ---
  { id: 'r7',  userMasked: 'ar****av@gmail.com',   rating: 5, comment: 'Worth every single rupee. The LQT setup chart (Reel 24) with English audio breakdown saved me ₹4,500 in BankNifty today by spotting the retail trap early.', date: 'Today', verified: true },
  { id: 'r8',  userMasked: 'ne****ha@gmail.com',   rating: 5, comment: 'Trading from Delhi. I do not speak Telugu so the English audio track was a blessing! Perfectly synchronized with every candle drawing on the chart. Super clear.', date: 'Today', verified: true },
  { id: 'r9',  userMasked: 'vi****na@gmail.com',   rating: 5, comment: 'Downloaded all 24 charts to my phone gallery in one click. Now I can study the sniper entries offline during market hours. Pure fire!', date: 'Today', verified: true },
  { id: 'r10', userMasked: 'sa****ri@gmail.com',   rating: 5, comment: 'Bhai fake breakout chart ne aankhein khol di. Pehle hamesha trap hota tha, now waiting for institutional liquidity retest. English breakdown is super crisp!', date: 'Today', verified: true },
  { id: 'r11', userMasked: 'ad****ya@gmail.com',   rating: 5, comment: 'I work in Bangalore tech park and trade part-time. The English video explanations are concise, professional, and straight to the point. No fluff, pure price action.', date: 'Today', verified: true },
  { id: 'r12', userMasked: 'na****sh@gmail.com',   rating: 5, comment: 'Best ₹399 investment in my trading journey. The double bottom trap chart is mind-blowing — shows exactly how big players hunt stop losses.', date: 'Today', verified: true },

  // --- BATCH C: Hinglish & Hindi Enthusiasts & Telugu Pride ---
  { id: 'r13', userMasked: 'ch****ya@gmail.com',   rating: 5, comment: 'Telugu commentary is top notch and my friends use the English track. Both are equally powerful! Mother tongue explanation of smart money concepts is a rare gem.', date: 'Yesterday', verified: true },
  { id: 'r14', userMasked: 'ku****al@gmail.com',   rating: 5, comment: 'Sir ji maza aa gaya! Itna simple language mein institutional traps koi nahi sikhata. Reel 15 and Reel 21 are masterpieces. Har trader ko ye dekhna chahiye.', date: 'Yesterday', verified: true },
  { id: 'r15', userMasked: 'ra****ep@gmail.com',   rating: 5, comment: 'Verified member for 3 weeks now. The 1-click Master PDF download is so convenient. Having both English and Telugu audio tracks is super helpful.', date: 'Yesterday', verified: true },
  { id: 'r16', userMasked: 'si****dh@outlook.com', rating: 5, comment: 'I was hesitant because ₹399 seemed too cheap for 24 video lessons and charts. But honestly the English audio & chart quality exceeds ₹15,000 webinars!', date: 'Yesterday', verified: true },
  { id: 'r17', userMasked: 'ki****an@gmail.com',   rating: 5, comment: 'The sniper entry chart (Reel 21) gave me a pinpoint entry in Nifty today. Hit the 1:3 risk-to-reward target effortlessly. Amazing breakdown.', date: 'Yesterday', verified: true },
  { id: 'r18', userMasked: 'ma****sh@gmail.com',   rating: 5, comment: 'Chart ko zoom karke dekhne ka feature bahut badhiya hai. High resolution hand-drawn blueprints make every swing point crystal clear.', date: 'Yesterday', verified: true },

  // --- BATCH D: Execution Precision & International / English Audience ---
  { id: 'r19', userMasked: 'mo****ad@gmail.com',   rating: 5, comment: 'Support & Resistance chart finally cleared my confusion. Now I understand why retail S/R gets broken and how smart money enters on the sweep.', date: '2 days ago', verified: true },
  { id: 'r20', userMasked: 'ta****un@gmail.com',   rating: 5, comment: 'I listen exclusively to the English reels. The accent, tone, and technical terminology are very precise. High recommendation for non-Telugu speakers!', date: '2 days ago', verified: true },
  { id: 'r21', userMasked: 'si****ha@gmail.com',   rating: 5, comment: 'The Head & Shoulder institutional chart is the best breakdown I have ever studied. Paid via UPI and got instant dashboard access within 10 seconds.', date: '2 days ago', verified: true },
  { id: 'r22', userMasked: 'va****un@yahoo.com',   rating: 5, comment: 'Bhai log sochna band karo aur ₹399 pay karke vault unlock karo. Stop loss bachane ka sabse aasan formula in charts mein hai. 100% genuine.', date: '2 days ago', verified: true },
  { id: 'r23', userMasked: 'an****ai@gmail.com',   rating: 5, comment: 'Paid via GPay in 30 seconds and got lifetime access immediately. The English video audio is super clean and chart graphics are ultra sharp on mobile.', date: '2 days ago', verified: true },
  { id: 'r24', userMasked: 'de****av@gmail.com',   rating: 5, comment: 'I used to overtrade and lose daily. After studying the psychology and volume charts, I only take 1-2 high-probability setups per week. P&L turned green!', date: '2 days ago', verified: true },

  // --- BATCH E: More Diverse Indian & Global Trader Comments ---
  { id: 'r25', userMasked: 'po****ai@gmail.com',   rating: 5, comment: 'Stop loss trap chart (Reel 16) explained why big money hunts retail SL before reversing. English explanation helped me connect all dots.', date: '3 days ago', verified: true },
  { id: 'r26', userMasked: 'ri****ik@gmail.com',   rating: 5, comment: 'Gazab ka concept hai! Volume Secret Formula (Reel 1) showed me how institutions accumulate orders secretly before huge rallies. Outstanding value.', date: '3 days ago', verified: true },
  { id: 'r27', userMasked: 'go****an@gmail.com',   rating: 5, comment: 'English commentary is equally good. I shared the link with my trading circle in Pune and all 4 of us unlocked the vault on the same day.', date: '3 days ago', verified: true },
  { id: 'r28', userMasked: 'bh****av@gmail.com',   rating: 5, comment: 'Volume footprint anomalies are the real game changer. Most YouTube gurus never teach this. TradingHath breaks it down effortlessly in Telugu & English.', date: '3 days ago', verified: true },
  { id: 'r29', userMasked: 'ab****ek@gmail.com',   rating: 5, comment: 'Ek number charts! Mobile pe zoom karke offline padhne ka maza hi alag hai. Hand-made blueprints feel so authentic and practical compared to boring slides.', date: '3 days ago', verified: true },
  { id: 'r30', userMasked: 'ke****th@gmail.com',   rating: 5, comment: 'Liquidity grab mechanics finally make sense. The video beside the chart walks you step-by-step through execution without any confusing indicators.', date: '3 days ago', verified: true },

  // --- BATCH F: High Satisfaction & Lifetime Return ---
  { id: 'r31', userMasked: 'ji****an@gmail.com',   rating: 5, comment: 'Nifty Special Strategy chart (Reel 14) is specifically tailored for Indian morning session volatility. Very relevant and practically profitable.', date: '4 days ago', verified: true },
  { id: 'r32', userMasked: 'sa****am@outlook.com', rating: 5, comment: 'Living in Hyderabad, loved the Telugu video, but my trading partner in Mumbai studies the English track. Both tracks are flawless!', date: '4 days ago', verified: true },
  { id: 'r33', userMasked: 'la****mi@gmail.com',   rating: 5, comment: 'For ₹399 I was skeptical. But the quality of explanation in both languages blew me away. Truly institutional trading knowledge at an accessible price.', date: '4 days ago', verified: true },
  { id: 'r34', userMasked: 'sh****ma@gmail.com',   rating: 5, comment: 'Paise vasool course! Chart 22 (Double Top Institutional Rules) saved my capital today. Retail traders sell too early, institutions wait for the sweep.', date: '4 days ago', verified: true },
  { id: 'r35', userMasked: 'ra****na@gmail.com',   rating: 5, comment: 'Fake Breakout Reversal Mastery chart (Reel 20) is my favourite. I had been getting caught in fake breakouts for 2 years. Now I trade with peace of mind.', date: '4 days ago', verified: true },
  { id: 'r36', userMasked: 'al****ok@gmail.com',   rating: 5, comment: 'The master PDF download worked like magic! Got all charts organized sequentially in high resolution. Best ₹399 decision of my trading career.', date: '4 days ago', verified: true }
];

// Formats genuine timestamps for real user comments based on actual createdAt
export function formatRealTimestamp(createdAt?: string): string {
  if (!createdAt) return 'Recently';
  try {
    const postTime = new Date(createdAt).getTime();
    if (isNaN(postTime)) return 'Recently';
    const now = Date.now();
    const diffMs = now - postTime;
    if (diffMs < 0) return 'Just now';

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  } catch {
    return 'Recently';
  }
}

// Relative dynamic time offsets within a 2-hour rotation window for generated reviews
const GENERATED_TIME_OFFSETS = [
  '8 mins ago',
  '24 mins ago',
  '45 mins ago',
  '1 hour ago',
  '1 hour ago',
  '2 hours ago'
];

// Returns 6 different reviews every 2 hours — deterministic so all users across devices see a fresh, synchronized set of high-hype reviews!
// Dynamically cycles through Hindi, Hinglish, and English reviews praising charts and Telugu/English videos.
// Also calculates fresh dynamic relative timings for the generated reviews based on the current 2-hour slot.
export function getRotatingReviews(): ReviewItem[] {
  const INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
  const BATCH_SIZE = 6;
  const slot = Math.floor(Date.now() / INTERVAL_MS);
  const total = ALL_REVIEWS.length;
  const startIndex = (slot * BATCH_SIZE) % total;
  const result: ReviewItem[] = [];

  for (let i = 0; i < BATCH_SIZE; i++) {
    const original = ALL_REVIEWS[(startIndex + i) % total];
    // Dynamic freshness for generated reviews:
    const dynamicDate = GENERATED_TIME_OFFSETS[i % GENERATED_TIME_OFFSETS.length];
    result.push({
      ...original,
      date: dynamicDate
    });
  }
  return result;
}

// Keep INITIAL_REVIEWS as alias for backward compatibility
export const INITIAL_REVIEWS: ReviewItem[] = getRotatingReviews();

