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
  var __TRADINGHATH_PASSWORD_OVERRIDES__: Record<string, string> | undefined;
}

if (!global.__TRADINGHATH_DELETED_USER_IDS__) {
  global.__TRADINGHATH_DELETED_USER_IDS__ = ['user_live_02', 'user_live_03'];
}

if (!global.__TRADINGHATH_PRO_OVERRIDES__) {
  global.__TRADINGHATH_PRO_OVERRIDES__ = {};
}

if (!global.__TRADINGHATH_PASSWORD_OVERRIDES__) {
  global.__TRADINGHATH_PASSWORD_OVERRIDES__ = {};
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
  const proOverrides = global.__TRADINGHATH_PRO_OVERRIDES__ || {};
  const passOverrides = global.__TRADINGHATH_PASSWORD_OVERRIDES__ || {};

  return global.__TRADINGHATH_USERS__
    .filter(u => 
      !deleted.has(u.id) &&
      !blocked.has(u.username?.toLowerCase()) &&
      !blocked.has(u.email?.toLowerCase())
    )
    .map(u => {
      let updatedUser = { ...u };
      // Apply pro status override
      if (proOverrides[u.id] !== undefined) {
        updatedUser.isPro = proOverrides[u.id];
      } else if (proOverrides[u.email?.toLowerCase()] !== undefined) {
        updatedUser.isPro = proOverrides[u.email.toLowerCase()];
      }

      // Apply password override if changed by admin
      if (passOverrides[u.id]) {
        updatedUser.password = passOverrides[u.id];
      } else if (u.email && passOverrides[u.email.toLowerCase()]) {
        updatedUser.password = passOverrides[u.email.toLowerCase()];
      } else if (u.username && passOverrides[u.username.toLowerCase()]) {
        updatedUser.password = passOverrides[u.username.toLowerCase()];
      }

      return updatedUser;
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

  const proOverrides = global.__TRADINGHATH_PRO_OVERRIDES__ || {};
  const passOverrides = global.__TRADINGHATH_PASSWORD_OVERRIDES__ || {};

  const effectiveIsPro = proOverrides[user.id] !== undefined 
    ? proOverrides[user.id] 
    : (proOverrides[user.email?.toLowerCase()] !== undefined ? proOverrides[user.email.toLowerCase()] : user.isPro);

  // Preserve admin-set password override if exists
  let effectivePassword = user.password;
  if (passOverrides[user.id]) {
    effectivePassword = passOverrides[user.id];
  } else if (user.email && passOverrides[user.email.toLowerCase()]) {
    effectivePassword = passOverrides[user.email.toLowerCase()];
  } else if (user.username && passOverrides[user.username.toLowerCase()]) {
    effectivePassword = passOverrides[user.username.toLowerCase()];
  }

  const userToAdd = { ...user, isPro: effectiveIsPro, password: effectivePassword };

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
  if (global.__TRADINGHATH_PASSWORD_OVERRIDES__) {
    delete global.__TRADINGHATH_PASSWORD_OVERRIDES__[cleanKey];
    delete global.__TRADINGHATH_PASSWORD_OVERRIDES__[userIdOrEmail];
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

export function changeUserPassword(userId: string, newPass: string, email?: string, username?: string) {
  if (!global.__TRADINGHATH_PASSWORD_OVERRIDES__) {
    global.__TRADINGHATH_PASSWORD_OVERRIDES__ = {};
  }
  const trimmedPass = newPass.trim();
  global.__TRADINGHATH_PASSWORD_OVERRIDES__[userId] = trimmedPass;
  if (email) {
    global.__TRADINGHATH_PASSWORD_OVERRIDES__[email.trim().toLowerCase()] = trimmedPass;
  }
  if (username) {
    global.__TRADINGHATH_PASSWORD_OVERRIDES__[username.trim().toLowerCase()] = trimmedPass;
  }

  if (!global.__TRADINGHATH_USERS__) return;
  global.__TRADINGHATH_USERS__ = global.__TRADINGHATH_USERS__.map(u => {
    const isTarget =
      u.id === userId ||
      (email && u.email?.toLowerCase() === email.trim().toLowerCase()) ||
      (username && u.username?.toLowerCase() === username.trim().toLowerCase());
    if (isTarget) {
      if (u.email) global.__TRADINGHATH_PASSWORD_OVERRIDES__![u.email.toLowerCase()] = trimmedPass;
      if (u.username) global.__TRADINGHATH_PASSWORD_OVERRIDES__![u.username.toLowerCase()] = trimmedPass;
      return { ...u, password: trimmedPass };
    }
    return u;
  });
}

export function findUserByCredentials(identifier: string, pass: string): UserAdminType | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();
  const users = getAllUsers();
  
  const found = users.find(u => {
    const matchId = u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId;
    if (!matchId) return false;
    
    // Strict exact match with currently active password
    if (u.password === cleanPass) return true;

    // Backward-compatibility ONLY for admin default accounts if exact cleanPass matches without @093
    const isAdminAccount = u.username.toLowerCase() === 'tradinghath' || u.email.toLowerCase() === 'tradinghath@gmail.com';
    if (isAdminAccount && u.password && (u.password.replace(/@.*$/, '') === cleanPass.replace(/@.*$/, ''))) {
      return true;
    }
    return false;
  });

  return found || null;
}

export function getEffectivePassword(idOrEmailOrUsername: string): string | null {
  const passOverrides = global.__TRADINGHATH_PASSWORD_OVERRIDES__ || {};
  const key = idOrEmailOrUsername.trim().toLowerCase();
  if (passOverrides[idOrEmailOrUsername]) return passOverrides[idOrEmailOrUsername];
  if (passOverrides[key]) return passOverrides[key];

  const users = getAllUsers();
  const u = users.find(user => 
    user.id === idOrEmailOrUsername ||
    user.email?.toLowerCase() === key ||
    user.username?.toLowerCase() === key
  );
  return u?.password || null;
}

