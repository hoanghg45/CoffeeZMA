# CoffeeZMA UI Guidelines

This document outlines the design principles and component styles for the CoffeeZMA application, based on the "Gopuff-inspired" premium aesthetic.

## 1. Core Philosophy
- **Premium & Clean**: Focus on white space, subtle shadows, and rounded corners.
- **Card-Based**: Content is grouped into distinct, rounded cards with soft borders.
- **Compact & Efficient**: Information is presented densely but clearly (e.g., single-line cart items).
- **Interactive**: Elements have subtle active states (scale, opacity) to provide feedback.

## 2. Color Palette

### Primary Colors
- **Primary Yellow**: `#FFC900` (Brand identity, main actions)
- **Primary Container**: `#FFF3C0` (Light backgrounds for icons/highlights)

### Neutral Colors
- **Background**: `#F4F5F6` (Light Gray - used for page backgrounds to let cards pop)
- **Surface**: `#FFFFFF` (White - used for cards and sheets)
- **Text Primary**: `#1F2937` (Gray 800 - Headings, strong text)
- **Text Secondary**: `#4B5563` (Gray 600 - Subtitles, prices)
- **Text Tertiary**: `#9CA3AF` (Gray 400 - Placeholders, minor details)
- **Divider**: `#E5E7EB` (Gray 200 - Subtle separators)

### Functional Colors
- **Error/Delete**: `#EF4444` (Red 500)
- **Success**: `#10B981` (Green 500)

## 3. Typography
- **Font Family**: System default (-apple-system, Roboto, etc.)
- **Headings**: Bold (`font-bold`), typically `text-lg` or `text-xl`.
- **Body**: Normal or Medium weight, `text-sm` or `text-base`.
- **Captions**: `text-xs` or `text-[10px]`, often used for options or secondary info.

## 4. Layout & Spacing

### Page Structure
- **Background**: Pages should use `bg-gray-100` (or similar light gray) to contrast with white cards.
- **Padding**: Standard page padding is `p-4`.
- **Safe Areas**: Always respect `safe-area-bottom` for sticky footers.

### Cards
- **Container**: `bg-white rounded-xl` or `rounded-2xl`.
- **Shadow**: `shadow-sm` or `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`.
- **Border**: `border border-gray-100` or `border-divider` for subtle definition.

## 5. Components

### Cart Item (Compact Row)
A single-line representation of a product in the cart.
- **Container**: `flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm`
- **Image**: `w-16 h-16 rounded-lg object-cover`
- **Content**: Flex column with tight spacing (`space-y-0.5`).
- **Quantity Picker**:
  - Container: `h-8 bg-white rounded-full border border-gray-200 shadow-sm`
  - Icons: Small (`size={14}`), minimal style.

### Delivery / Info Cards
Grouped information sections.
- **Container**: `bg-white rounded-2xl p-4 shadow-sm`
- **Icons**: Wrapped in colored circles (e.g., `w-8 h-8 rounded-full bg-primary-container`).
- **Separators**: Use `h-[1px] bg-divider` for internal divisions instead of full `Divider` components.

### Bottom Sheets
- **Shape**: `rounded-t-3xl` (large top radius).
- **Header**: Clean, often with a close button absolutely positioned.
- **Backdrop**: `backdrop-blur-sm` for a modern feel.

### Buttons
- **Primary Action**: `rounded-full`, `h-12` or `h-14`, `font-bold`, `shadow-md`.
- **Secondary/Ghost**: Minimal styling, often just icons or text.

## 6. CSS Variables (Reference)
```css
:root {
  --coffee-primary: #FFC900;
  --coffee-background: #FFFFFF; /* App background */
  --coffee-surface: #FFFFFF;    /* Card background */
  --coffee-outline: #B38F00;
}
```

## 7. Implementation Examples

### Standard Card Class
```tsx
className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
```

### Primary Button Class
```tsx
className="rounded-full h-12 text-base font-bold shadow-md"
```

### Compact Row Item
```tsx
className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
```
