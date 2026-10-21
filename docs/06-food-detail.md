# M06 — Food Detail

**Goal:** Meal detail matching website `/foodDetails/[id]`.

## Website ref

`homeFoodWebsite/src/app/(buyer)/foodDetails/[id]/page.tsx`

## UI

`app/(stack)/food/[id].tsx`:

- Hero image 4:3 with sold-out overlay + favorite heart button
- Category pill + availability badge (available / low / sold-out tints)
- Dish title (`font-display`), seller row (avatar, name + `VerifiedBadge`, "Home chef · area")
- Big rating number + `Stars` + review count
- Dietary tag pills
- Description, delivery info grid (ready-in, area, delivery fee, NID-verified)
- Buy box card: price, −/+ quantity stepper, full-width "Add to cart" / "Sold out" `PillButton`
- Ratings & reviews section: aggregate + review cards (initials avatar, stars, text)
- "More {category} you may like" horizontal similar-dishes list
- Not-found `EmptyState`

## API

- `GET /api/foods/:id` (detail incl. seller info + reviews) — extend food service/repository to populate reviews, or add `GET /api/reviews?foodId=` (create reviews module now if needed; full reviews module is M12)
- Similar: `GET /api/foods?category=X&limit=4`

## Done when

- [x] Detail loads by id from API; skeleton while loading
- [x] Add to cart adds qty to cart store (checkout is M07)
- [x] Reviews render; similar dishes navigate to their detail
- [x] `npm run lint` passes
