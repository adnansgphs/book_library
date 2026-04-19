# Security Specification - Aurelian Library

## Data Invariants
1. Books can only be created, modified, or deleted by authenticated users with the `admin` role.
2. Blog posts can only be created, modified, or deleted by authenticated users with the `admin` role.
3. User metadata is private to the owner, except for reading the `role` to verify permissions (though rules handle this server-side).
4. All timestamps (`createdAt`, `updatedAt`) must be server-generated.
5. All IDs must be valid strings.

## The Dirty Dozen (Test Payloads)
1. **Unauthorized Create**: An unauthenticated user tries to add a book. (DENIED)
2. **Standard User Create**: A user with `role: "user"` tries to add a book. (DENIED)
3. **Malicious Admin Promotion**: A standard user tries to update their own `role` to `"admin"`. (DENIED)
4. **Invalid ID Injection**: A user tries to create a book with an ID containing special characters like `../../../`. (DENIED)
5. **Schema Poisoning**: A user tries to add a book with an extremely large string (1MB) in the `isbn` field. (DENIED)
6. **Shadow Update**: A user tries to add a `verified: true` field to a book that doesn't exist in the schema. (DENIED)
7. **Timestamp Spoofing**: A user tries to set `createdAt` to a date in the past. (DENIED)
8. **PII Leak**: A non-admin user tries to read the email address of another user from the `users` collection. (DENIED)
9. **Orphaned Book**: A user tries to create a book without a valid `name`. (DENIED)
10. **State Shortcutting**: A user tries to update `createdBy` to someone else's UID. (DENIED)
11. **Blanket Query Scraping**: A user tries to list all user metadata entries. (DENIED)
12. **Malicious PDF Link**: A user tries to inject a script inside the `pdfUrl` field. (DENIED via size and format checks)

## Role Verification Path
Admin status is verified by checking `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`.
Initial admin: `adnan.sgphs@gmail.com`.
