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
  var __TRADINGHATH_PRO_OVERRIDES__: Record<string, boolean> | undefined;
}

if (!global.__TRADINGHATH_DELETED_USER_IDS__) {
  global.__TRADINGHATH_DELETED_USER_IDS__ = ['user_live_02', 'user_live_03'];
}

if (!global.__TRADINGHATH_PRO_OVERRIDES__) {
  global.__TRADINGHATH_PRO_OVERRIDES__ = {};
}

if (!global.__TRADINGHATH_USERS__) {
  global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
}

export function isUserDeleted(idOrEmailOrUsername: string): boolean {
  if (!global.__TRADINGHATH_DELETED_USER_IDS__) return false;
  const key = idOrEmailOrUsername.trim().toLowerCase();
  return global.__TRADINGHATH_DELETED_USER_IDS__.some(d => d.toLowerCase() === key);
}

export function getAllUsers(): UserAdminType[] {
  if (!global.__TRADINGHATH_USERS__) {
    global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
  }
  const deleted = new Set(global.__TRADINGHATH_DELETED_USER_IDS__ || []);
  const blocked = new Set(['kiran_trader', 'suresh_kumar', 'kiran.reddy92@gmail.com', 'suresh.kumar88@gmail.com']);
  const overrides = global.__TRADINGHATH_PRO_OVERRIDES__ || {};

  return global.__TRADINGHATH_USERS__
    .filter(u => 
      !deleted.has(u.id) &&
      !blocked.has(u.username?.toLowerCase()) &&
      !blocked.has(u.email?.toLowerCase())
    )
    .map(u => {
      if (overrides[u.id] !== undefined) {
        return { ...u, isPro: overrides[u.id] };
      }
      if (overrides[u.email?.toLowerCase()] !== undefined) {
        return { ...u, isPro: overrides[u.email.toLowerCase()] };
      }
      return u;
    });
}

export function registerNewUser(user: UserAdminType) {
  if (!global.__TRADINGHATH_USERS__) global.__TRADINGHATH_USERS__ = [];
  
  // If user is registering fresh (or was previously deleted), clear from deleted list
  if (global.__TRADINGHATH_DELETED_USER_IDS__) {
    const emailKey = user.email?.toLowerCase();
    const userKey = user.username?.toLowerCase();
    global.__TRADINGHATH_DELETED_USER_IDS__ = global.__TRADINGHATH_DELETED_USER_IDS__.filter(
      id => id !== user.id && id !== emailKey && id !== userKey
    );
  }

  const overrides = global.__TRADINGHATH_PRO_OVERRIDES__ || {};
  const effectiveIsPro = overrides[user.id] !== undefined ? overrides[user.id] : (overrides[user.email?.toLowerCase()] !== undefined ? overrides[user.email.toLowerCase()] : user.isPro);
  const userToAdd = { ...user, isPro: effectiveIsPro };

  // Remove if already exists with same username/email
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.filter(
    u => u.username?.toLowerCase() !== user.username?.toLowerCase() && u.email?.toLowerCase() !== user.email?.toLowerCase()
  );
  global.__TRADINGHATH_USERS__.unshift(userToAdd);
}

export function updateUserProStatus(userId: string, isPro: boolean) {
  if (!global.__TRADINGHATH_PRO_OVERRIDES__) {
    global.__TRADINGHATH_PRO_OVERRIDES__ = {};
  }
  global.__TRADINGHATH_PRO_OVERRIDES__[userId] = isPro;

  if (!global.__TRADINGHATH_USERS__) {
    global.__TRADINGHATH_USERS__ = [...INITIAL_REGISTERED_USERS];
  }

  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.map(u => {
    if (u.id === userId || u.email?.toLowerCase() === userId.toLowerCase() || u.username?.toLowerCase() === userId.toLowerCase()) {
      // Also register override for email
      if (u.email) {
        global.__TRADINGHATH_PRO_OVERRIDES__![u.email.toLowerCase()] = isPro;
      }
      return { ...u, isPro, proGrantedAt: isPro ? new Date().toISOString() : undefined };
    }
    return u;
  });
}

export function deleteUserPermanently(userIdOrEmail: string) {
  if (!global.__TRADINGHATH_DELETED_USER_IDS__) global.__TRADINGHATH_DELETED_USER_IDS__ = [];
  const cleanKey = userIdOrEmail.trim().toLowerCase();
  if (!global.__TRADINGHATH_DELETED_USER_IDS__.includes(cleanKey)) {
    global.__TRADINGHATH_DELETED_USER_IDS__.push(cleanKey);
  }

  // Also remove from overrides
  if (global.__TRADINGHATH_PRO_OVERRIDES__) {
    delete global.__TRADINGHATH_PRO_OVERRIDES__[cleanKey];
    delete global.__TRADINGHATH_PRO_OVERRIDES__[userIdOrEmail];
  }

  if (!global.__TRADINGHATH_USERS__) return;

  // Find user to also block their email and username
  const target = global.__TRADINGHATH_USERS__.find(
    u => u.id === userIdOrEmail || u.email?.toLowerCase() === cleanKey || u.username?.toLowerCase() === cleanKey
  );
  if (target) {
    if (target.id && !global.__TRADINGHATH_DELETED_USER_IDS__.includes(target.id)) {
      global.__TRADINGHATH_DELETED_USER_IDS__.push(target.id);
    }
    if (target.email && !global.__TRADINGHATH_DELETED_USER_IDS__.includes(target.email.toLowerCase())) {
      global.__TRADINGHATH_DELETED_USER_IDS__.push(target.email.toLowerCase());
    }
    if (target.username && !global.__TRADINGHATH_DELETED_USER_IDS__.includes(target.username.toLowerCase())) {
      global.__TRADINGHATH_DELETED_USER_IDS__.push(target.username.toLowerCase());
    }
  }

  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.filter(
    u => u.id !== userIdOrEmail && u.email?.toLowerCase() !== cleanKey && u.username?.toLowerCase() !== cleanKey
  );
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

