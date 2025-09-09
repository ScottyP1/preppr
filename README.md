# Preppr API Guide

This document summarizes the backend API for frontend integration: endpoints, payloads, auth, and typical usage flows.

- Base API prefix: `/api/`
- Auth: JWT (access/refresh)
- Content type: send/receive JSON (`Content-Type: application/json`)
- Auth header: `Authorization: Bearer <access_token>`
 - Cart: endpoints under `/api/cart/` (see Cart section)

## Authentication

- POST `/api/auth/token/`
  - Purpose: Obtain JWT access/refresh tokens.
  - Body: `{ "username": "<email>", "password": "<password>" }`
    - Note: login field is `username`. Registration sets `username = email`.
  - Response: `{ "access": "...", "refresh": "..." }`

- POST `/api/auth/token/refresh/`
  - Purpose: Refresh an access token.
  - Body: `{ "refresh": "<refresh_token>" }`
  - Response: `{ "access": "..." }`

## Registration + Email Verification

- POST `/api/auth/register/`
  - Purpose: Create a new account (inactive until email verification). Automatically creates a Buyer or Seller profile.
  - Body:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassw0rd!",
      "password_confirm": "StrongPassw0rd!",
      "role": "buyer" | "seller",
      "first_name": "Optional",
      "last_name": "Optional"
    }
    ```
  - Response: `{ "user": { ... }, "detail": "Account created. Check your email to verify your address." }`

- GET `/api/auth/register/verify/<uidb64>/<token>/`
  - Purpose: Activate the account from the email link.
  - Auth: Not required.
  - Response: `200` with `{ "detail": "Email verified. You can now sign in." }` or `400` if invalid/expired.

- POST `/api/auth/register/resend/`
  - Purpose: Resend verification email.
  - Unauthenticated body: `{ "email": "user@example.com" }`
  - Authenticated: no body required; resends for current (inactive) user.
  - Response: `200` with `{ "detail": "Verification email sent." }`

## Current User (me)

All require `Authorization: Bearer <access>`.

- GET `/api/me/user/`
  - Purpose: Fetch the authenticated user.
  - Response: `{ "id", "username", "email", "role", "first_name", "last_name" }`
 - PUT/PATCH `/api/me/user/`
   - Purpose: Update profile name fields.
   - Writable fields: `first_name`, `last_name`.
   - Example:
     ```json
     { "first_name": "Jane", "last_name": "Doe" }
     ```
   - Notes: `username`, `email`, and `role` are read-only via this endpoint.

- GET/PUT/PATCH `/api/me/buyer_profile/`
  - Role: only for users with `role = buyer`.
  - Fields: `{ id, user, allergies, preference, location, address, zipcode, favorite_stall }`
  - Update example (PATCH):
    ```json
    { "zipcode": 60606, "favorite_stall": 12 }
    ```

- GET/PUT/PATCH `/api/me/seller_profile/`
  - Role: only for users with `role = seller`.
  - Fields: `{ id, user, location, address, zipcode, stall }`
  - Update example (PATCH):
    ```json
    { "address": "1 Main St", "zipcode": 94105, "stall": 3 }
    ```
  - Note: Addresses live on the buyer/seller profile objects, not on the user account.

- POST `/api/me/become_seller/`
  - Purpose: Upgrade an existing buyer account to a seller account.
  - Role: only for users with `role = buyer`.
  - Effect: sets `user.role = "seller"` and creates a blank `SellerProfile` if one does not exist.
  - Response: `201` with the created seller profile payload.
  - Notes: The `role` field on the user is read-only across APIs to prevent accidental switching; use this endpoint to change roles.

## Public Profiles (read-only)

Require `Authorization: Bearer <access>`.

- GET `/api/buyers/` and GET `/api/buyers/{id}/`
  - Lists or retrieves buyer profiles. Use `/me/buyer_profile/` to modify.

- GET `/api/sellers/` and GET `/api/sellers/{id}/`
  - Lists or retrieves seller profiles. Use `/me/seller_profile/` to modify.

## Stalls

Resource representing a seller’s stall/inventory. Now includes richer fields and buyer actions.

- Model fields include:
  - Basics: `product`, `description`, `image_url`
  - Location/availability: `location`, `quantity`, `radius_m`
  - Pricing/rating: `price_cents`, `price_level (1-4)`, `average_rating`, `rating_count`
  - Nutrition: `calories`, `fat_g`, `carbs_g`
  - Labels: `tags[]`, `allergens[]`
  - Details: `options[]`, `includes[]`, `special_requests_allowed`
- Permissions: Read is public. Create/Update/Delete require authenticated seller (`role = seller`).

Endpoints via DRF ViewSet:

- GET `/api/stalls/` — list (public)
- POST `/api/stalls/` — create (seller)
  ```json
  { "product": "Apples", "location": "Ferry Plaza", "quantity": 20, "radius_m": 1000 }
  ```
- GET `/api/stalls/{id}/` — retrieve (public)
- PUT/PATCH `/api/stalls/{id}/` — update (seller)
- DELETE `/api/stalls/{id}/` — delete (seller)

Custom action:

- POST `/api/stalls/{id}/set_quantity/`
  - Purpose: Quick way for sellers to update quantity.
  - Body: `{ "quantity": 15 }`
  - Response: the updated stall object.

- POST `/api/stalls/{id}/favorite/` (buyer)
  - Purpose: Mark this stall as the buyer’s favorite.
  - Auth: buyer JWT required.
  - Response: `{ "detail": "Favorited." }`

- POST `/api/stalls/{id}/request/` (buyer)
  - Purpose: Create a special request for a stall (e.g., “No asparagus”).
  - Body: `{ "note": "No asparagus" }`
  - Response: `201` with the created request.

Query params:
- `?tags=gluten-free,vegan` — filter to stalls that match any of the tag names
- `?allergens_exclude=fish,nuts` — exclude stalls that include any of the named allergens

### Images (Seller + Item cards)

We now support multiple image URLs per Stall and an image URL for the Seller profile.

Stall read shape includes images and seller image:

```json
{
  "id": 3,
  "product": "Apples",
  "image_url": "https://cdn.example/primary.jpg",        // legacy primary
  "images": [
    { "id": 11, "href": "https://cdn.example/primary.jpg", "alt_text": "Apples", "position": 0, "is_primary": true },
    { "id": 12, "href": "https://cdn.example/alt1.jpg",    "alt_text": "Apples", "position": 1, "is_primary": false }
  ],
  "seller_image_url": "https://cdn.example/seller.jpg"
}
```

Write support (create/update) accepts either `image_url` (single) or `image_urls` (list). When `image_urls` is provided, it replaces Stall images and sets the first as primary, also syncing `image_url` for legacy clients.

Example create (seller):

```json
{
  "product": "Apples",
  "location": "Ferry Plaza",
  "quantity": 20,
  "image_urls": [
    "https://cdn.example/apples-1.jpg",
    "https://cdn.example/apples-2.jpg"
  ]
}
```

Example update to replace images:

```json
{ "image_urls": ["https://cdn.example/new-primary.jpg"] }
```

Seller profile image

- Field on seller profile: `image_url` (URL). Update via `/api/me/seller_profile/`.

```bash
curl -X PATCH http://localhost:8000/api/me/seller_profile/ \
  -H 'Authorization: Bearer <access>' \
  -H 'Content-Type: application/json' \
  -d '{"image_url":"https://cdn.example/seller.jpg"}'
```

Notes:
- Frontend item cards can use `stall.images[0].href` for primary, fall back to `stall.image_url` if list empty. Seller avatar/logo can use `stall.seller_image_url` or fetch `/api/sellers/{id}/`.
- Alt text defaults to product name; can be extended later if needed.
- This stores remote URLs (hrefs) only; no file upload pipeline is involved.


## Cart

Cart connects buyers to stall inventory and enforces stock checks when adding/updating items and again during checkout. Only `buyer` role may use these endpoints. All require JWT.

- GET `/api/cart/`
  - Returns current open cart for the buyer.
  - Response example:
    ```json
    {
      "id": 5,
      "status": "open",
      "items": [
        { "id": 12, "stall": { "id": 3, "product": "Apples", "price_cents": 299, "quantity": 17 }, "quantity": 2 }
      ]
    }
    ```

- POST `/api/cart/items/`
  - Body: `{ "stall_id": 3, "quantity": 2 }`
  - Behavior: Adds item or merges quantity if it already exists. Validates that the stall has stock (`quantity > 0`) and requested does not exceed available.

- PATCH `/api/cart/items/{item_id}/`
  - Body: `{ "quantity": 1 }`
  - Behavior: Updates quantity; validated against current stock.

- DELETE `/api/cart/items/{item_id}/`
  - Removes the item from the cart.

- POST `/api/cart/checkout/`
  - Re-validates all items inside a DB transaction with row locks. If any item is out-of-stock or insufficient, returns `400` with details and no changes made.
  - On success: decrements stall `quantity`, creates an `Order` snapshot and closes the cart. Returns the created order:
    ```json
    {
      "id": 9,
      "total_cents": 897,
      "items": [ { "product_name": "Apples", "price_cents": 299, "quantity": 3 } ]
    }
    ```

Common errors:
- Adding out-of-stock item → `400 { "stall_id": ["This item is out of stock."] }`
- Request over available → `400 { "quantity": ["Requested quantity exceeds available stock."] }`
- Checkout insufficient → `400 { "detail": "Insufficient stock for some items.", "items": [{ "stall_id": 3, "reason": "Insufficient stock", "available": 1 }] }`


## Typical Flows

Buyer
- Register with `role = buyer` → verify email via link.
- Login → store `access`/`refresh`.
- Fetch `/api/me/user/` to confirm identity.
- GET `/api/me/buyer_profile/` → PATCH fields (e.g., `zipcode`, `favorite_stall`).
- Browse stalls: GET `/api/stalls/` or `/api/stalls/{id}/` (no auth required for read).

Seller
- Register with `role = seller` → verify email.
- Login → store `access`/`refresh`.
- Fetch `/api/me/user/` and `/api/me/seller_profile/`.
- Create a stall: POST `/api/stalls/`.
- Link profile to the stall (optional): PATCH `/api/me/seller_profile/` with `{"stall": <stall_id>}`.
- Update inventory: POST `/api/stalls/{id}/set_quantity/` or PATCH `/api/stalls/{id}/`.

## Validation Notes

- Zip codes must be numeric and 0–99999 (`buyer_profile.zipcode`, `seller_profile.zipcode`).
- Duplicate registration emails are rejected.
- Inactive accounts cannot obtain tokens until verified.

## Status Codes (common)

- `200 OK`: Successful GET/verify/update
- `201 Created`: Successful resource creation (e.g., register, create stall)
- `400 Bad Request`: Validation errors (e.g., invalid zipcode, bad payload)
- `401 Unauthorized`: Missing/invalid JWT; inactive user login
- `403 Forbidden`: Role mismatch (e.g., buyer hitting seller-only update)
- `404 Not Found`: Resource not found (or resend for unknown email)

## Quick cURL Examples

- Login:
  ```bash
  curl -X POST http://localhost:8000/api/auth/token/ \
    -H 'Content-Type: application/json' \
    -d '{"username":"user@example.com","password":"StrongPassw0rd!"}'
  ```

- Get current user:
  ```bash
  curl http://localhost:8000/api/me/user/ \
    -H 'Authorization: Bearer <access>'
  ```

- Update buyer profile (zipcode):
  ```bash
  curl -X PATCH http://localhost:8000/api/me/buyer_profile/ \
    -H 'Authorization: Bearer <access>' \
    -H 'Content-Type: application/json' \
    -d '{"zipcode":60606}'
  ```

- Create stall (seller):
  ```bash
  curl -X POST http://localhost:8000/api/stalls/ \
    -H 'Authorization: Bearer <access>' \
    -H 'Content-Type: application/json' \
    -d '{"product":"Apples","location":"Ferry Plaza","quantity":20,"radius_m":1000}'
  ```

- Set stall quantity (seller):
  ```bash
  curl -X POST http://localhost:8000/api/stalls/3/set_quantity/ \
    -H 'Authorization: Bearer <access>' \
    -H 'Content-Type: application/json' \
    -d '{"quantity":15}'
  ```

---
If you want this split into Swagger/OpenAPI or Postman collection, I can generate that too.
