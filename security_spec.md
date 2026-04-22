# Security Specification - Bazaar App

## 1. Data Invariants
- A **Product** must have a unique ID, non-negative price, and valid category.
- An **Order** must have customer contact details and a non-empty items list.
- A **Report** must have a description and a valid type.
- **Site Config** is a singleton document at `siteConfig/global`.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Anonymous Order Overwrite**: Try to delete or update an order without being the admin or creator.
2. **Product Price Injection**: Try to update a product price as a regular user.
3. **Ghost Field Injection**: Add `isAdmin: true` to a user document or order.
4. **ID Poisoning**: Use a 2KB string as a `productId`.
5. **Negative Price**: Create a product with `price: -100`.
6. **Massive Array**: Create an order with 10,000 items (Resource Exhaustion).
7. **System Field Hijack**: User trying to change `siteConfig` banner text.
8. **Invalid Status**: Changing order status to a non-existent state like `delivered_for_free`.
9. **Creation Timestamp Spoofing**: Sending a `createdAt` from 1999.
10. **PII Leak**: Non-admin user trying to list all `orders` to see other customers' addresses.
11. **Shadow Update**: Updating a product using the `create` logic to bypass `update` constraints.
12. **Orphaned Writes**: Creating an order that references a non-existent product ID (if enforced).

## 3. Test Runner Strategy
We will implement `firestore.rules` with strict validation helpers for each entity.

### Identity
- `isAdmin()`: Checks if the user's email matches `mohamederrabani951@gmail.com`.
- `isSignedIn()`: Checks if `request.auth` is not null.
