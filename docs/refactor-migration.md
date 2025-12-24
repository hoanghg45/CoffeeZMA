# Database Migration & Architecture Documentation

## Problem
The previous architecture conflated "Internal Staff Users" and "Zalo App Customers" into a single `users` table. This caused all Zalo customers to be potentially created as 'STAFF' in the system.

## Solution
We have separated the concerns:
1.  **Customers (End Users)**: Now exclusively managed in the `customers` table.
2.  **Users (Internal/Staff)**: Managed in the `users` table (kept for back-office/management usage).

## Code Changes
- `src/services/customer.ts`: Now handles all customer-related data including **Address Management**.
- `src/services/user.ts`: Stripped down to only handle internal user logic.
- `src/state.ts`: Disconnected `ensureUserExists` (which wrote to `users` table). Now relies on `customerProfileState` to create/update `customers`.

## Database Status: ✅ MIGRATED

The `user_addresses` table Foreign Key has been updated to point to `customers` instead of `users`.

**Current Constraint:**
```
user_addresses_customer_id_fkey: FOREIGN KEY (user_id) REFERENCES customers(id)
```

### Data Flow Summary

1. **Zalo User Login** → `customerProfileState` creates/updates record in `customers` table
2. **Address Management** → Uses `user_addresses` table with FK to `customers.id`
3. **Internal Staff** → Separate `users` table (not used by Zalo Mini App)

### Type Mapping

| Domain Object | DB Table | Key Field |
|---------------|----------|-----------|
| `CustomerProfile` | `customers` | `id` (= zaloId) |
| `CustomerAddress` | `user_addresses` | `user_id` → `customers.id` |

### Mapbox Geocoding Integration

- **Reverse Geocoding**: When user clicks "Get Current Location", the lat/long from Zalo is converted to a readable address via Mapbox API.
- **Forward Geocoding**: When user manually types an address (lat/long = 0), the address is geocoded to coordinates before saving.

Environment variable: `VITE_MAPBOXMAP_TOKEN`
