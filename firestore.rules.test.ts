/**
 * Security Rules Verification Suite for FoodLink Solidario
 * Validates that all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  authUid: string | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Create',
    operation: 'create',
    path: '/users/uid_victim',
    authUid: 'uid_attacker',
    payload: { uid: 'uid_victim', role: 'buyer' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Invalid Third Role Injection (admin)',
    operation: 'create',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { uid: 'uid_1', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Create (isAdmin: true)',
    operation: 'create',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { uid: 'uid_1', role: 'buyer', isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Update',
    operation: 'update',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { role: 'seller', isVerifiedAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'PII Cross-User Get',
    operation: 'get',
    path: '/users/uid_victim',
    authUid: 'uid_attacker',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unauthorized User Collection List Scraping',
    operation: 'list',
    path: '/users',
    authUid: 'uid_attacker',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Timestamp Forgery on Create',
    operation: 'create',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { uid: 'uid_1', role: 'buyer', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immortal Field Tampering (createdAt / uid)',
    operation: 'update',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { createdAt: '2099-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Value Poisoning on Update (oversized name)',
    operation: 'update',
    path: '/users/uid_1',
    authUid: 'uid_1',
    payload: { name: 'A'.repeat(500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'ID Poisoning on Path Variable',
    operation: 'create',
    path: '/users/invalid$id!@#',
    authUid: 'invalid$id!@#',
    payload: { uid: 'invalid$id!@#', role: 'buyer' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthenticated Write Attempt',
    operation: 'create',
    path: '/users/uid_1',
    authUid: null,
    payload: { uid: 'uid_1', role: 'buyer' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'User Profile Deletion Attempt',
    operation: 'delete',
    path: '/users/uid_1',
    authUid: 'uid_1',
    expected: 'PERMISSION_DENIED',
  },
];
