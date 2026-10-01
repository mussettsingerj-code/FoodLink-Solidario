# FoodLink Solidario - Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: All paths in Firestore are denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **Strict Two-Role System**: A user profile in `/users/{userId}` can only ever have `role == 'buyer'` or `role == 'seller'`. No third role (`admin`, `public`, etc.) is permitted in Firestore.
3. **Identity Integrity**: A document at `/users/{userId}` can only be created, read (`get`), or updated by the authenticated user whose `request.auth.uid == userId` AND where `incoming().uid == request.auth.uid`.
4. **PII Isolation**: User documents contain PII (`email`, `phone`, `nitOrId`). Blanket reads and `list` queries on `/users` are strictly forbidden; only `get` by `isOwner(userId)` is permitted.
5. **Controlled Role Transition**: Once created, a user can transition from `'buyer'` to `'seller'` ("Quiero vender productos"), or update their profile metadata while preserving their current role. Arbitrary privilege escalation or immutable field tampering (`uid`, `email`, `createdAt`, `authProvider`) is denied.
6. **Temporal Integrity**: `createdAt` on document creation and `updatedAt` on both creation and updates must equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Identity Spoofing on Create**: User `uid_attacker` attempts to create `/users/uid_victim` or sets `uid: "uid_victim"`. -> `PERMISSION_DENIED`
2. **Invalid Third Role Injection**: User attempts to create `/users/uid_1` with `role: "admin"` or `role: "superadmin"`. -> `PERMISSION_DENIED`
3. **Shadow / Ghost Field Injection on Create**: Payload includes all required fields plus `isAdmin: true`. -> `PERMISSION_DENIED`
4. **Shadow / Ghost Field Injection on Update**: Update payload adds `customPrivilege: "all"`. -> `PERMISSION_DENIED`
5. **PII Blanket Read / Cross-User Get**: Authenticated user `uid_attacker` attempts `get(/users/uid_victim)`. -> `PERMISSION_DENIED`
6. **Unauthorized Collection Scraping (`list`)**: Authenticated user attempts `list(/users)`. -> `PERMISSION_DENIED`
7. **Timestamp Forgery on Create**: Payload provides a past/future client timestamp where `createdAt != request.time`. -> `PERMISSION_DENIED`
8. **Immortal Field Tampering (`createdAt`)**: User attempts to modify `createdAt` or `uid` or `email` during an update. -> `PERMISSION_DENIED`
9. **Value Poisoning on Update (`name` oversized)**: User updates `name` with a 5,000-character string (`size() > 120`). -> `PERMISSION_DENIED`
10. **ID Poisoning**: Path variable `{userId}` contains invalid characters or exceeds 128 chars. -> `PERMISSION_DENIED`
11. **Unauthenticated Write**: Anonymous/signed-out client attempts to create or update `/users/uid_1`. -> `PERMISSION_DENIED`
12. **Document Deletion**: User attempts to delete `/users/uid_1`. -> `PERMISSION_DENIED`
