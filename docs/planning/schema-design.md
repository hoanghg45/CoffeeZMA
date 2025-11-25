# Database Schema Design

This document outlines the standard database schema for the CoffeeZMA project, following Grab/ShopeeFood standards and Schema.org guidelines. It maps the original "mock" data structure to a normalized relational schema.

## 1. Users (Customers)

Stores customer information, integrated with Zalo.

| Original Field (Mock/Implied) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| (Zalo ID) | `id` | `VARCHAR(50)` | Primary Key. Unique user ID (Zalo ID). |
| (Name) | `name` | `VARCHAR(100)` | User's display name. |
| (Avatar) | `avatar` | `VARCHAR(255)` | URL to user's avatar. |
| (Phone) | `phone_number` | `VARCHAR(20)` | User's phone number. |
| (Points) | `loyalty_points` | `INT` | Current loyalty points balance. |
| - | `created_at` | `TIMESTAMP` | Record creation timestamp. |
| - | `updated_at` | `TIMESTAMP` | Record update timestamp. |

## 2. Categories

Product categories (e.g., Coffee, Tea, Food).

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `id` | `id` | `VARCHAR(50)` | Primary Key. Unique category identifier (slug or UUID). |
| `name` | `name` | `VARCHAR(100)` | Display name of the category. |
| `icon` | `icon_url` | `VARCHAR(255)` | URL to category icon. |
| - | `display_order` | `INT` | Order of display in the menu. |
| - | `is_active` | `BOOLEAN` | Whether the category is currently active. |

## 3. Products

Menu items.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `id` | `id` | `INT / BIGINT` | Primary Key. Unique product identifier. |
| `name` | `name` | `VARCHAR(255)` | Product name. |
| `price` | `base_price` | `DECIMAL(10,2)` | Base price of the product. |
| `image` | `image_url` | `VARCHAR(255)` | URL to product image. |
| `description` | `description` | `TEXT` | Product description (HTML or Text). |
| `sale.type`, `sale.percent`, `sale.amount` | `is_available` | `BOOLEAN` | Availability status (In Stock/Out of Stock). |
| - | `created_at` | `TIMESTAMP` | Record creation timestamp. |
| - | `updated_at` | `TIMESTAMP` | Record update timestamp. |

*Note: `categoryId` and `variantId` from mock are handled via relationship tables.*
*Note: `sale` info in mock is better handled via a separate `Promotions` table or specific pricing logic, but for simple "sale price", we could add `promotional_price`.*

## 4. Product Categories (Junction)

Many-to-many relationship between Products and Categories.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `categoryId` (in Products) | `product_id` | `INT` | Foreign Key to Products. |
| `categoryId` (in Products) | `category_id` | `VARCHAR(50)` | Foreign Key to Categories. |

## 5. Option Groups (Variants)

Groups of options (e.g., Size, Sugar, Ice, Toppings). Corresponds to `variants.json`.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `id` | `id` | `VARCHAR(50)` | Primary Key. Unique group identifier (e.g., 'size', 'topping'). |
| `label` | `name` | `VARCHAR(100)` | Display name (e.g., 'Kích cỡ', 'Topping'). |
| `type` | `selection_type` | `ENUM('SINGLE', 'MULTIPLE')` | Whether user can select one or multiple options. |
| `default` | `min_select` | `INT` | Minimum number of options required (1 for required, 0 for optional). |
| - | `max_select` | `INT` | Maximum number of options allowed. |

## 6. Options (Variant Options)

Specific choices within a group (e.g., Size M, 50% Sugar). Corresponds to `options` array in `variants.json`.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `options[].id` | `id` | `VARCHAR(50)` | Primary Key. Unique option identifier. |
| `options[].label` | `name` | `VARCHAR(100)` | Display name (e.g., 'Vừa', 'Trân châu'). |
| `options[].priceChange` | `price_adjustment` | `DECIMAL(10,2)` | Price change (can be positive or negative). |
| - | `group_id` | `VARCHAR(50)` | Foreign Key to Option Groups. |
| - | `is_default` | `BOOLEAN` | Whether this is the pre-selected option. |

## 7. Product Option Groups (Junction)

Links products to option groups.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| `variantId` (in Products) | `product_id` | `INT` | Foreign Key to Products. |
| `variantId` (in Products) | `group_id` | `VARCHAR(50)` | Foreign Key to Option Groups. |
| - | `display_order` | `INT` | Order of the option group for this product. |

## 8. Orders

Customer orders.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| - | `id` | `VARCHAR(50)` | Primary Key. Unique order ID (e.g., UUID). |
| - | `user_id` | `VARCHAR(50)` | Foreign Key to Users. |
| - | `total_amount` | `DECIMAL(10,2)` | Final total amount after discounts and shipping. |
| - | `shipping_fee` | `DECIMAL(10,2)` | Shipping cost. |
| - | `discount_amount` | `DECIMAL(10,2)` | Total discount applied. |
| - | `status` | `ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED')` | Order status. |
| - | `payment_method` | `VARCHAR(50)` | Payment method (COD, ZaloPay, etc.). |
| - | `note` | `TEXT` | Customer note. |
| - | `created_at` | `TIMESTAMP` | Order placement time. |

## 9. Order Items

Items within an order.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| - | `id` | `INT / BIGINT` | Primary Key. |
| - | `order_id` | `VARCHAR(50)` | Foreign Key to Orders. |
| - | `product_id` | `INT` | Foreign Key to Products. |
| - | `product_name` | `VARCHAR(255)` | Snapshot of product name at time of order. |
| - | `base_price` | `DECIMAL(10,2)` | Snapshot of base price at time of order. |
| - | `quantity` | `INT` | Quantity ordered. |
| - | `total_price` | `DECIMAL(10,2)` | Total price for this line item (including options). |

## 10. Order Item Options

Selected options for an order item.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| - | `id` | `INT / BIGINT` | Primary Key. |
| - | `order_item_id` | `INT / BIGINT` | Foreign Key to Order Items. |
| - | `option_id` | `VARCHAR(50)` | Foreign Key to Options. |
| - | `option_name` | `VARCHAR(100)` | Snapshot of option name. |
| - | `price_adjustment` | `DECIMAL(10,2)` | Snapshot of price adjustment. |

## 11. Promotions (Vouchers)

Discount codes and promotions.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| - | `id` | `VARCHAR(50)` | Primary Key. Voucher code. |
| - | `description` | `TEXT` | Description of the promotion. |
| - | `discount_type` | `ENUM('PERCENT', 'FIXED')` | Type of discount. |
| - | `discount_value` | `DECIMAL(10,2)` | Value of discount (percentage or fixed amount). |
| - | `min_order_value` | `DECIMAL(10,2)` | Minimum order value required. |
| - | `max_discount_value` | `DECIMAL(10,2)` | Maximum discount amount (for percentage). |
| - | `start_date` | `TIMESTAMP` | Start time of promotion. |
| - | `end_date` | `TIMESTAMP` | End time of promotion. |
| - | `usage_limit` | `INT` | Total usage limit. |
| - | `usage_count` | `INT` | Current usage count. |

## 12. Store Config

Global settings.

| Original Field (Mock) | Standard Schema Field | Data Type | Description |
|---|---|---|---|
| - | `key` | `VARCHAR(50)` | Primary Key. Config key (e.g., 'shipping_fee_per_km'). |
| - | `value` | `TEXT` | Config value. |
