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

declare global {
  var __TRADINGHATH_USERS__: UserAdminType[] | undefined;
}

if (!global.__TRADINGHATH_USERS__) {
  global.__TRADINGHATH_USERS__ = [];
}

export function getAllUsers(): UserAdminType[] {
  return global.__TRADINGHATH_USERS__ || [];
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

