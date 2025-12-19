---
name: LoyaltyEnrollmentFoundation
overview: Add a loyalty membership flag backed by Neon, gate checkout with an opt-in modal, and lay groundwork for future point accrual/redemption flows.
todos:
  - id: db-migration
    content: Alter customers table + add loyalty_transactions via Neon
    status: pending
  - id: service-layer
    content: Add customer service + recoil selectors/states
    status: pending
  - id: ui-modal
    content: Implement loyalty opt-in sheet & wiring in CartPreview
    status: pending
  - id: logic-tests
    content: Hook checkout gating + add loyalty util tests
    status: pending
---

# Loyalty Enrollment Foundation

## Database & Persistence

- Use Neon (`lucky-hat-17211287`) to alter `customers`:
- Add `is_loyalty_member BOOLEAN NOT NULL DEFAULT FALSE`, `loyalty_joined_at TIMESTAMPTZ`, and `loyalty_opt_in_channel TEXT` for analytics.
- Create `UNIQUE INDEX customers_zalo_id_unique` on `zalo_id` to map Mini App users deterministically.
- Create `loyalty_transactions` table (`id`, `customer_id`, `order_id`, `type`, `points`, `amount_snapshot`, `note`, timestamps) so each earn/spend has an auditable ledger.
- Mirror the new columns/types in a dedicated service layer (`src/services/customer.ts`) that wraps inserts/updates/queries and exports a `CustomerProfile` interface consumed by the app.

## Domain & Recoil State

- Extend [`src/state.ts`](src/state.ts) with:
- `customerProfileState` selector: depends on `userState` & `phoneState`, calls `getOrCreateCustomerProfile` to upsert customer rows (defaults to `segment='NEW'`, zero points) and exposes membership flags + balance.
- `loyaltyPromptState` atom (per user, hydrated from `localStorage`) to remember if the modal was dismissed so we don’t spam returning members who said "Để sau".
- Helper selectors for available points & whether redemption is allowed; use new `src/utils/loyalty.ts` to centralize calculations (earn percent, redeem conversion, min threshold).
- Keep the logic minimal per instruction: no extra abstraction beyond the selectors + util functions needed for calculations.

## UI / UX

- Build `src/components/loyalty/loyalty-optin-sheet.tsx` using the existing `Sheet` pattern:
- Present brand-aligned illustration, benefit bullets, and two actions (Primary “Tham gia ngay” + ghost “Để sau”).
- On confirm, trigger the service mutation then resolve a promise so callers can chain payment; on skip, persist dismiss flag and just close.
- Style according to `UI_GUIDELINES.md` (rounded-2xl cards, primary yellow CTA, subtle shadow).
- Mount the sheet inside [`src/pages/cart/preview.tsx`](src/pages/cart/preview.tsx), controlled by new Recoil atom so other screens could trigger it later if needed.

## Checkout Flow & Loyalty Logic

- Refactor `CartPreview`’s `Đặt hàng` handler into a `useCheckoutAction` hook (inline or same file) that performs:

1. Ensure phone permission (bump `requestPhoneTriesState`, show `showToast` if still missing).
2. Resolve `customerProfileState`; if `!is_loyalty_member` and not previously dismissed, open the loyalty sheet and wait for user choice.
3. After acceptance (and DB update) or if already member/declined, proceed with `pay(totalPrice)` as before.

- When a user opts in, call `markCustomerAsLoyaltyMember` (updates flag, timestamp, channel="checkout"), emit a `loyalty_transactions` row of type `"ENROLL"`, and refresh the selector cache.
- Add placeholder earn/redeem scaffolding:
- Update `priceBreakdownState` (or a sibling) to expose potential point earnings using `calculateEarnedPoints(total)` so UI can show “Dự kiến nhận X điểm”.
- Store config knobs under `app-config.json -> loyalty` (earnPercent, redeemRate, minRedeemPoints) and access via `getConfig`.

## Config & Testing

- Add `src/utils/loyalty.ts` with pure helpers: `calculateEarnedPoints(amount, percent)`, `calculateRedeemValue(points, rate)`, `canRedeem(points, minPoints)`.
- Introduce Vitest + Testing Library in `package.json` (add `test` script) and create `src/utils/__tests__/loyalty.test.ts` covering edge cases (rounding, zero/negative input) plus a lightweight test for the opt-in hook (mock services, assert modal gating logic).
- Document new env expectations (Neon URL already used) and loyalty config keys in `README.md` if needed for future contributors.

## Flow Snapshot

```mermaid
flowchart TD
  cartCTA[Đặt hàng Button] --> checkPhone{Has phone?}
  checkPhone -- No --> requestPerm[Trigger Zalo phone permission]
  requestPerm --> halt[Show toast & exit]
  checkPhone -- Yes --> loadProfile[Load customerProfileState]
  loadProfile --> memberCheck{is_loyalty_member?}
  memberCheck -- No --> showModal[Loyalty Sheet]
  showModal -->|Accept| markMember[markCustomerAsLoyaltyMember]
  showModal -->|Skip| recordDismiss[Update prompt flag]
  markMember --> proceedPay[call pay(total)]
  recordDismiss --> proceedPay
  memberCheck -- Yes --> proceedPay


```