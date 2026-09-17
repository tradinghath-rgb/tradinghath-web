export interface UserAdminType {
  id: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  isPro: boolean;
  proGrantedAt?: string;
  createdAt: string;
  paymentId?: string;
  utrId?: string;
  amount: number;
}

export const INITIAL_REGISTERED_USERS: UserAdminType[] = [
  {
    id: 'user_admin_01',
    username: 'tradinghath',
    email: 'tradinghath@gmail.com',
    password: '22NE1A04E1@093',
    phone: '+91 9390123456',
    isPro: true,
    amount: 399,
    proGrantedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'user_live_02',
    username: 'kiran_trader',
    email: 'kiran.reddy92@gmail.com',
    password: 'TradingPassword@123',
    phone: '+91 9848022334',
    isPro: true,
    amount: 399,
    utrId: '425983719283',
    proGrantedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'user_live_03',
    username: 'suresh_kumar',
    email: 'suresh.kumar88@gmail.com',
    password: 'SecureTrader#99',
    phone: '+91 9988776655',
    isPro: false,
    amount: 0,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

declare global {
  var __TRADINGHATH_USERS__: UserAdminType[] | undefined;
}

if (!global.__TRADINGHATH_USERS__) {
  global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
}

export function getAllUsers(): UserAdminType[] {
  if (!global.__TRADINGHATH_USERS__ || global.__TRADINGHATH_USERS__.length === 0) {
    global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
  }
  return global.__TRADINGHATH_USERS__;
}

export function registerNewUser(user: UserAdminType) {
  if (!global.__TRADINGHATH_USERS__) global.__TRADINGHATH_USERS__ = [];
  // Remove if already exists with same username/email
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.filter(
    u => u.username !== user.username && u.email !== user.email
  );
  global.__TRADINGHATH_USERS__.unshift(user);
}

export function updateUserProStatus(userId: string, isPro: boolean) {
  if (!global.__TRADINGHATH_USERS__) return;
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.map(u =>
    u.id === userId ? { ...u, isPro, proGrantedAt: isPro ? new Date().toISOString() : undefined } : u
  );
}

export function deleteUserPermanently(userId: string) {
  if (!global.__TRADINGHATH_USERS__) return;
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.filter(u => u.id !== userId);
}

export function changeUserPassword(userId: string, newPass: string) {
  if (!global.__TRADINGHATH_USERS__) return;
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.map(u =>
    u.id === userId ? { ...u, password: newPass } : u
  );
}

export function findUserByCredentials(identifier: string, pass: string): UserAdminType | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();
  const users = getAllUsers();
  
  const found = users.find(u =>
    (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
    u.password === cleanPass
  );

  return found || null;
}

