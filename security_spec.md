# Security Specification - Bazzar Elegant Fashion

## 1. Data Invariants
- A **Product** must have a unique ID, non-empty name, non-negative price, and valid category.
- An **Order** must have customer contact details, at least one item, and a valid status.
- A **Report** must have a sender name, contact info, and a message.
- **Site Config** is global and controls the top banner and promotional popup.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **ID Poisoning**: Create a product with a 1MB string as ID.
2. **Identity Spoofing**: Create an order using another user's email/UID if authenticated.
3. **Price Manipulation**: Create a product with a negative price.
4. **Status Skipping**: Update an order status directly to 'delivered' from 'pending' if restricted.
5. **Ghost Fields**: Add an `isVerified: true` field to a product.
6. **Large Resource**: Add a 1MB string to the `bannerText` in Site Config.
7. **PII Leak**: A guest user tries to 'list' all orders.
8. **Invalid Types**: Send a boolean as a product price.
9. **Missing Fields**: Create an order without items.
10. **Shadow Updates**: Try to change the `date` of an existing order.
11. **Malicious Regex**: Use script tags in a product name.
12. **Collection Crawling**: Try to list `siteConfig` without explicit permission if restricted.

## 3. Test Runner (Conceptual)
All tests in `firestore.rules.test.ts` will verify `PERMISSION_DENIED` for the above payloads.
