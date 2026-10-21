# Backend Implementation Plan - Alignment with homeFood & homeFoodWebsite

This plan focuses on making the backend consistent with both frontends, with special attention to the homeFoodWebsite admin dashboard and strict visibility rules.

## Goals
- Only logged-in users can see "My Shop" (and only the owner sees their own shop)
- Buyers can only see their own orders; sellers can see orders for foods they own; admin can see all
- Website admin dashboard uses real backend auth/role (no hardcoded creds)
- Enforce ownership/role at API level (not just UI)
- Keep changes minimal and modular

---

## Milestone 1: Auth & Role Guards (Priority: P0)
**Goal:** Lock down routes with proper role checks and fix order detail visibility.

### Tasks
- [ ] Add/ensure `requireRole` usage (middleware exists at `src/middlewares/requireRole.ts`)
- [ ] Guard seller/shop/food-seller/order-seller routes
- [ ] Fix `GET /api/orders/:orderId` to allow buyer owner, seller of items in order, or admin
- [ ] Verify `GET /api/auth/me` returns full user with role

### Files to change
| File | Change |
|---|---|
| `src/modules/shops`/foodMakers routes | Add `requireRole` where appropriate (`GET /me`, `POST /me`) |
| `src/modules/foods/food.routes.ts` | `GET /seller/mine` -> `authenticate, requireRole(['seller','admin'])` |
| `src/modules/orders/order.routes.ts` | `GET /seller-orders` -> `authenticate, requireRole(['seller','admin'])`; `PATCH /:orderId/status` -> `authenticate, requireRole(['seller','admin'])` |
| `src/modules/orders/order.controller.ts` | Update `getOrderById` to check ownership (buyer) OR `sellerOwnsOrder` OR `req.user.role === 'admin'` |

**Acceptance:** Unauthenticated -> 401; wrong role -> 403; seller can view orders containing their food; buyer sees only own; admin can view any order.

---

## Milestone 2: Shops - "My Shop" Ownership (Priority: P0)
**Goal:** Ensure website can correctly show/hide "My Shop" based on login + ownership.

### Tasks
- [ ] Confirm contract: `GET /api/shops/me` requires auth; returns 404 if no shop (website uses this)
- [ ] Keep promotion to seller on upsert (`POST /api/shops/me`) 
- [ ] Consider adding `requireRole(['seller','buyer'])` if desired, but not strictly necessary
- [ ] Ensure no public endpoint exposes another user's shop except `GET /api/shops/:shopId` (public)

### Files
| File | Change |
|---|---|
| `src/modules/foodMakers/foodMaker.routes.ts` | (optional) add role guard; keep auth required |
| `src/modules/foodMakers/foodMaker.controller.ts` | Ensure error messages consistent with website expectations |

**Acceptance:** Guest cannot access `/shops/me`; logged-in with no shop gets 404; owner gets their shop; public shop view only via `/:shopId`.

---

## Milestone 3: Orders - Strict Visibility (Priority: P0)
**Goal:** Enforce "only login user can see their order or their shop who own".

### Tasks
- [x] `GET /api/orders/my-orders` - buyer only (auth). Service filters by `userId` (ok)
- [x] `GET /api/orders/seller-orders` - seller/admin only; sellers are filtered by food ownership and admins can view all
- [x] `POST /api/orders` - auth required. `userId` always comes from the token
- [x] `PATCH /:orderId/status` - auth + role + ownership + allowed transitions

### Files
| File | Change |
|---|---|
| `src/modules/orders/order.routes.ts` | Add role guards as per M1 |
| `src/modules/orders/order.service.ts` | Keep seller ownership and allowed-transition enforcement |
| `src/modules/orders/order.controller.ts` | Enforce buyer, seller, and admin visibility for order detail and lists |

**Acceptance:** Buyer cannot see other buyer's order; seller cannot see order with no their food (unless admin); status updates blocked for non-owners.

---

## Milestone 4: Admin APIs for Website Dashboard (Priority: P1)
**Goal:** Replace hardcoded admin login/UI with real backend.

### Tasks
- [x] Create `src/modules/admin/` module (controller, service, repository, routes, validation)
- [x] Protect all admin routes with `authenticate` + `requireRole(['admin'])`
- [x] Add stats endpoint
- [x] Add user/shop/food/order management endpoints
- [x] Wire routes in `app.ts`

### New files
| File | Purpose |
|---|---|
| `src/modules/admin/admin.routes.ts` | Route definitions under `/api/admin` |
| `src/modules/admin/admin.controller.ts` | Request handlers |
| `src/modules/admin/admin.service.ts` | Business logic |
| `src/modules/admin/admin.repository.ts` | DB queries |
| `src/modules/admin/admin.validation.ts` | Zod schemas (optional) |

### Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard counts (users, shops, foods, orders, orders today) |
| GET | `/api/admin/users` | List all users (filter by role) |
| PATCH | `/api/admin/users/:id` | Change a user's role |
| GET | `/api/admin/shops` | List all shops (foodMakers) |
| PATCH | `/api/admin/shops/:id/verify` | Approve/reject shop (set `verified`) |
| GET | `/api/admin/foods` | List all foods |
| DELETE/PATCH | `/api/admin/foods/:id` | Remove/edit food listing |
| GET | `/api/admin/orders` | List all orders (filter/status) |
| PATCH | `/api/admin/orders/:id/status` | Admin override status |

User responses omit password and NID fields; shop responses omit NID. Admin order status overrides validate the status enum and emit the normal status-update event.

### Files to change
| File | Change |
|---|---|
| `src/app.ts` | Import and mount `adminRoutes` at `/api/admin` |

**Acceptance:** Only admin can access; dashboard can show real counts; can manage users/shops/foods/orders.

---

## Milestone 5: Website Sync (Priority: P1)
**Goal:** Align homeFoodWebsite with backend per requirements.

### Tasks
- [x] **Admin login**: Use `POST /api/auth/login`, verify the returned role is `admin`, and persist the backend session.
- [x] **Admin dashboard**: Use `/api/admin/stats` and wire users, shops, foods, and orders to admin endpoints.
- [x] **My Shop gating**: Show the link only to authenticated users, redirect guests, call `GET /api/shops/me`, and show onboarding on `404`.
- [x] **Orders visibility**: Buyer history uses `GET /api/orders/my-orders`; seller orders use `GET /api/orders/seller-orders`; navigation and seller routes are role-gated.
- [x] **Auth state**: Add a shared website auth provider for login, registration, role, token, refresh, and logout.
- [x] **Gradual sync**: My Shop profile/menu/stats and buyer/seller order views use APIs. Marketplace browse data remains unchanged.

### Files to change (website)
| File | Change |
|---|---|
| `src/app/admin/page.tsx` | Real backend login + role check |
| `src/app/admin/dashboard/page.tsx` | Fetch stats from `/api/admin/stats`, wire tabs |
| `src/app/(common)/myshop/page.tsx` | Gate by auth, fetch from `/api/shops/me` |
| `src/components/common/Nav.tsx` | Hide/show "My Shop" based on auth/role |
| *(new)* `src/lib/api.ts` or `src/lib/auth.ts` | API client with auth headers (website currently has empty stubs) |

**Acceptance:** Only logged-in users see "My Shop"; guest redirected; admin uses real login; buyer/seller see only their own orders/shop.

---

## Quick Implementation Order
1. M1 (guards + order detail fix) - blocks violations immediately
2. M2 (shop ownership contract) - ensures myshop gating works
3. M3 (orders strictness) - completes visibility rules
4. M4 (admin APIs) - enables real admin dashboard
5. M5 (website sync) - wires UI to backend

---

## Notes & Gotchas
- Backend already has events/bootstrap; don't change those
- Food ownership check in `orderRepository.sellerOwnsOrder` is used - keep consistent
- Website uses sessionStorage for admin now; switch to proper token storage
- If `FoodMaker` model lacks `isVerified`, add field in M4 with default false (migration not required if using Mongoose flexible docs, but better to add)
- Mobile app alignment is mostly fine with existing endpoints; focus is website + strict API rules
- All changes should follow existing module pattern (controller/service/repo/routes)
