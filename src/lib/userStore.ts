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
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_abhishek_01',
    username: 'abhisheknaidu',
    email: 'abhisheknaidu2005@gmail.com',
    password: '22NE1A04E1',
    phone: '+91 9390123456',
    isPro: true,
    amount: 399,
    proGrantedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

declare global {
  var __TRADINGHATH_USERS__: UserAdminType[] | undefined;
  var __TRADINGHATH_DELETED_USER_IDS__: string[] | undefined;
}

if (!global.__TRADINGHATH_DELETED_USER_IDS__) {
  global.__TRADINGHATH_DELETED_USER_IDS__ = ['user_live_02', 'user_live_03'];
}

if (!global.__TRADINGHATH_USERS__) {
  global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
}

export function getAllUsers(): UserAdminType[] {
  if (!global.__TRADINGHATH_USERS__) {
    global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
  }
  const deleted = new Set(global.__TRADINGHATH_DELETED_USER_IDS__ || []);
  const blocked = new Set(['kiran_trader', 'suresh_kumar', 'kiran.reddy92@gmail.com', 'suresh.kumar88@gmail.com']);
  return global.__TRADINGHATH_USERS__.filter(u => 
    !deleted.has(u.id) &&
    !blocked.has(u.username?.toLowerCase()) &&
    !blocked.has(u.email?.toLowerCase())
  );
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
  if (!global.__TRADINGHATH_DELETED_USER_IDS__) global.__TRADINGHATH_DELETED_USER_IDS__ = [];
  if (!global.__TRADINGHATH_DELETED_USER_IDS__.includes(userId)) {
    global.__TRADINGHATH_DELETED_USER_IDS__.push(userId);
  }
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
  
  const found = users.find(u => {
    const matchId = u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId;
    if (!matchId) return false;
    
    if (u.password === cleanPass) return true;
    // Allow either with or without @093 suffix if credentials match
    if (u.password && (u.password.replace(/@.*$/, '') === cleanPass.replace(/@.*$/, ''))) return true;
    return false;
  });

  return found || null;
}

