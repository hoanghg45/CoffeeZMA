# CoffeeZMA UI Design Guidelines

**Version:** 1.0  
**Last Updated:** November 27, 2025  
**Purpose:** Reference guide for consistent UI/UX design across the CoffeeZMA application

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Component Patterns](#component-patterns)
6. [Layout Patterns](#layout-patterns)
7. [Interaction Patterns](#interaction-patterns)
8. [Animation & Transitions](#animation--transitions)
9. [Shadows & Elevation](#shadows--elevation)
10. [Border Radius](#border-radius)
11. [Code Examples](#code-examples)

---

## Design Philosophy

### Apple Human Interface Guidelines

All UI components follow Apple's three core principles:

1. **Clarity**
   - Text is legible at every size
   - Icons are precise and lucid
   - Adornments are subtle and appropriate
   - Functionality is paramount

2. **Deference**
   - Fluid motion and crisp interface help people understand
   - Content fills the entire screen
   - Translucency and blurring hint at more content
   - Minimal use of bezels, gradients, and drop shadows

3. **Depth**
   - Visual layers and realistic motion convey hierarchy
   - Touch and discoverability heighten delight
   - Transitions provide context and maintain orientation

### Key Principles

- **Simple**: Remove unnecessary elements
- **Smooth**: All interactions feel natural
- **Clear**: Purpose is immediately obvious
- **Consistent**: Patterns repeat throughout the app

---

## Color System

### Primary Palette (Coffee Theme)

```scss
// Primary - Dark Coffee
--coffee-primary: #4E342E;
--coffee-on-primary: #FFFFFF;
--coffee-primary-container: #FFDBCF;
--coffee-on-primary-container: #3E2723;

// Secondary - Latte/Foam
--coffee-secondary: #75564D;
--coffee-on-secondary: #FFFFFF;
--coffee-secondary-container: #EFEBE9;
--coffee-on-secondary-container: #3E2723;

// Tertiary - Accent
--coffee-tertiary: #6C5D2F;
--coffee-on-tertiary: #FFFFFF;
--coffee-tertiary-container: #F6E2A7;
--coffee-on-tertiary-container: #231B00;

// Background & Surface - Cream
--coffee-background: #FFFFFF;
--coffee-on-background: #1C1B1F;
--coffee-surface: #FFFFFF;
--coffee-on-surface: #1C1B1F;
--coffee-surface-variant: #F4DED4;
--coffee-on-surface-variant: #52433F;

// Outline
--coffee-outline: #85736E;
--coffee-outline-variant: #D7C2B9;
```

### Semantic Colors

```scss
// Success / Positive
--color-success: #10B981;      // Green for discounts, free delivery
--color-success-light: #D1FAE5;

// Error / Destructive
--color-error: #EF4444;        // Red for errors, warnings
--color-error-light: #FEE2E2;

// Call-to-Action
--color-cta: #D32F2F;          // Bright red for primary actions
--color-cta-hover: #B71C1C;

// Neutral Grays
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-900: #111827;
```

### Usage Rules

| Element | Color | Variable |
|---------|-------|----------|
| Primary text | Dark brown | `text-primary` or `var(--coffee-on-surface)` |
| Secondary text | Gray 600 | `text-gray-600` |
| Disabled text | Gray 400 | `text-gray-400` |
| Background | Cream | `bg-surface` or `var(--coffee-surface)` |
| Borders | Gray 100 | `border-gray-100` |
| Dividers | Gray 100 | `divide-gray-100` |
| Success states | Green | `text-green-600` |
| CTA buttons | Red | `#D32F2F` |

---

## Typography

### Font Family

```scss
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             Helvetica, Arial, sans-serif, "Apple Color Emoji", 
             "Segoe UI Emoji", "Segoe UI Symbol";
-webkit-font-smoothing: antialiased;
```

### Text Sizes (ZMP UI)

| Size | Usage | Class | Line Height |
|------|-------|-------|-------------|
| `xxxxSmall` | Badge text, tiny labels | `size="xxxxSmall"` | 16px |
| `xxxSmall` | Captions, metadata | `size="xxxSmall"` | 18px |
| `xxSmall` | Helper text | `size="xxSmall"` | 20px |
| `xSmall` | Secondary text | `size="xSmall"` | 20px |
| `small` | Body text (small) | `size="small"` | 22px |
| `normal` | Body text (default) | `size="normal"` | 24px |
| `large` | Emphasized text | `size="large"` | 28px |
| `xLarge` | Headings | `size="xLarge"` | 32px |

### Font Weights

```tsx
// Regular (400) - Default body text
<Text size="normal">Regular text</Text>

// Medium (500) - Slightly emphasized
<Text size="normal" className="font-medium">Medium text</Text>

// Semibold (600) - Section headers
<Text size="normal" className="font-semibold">Semibold text</Text>

// Bold (700) - Titles, prices
<Text size="large" className="font-bold">Bold text</Text>
<Text.Title size="large" className="font-bold">Title</Text.Title>
```

### Typography Hierarchy

```tsx
// Page Title
<Text.Title size="large" className="font-bold text-center">
  Cart
</Text.Title>

// Section Header
<Text size="normal" className="font-bold text-gray-900">
  Total
</Text>

// Product Name
<Text size="normal" className="font-semibold text-primary">
  Lentil Soup
</Text>

// Body Text
<Text size="small" className="text-gray-600">
  Delivery Fee
</Text>

// Caption / Metadata
<Text size="xSmall" className="text-gray-500">
  Serve hot
</Text>

// Tiny Labels
<Text size="xxxSmall" className="text-gray-400">
  Edit Special Request
</Text>
```

---

## Spacing System

### Scale (Tailwind-based)

| Value | Pixels | Usage |
|-------|--------|-------|
| `0.5` | 2px | Hairline spacing |
| `1` | 4px | Tight spacing |
| `2` | 8px | Small spacing |
| `3` | 12px | Medium spacing |
| `4` | 16px | Default spacing |
| `5` | 20px | Large spacing |
| `6` | 24px | Extra large spacing |
| `8` | 32px | Section spacing |
| `12` | 48px | Major section spacing |
| `16` | 64px | Page-level spacing |
| `20` | 80px | Extra large gaps |

### Padding Patterns

```tsx
// Container padding (standard)
<Box className="px-4 py-3">  // 16px horizontal, 12px vertical

// Card padding
<Box className="p-4">  // 16px all sides

// Section spacing
<Box className="mt-4">  // 16px top margin
<Box className="mt-6">  // 24px top margin

// Tight spacing (related items)
<Box className="space-y-1">  // 4px vertical gap
<Box className="space-y-3">  // 12px vertical gap

// Generous spacing (sections)
<Box className="space-y-5">  // 20px vertical gap
<Box className="space-y-6">  // 24px vertical gap
```

### Gap Patterns

```tsx
// Icon + Text
<Box className="flex items-center gap-1">  // 4px gap
<Box className="flex items-center gap-2">  // 8px gap
<Box className="flex items-center gap-3">  // 12px gap

// Buttons in a row
<Box className="flex gap-4">  // 16px gap
```

---

## Component Patterns

### Bottom Sheet Modal

**Standard Configuration:**

```tsx
<Sheet
  visible={visible}
  onClose={handleClose}
  autoHeight={false}
  style={{ height: "85vh", maxHeight: "85vh" }}
  mask
  handler
  swipeToClose
>
  <Box className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden">
    {/* Content */}
  </Box>
</Sheet>
```

**Key Properties:**
- Height: `85vh` (leaves 15% for context)
- Border radius: `rounded-t-3xl` (24px top corners)
- Background: `bg-white` or `bg-surface`
- Always include: `mask`, `handler`, `swipeToClose`

### Close Button

**Absolute positioned (over content):**

```tsx
<div
  className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm cursor-pointer"
  onClick={handleClose}
>
  <Icon icon="zi-close" className="text-gray-600" size={24} />
</div>
```

**Header positioned:**

```tsx
<button
  onClick={handleClose}
  className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
>
  <Icon icon="zi-close" size={20} className="text-gray-700" />
</button>
```

### Header with Title

```tsx
<Box className="flex-none px-4 pt-4 pb-3 border-b border-gray-100 relative">
  <Text.Title size="large" className="text-center font-bold">
    Cart
  </Text.Title>
  {/* Close button here */}
</Box>
```

### Scrollable Content Area

```tsx
<Box className="flex-1 overflow-y-auto">
  <Box className="px-4">
    {/* Scrollable content */}
  </Box>
</Box>
```

### Fixed Footer (Sticky CTA)

```tsx
<Box className="flex-none p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
  <Button
    type="highlight"
    fullWidth
    onClick={handleAction}
    className="rounded-full h-14 text-base font-bold shadow-lg"
    style={{
      backgroundColor: "#D32F2F",
      color: "white",
    }}
  >
    <Box className="flex items-center justify-center gap-2">
      <Text className="text-white font-bold">Go to Checkout</Text>
      <Icon icon="zi-arrow-right" size={20} className="text-white" />
    </Box>
  </Button>
</Box>
```

### Card Component

```tsx
<Box className="p-4 bg-white rounded-xl border border-gray-100">
  {/* Card content */}
</Box>
```

**Variants:**

```tsx
// With background
<Box className="p-4 bg-gray-50 rounded-xl">

// Interactive card
<Box className="p-4 bg-gray-50 rounded-xl cursor-pointer active:bg-gray-100 transition-colors">

// Elevated card
<Box className="p-3 bg-surface rounded-lg border border-divider shadow-sm">
```

### Icon Container

```tsx
// Small icon container (40x40)
<Box className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
  <Icon icon="zi-star" size={20} className="text-primary" />
</Box>

// Large icon container (96x96)
<Box className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
  <Icon icon="zi-delete" size={40} className="text-gray-400" />
</Box>
```

### Quantity Picker

```tsx
<Box className="flex items-center gap-3">
  <button
    onClick={handleDecrement}
    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
  >
    <div className="w-3 h-0.5 bg-gray-600" />
  </button>
  
  <Text size="normal" className="font-semibold min-w-[20px] text-center">
    {quantity}
  </Text>
  
  <button
    onClick={handleIncrement}
    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
  >
    <Icon icon="zi-plus" size={16} className="text-gray-600" />
  </button>
</Box>
```

### Pill Button (Action)

```tsx
<Box
  className="flex items-center gap-2 bg-black rounded-full px-4 py-2 cursor-pointer active:opacity-80 transition-opacity"
  onClick={handleClick}
>
  <Text size="small" className="text-white font-semibold">
    2 sets
  </Text>
  <Icon icon="zi-edit" size={16} className="text-white" />
</Box>
```

### Divider

```tsx
// Horizontal divider
<Box className="border-t border-gray-200" />

// With spacing
<Box className="pt-3 border-t border-gray-200">

// Auto-dividers between items
<Box className="divide-y divide-gray-100">
  {items.map(item => <Item key={item.id} />)}
</Box>
```

### Empty State

```tsx
<Box className="flex flex-col items-center justify-center h-full px-4 pb-20">
  <Box className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <Icon icon="zi-delete" size={40} className="text-gray-400" />
  </Box>
  <Text size="normal" className="font-semibold text-gray-900 mb-2">
    Your cart is empty
  </Text>
  <Text size="small" className="text-gray-500 text-center">
    Add items to get started
  </Text>
</Box>
```

---

## Layout Patterns

### Full-Height Sheet Layout

```tsx
<Box className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden">
  {/* Header - Fixed */}
  <Box className="flex-none px-4 pt-4 pb-3 border-b border-gray-100">
    {/* Header content */}
  </Box>

  {/* Content - Scrollable */}
  <Box className="flex-1 overflow-y-auto">
    <Box className="px-4">
      {/* Scrollable content */}
    </Box>
  </Box>

  {/* Footer - Fixed */}
  <Box className="flex-none p-4 bg-white border-t border-gray-100">
    {/* Footer content */}
  </Box>
</Box>
```

### Two-Column Layout

```tsx
<Box className="flex justify-between items-center">
  <Text size="small" className="text-gray-600">
    Label
  </Text>
  <Text size="small" className="text-green-600 font-medium">
    Value
  </Text>
</Box>
```

### Image + Content Layout

```tsx
<Box className="flex gap-3">
  {/* Image - Fixed */}
  <Box className="flex-none">
    <img
      src={image}
      alt={name}
      className="w-20 h-20 rounded-xl object-cover"
    />
  </Box>

  {/* Content - Flexible */}
  <Box className="flex-1 flex flex-col justify-between">
    {/* Content */}
  </Box>
</Box>
```

---

## Interaction Patterns

### Touch Targets

**Minimum size:** 44x44px (Apple guideline)

```tsx
// Button
<button className="w-8 h-8">  // 32x32 - Too small
<button className="w-11 h-11">  // 44x44 - Minimum
<button className="h-14">  // 56px height - Comfortable

// Icon button
<Icon size={20} />  // Inside 44x44 container
<Icon size={24} />  // Inside 48x48 container
```

### Active States

```tsx
// Background change
className="active:bg-gray-200 transition-colors"

// Opacity change
className="active:opacity-80 transition-opacity"

// Scale (subtle)
className="active:scale-95 transition-transform"
```

### Hover States (Desktop)

```tsx
className="hover:bg-gray-100 transition-colors"
```

### Disabled States

```tsx
<Button disabled={!quantity}>
  // Automatically styled by ZMP UI
</Button>

// Custom disabled
<button
  disabled={isDisabled}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
```

### Click Handlers

```tsx
// Simple action
onClick={handleClick}

// With parameter
onClick={() => handleClick(item)}

// Prevent default
onClick={(e) => {
  e.preventDefault();
  handleClick();
}}
```

---

## Animation & Transitions

### Timing Function

**Standard easing:** `cubic-bezier(0.4, 0, 0.2, 1)`

```scss
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Transition Classes

```scss
// Color transitions
.transition-colors {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

// Opacity transitions
.transition-opacity {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

// Transform transitions
.transition-transform {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Duration Guidelines

| Duration | Usage |
|----------|-------|
| 100ms | Instant feedback (hover) |
| 200ms | Standard transitions (color, opacity) |
| 300ms | Sheet open/close |
| 400ms | Page transitions |

### Sheet Animations

```tsx
// Slide up from bottom (automatic with Sheet component)
<Sheet
  visible={visible}
  swipeToClose  // Enables drag-down gesture
>
```

---

## Shadows & Elevation

### Shadow Scale

```scss
// Subtle shadow (cards)
shadow-sm
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

// Medium shadow (elevated cards)
shadow-md
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

// Large shadow (buttons, modals)
shadow-lg
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

// Custom shadows
shadow-[0_-4px_20px_rgba(0,0,0,0.08)]  // Footer shadow
shadow-[0_-4px_20px_rgba(78,52,46,0.04)]  // Coffee-tinted shadow
```

### Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat surfaces |
| 1 | shadow-sm | Cards, list items |
| 2 | shadow-md | Raised cards |
| 3 | shadow-lg | Buttons, floating actions |
| 4 | shadow-xl | Modals, sheets |

---

## Border Radius

### Scale

| Class | Pixels | Usage |
|-------|--------|-------|
| `rounded` | 4px | Small elements |
| `rounded-lg` | 8px | Cards, containers |
| `rounded-xl` | 12px | Images, large cards |
| `rounded-2xl` | 16px | Prominent cards |
| `rounded-3xl` | 24px | Sheet tops, major containers |
| `rounded-full` | 9999px | Circles, pills, badges |

### Usage Patterns

```tsx
// Images
<img className="rounded-xl" />  // 12px

// Cards
<Box className="rounded-xl" />  // 12px

// Buttons
<Button className="rounded-full" />  // Pill shape

// Sheet tops
<Box className="rounded-t-3xl" />  // 24px top only

// Icon containers
<Box className="rounded-lg" />  // 8px
<Box className="rounded-full" />  // Circle
```

---

## Code Examples

### Example 1: Product Card

```tsx
<Box className="p-3 bg-surface rounded-lg border border-divider shadow-sm">
  <Box className="flex gap-3">
    <img
      src={product.image}
      alt={product.name}
      className="w-16 h-16 rounded-lg object-cover border border-divider"
    />
    <Box className="flex-1 space-y-1">
      <Text size="normal" className="font-medium text-onSurface">
        {product.name}
      </Text>
      <Text size="xSmall" className="text-onSurfaceVariant">
        {product.price}
      </Text>
    </Box>
  </Box>
</Box>
```

### Example 2: Action Card (Clickable)

```tsx
<Box
  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer active:bg-gray-100 transition-colors"
  onClick={handleClick}
>
  <Box className="flex items-center gap-3">
    <Box className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
      <Icon icon="zi-star" size={20} className="text-primary" />
    </Box>
    <Box>
      <Text size="small" className="font-semibold text-gray-900">
        Voucher Applied
      </Text>
      <Text size="xSmall" className="text-green-600 font-medium mt-0.5">
        WELCOME
      </Text>
    </Box>
  </Box>
  <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
</Box>
```

### Example 3: Price Row

```tsx
<Box className="flex justify-between items-center">
  <Text size="small" className="text-gray-600">
    Delivery Fee
  </Text>
  <Text size="small" className="text-green-600 font-medium">
    0 QR
  </Text>
</Box>
```

### Example 4: Total Row (Emphasized)

```tsx
<Box className="flex justify-between items-center pt-3 border-t border-gray-200">
  <Text size="normal" className="font-bold text-gray-900">
    Total
  </Text>
  <Text size="large" className="font-bold text-primary">
    <DisplayPrice>{totalPrice}</DisplayPrice>
  </Text>
</Box>
```

### Example 5: Primary CTA Button

```tsx
<Button
  type="highlight"
  fullWidth
  onClick={handleCheckout}
  className="rounded-full h-14 text-base font-bold shadow-lg"
  style={{
    backgroundColor: "#D32F2F",
    color: "white",
  }}
>
  <Box className="flex items-center justify-center gap-2">
    <Text className="text-white font-bold">Go to Checkout</Text>
    <Icon icon="zi-arrow-right" size={20} className="text-white" />
  </Box>
</Button>
```

### Example 6: List with Dividers

```tsx
<Box className="divide-y divide-gray-100">
  {items.map((item, index) => (
    <Box key={index} className="py-3">
      {/* Item content */}
    </Box>
  ))}
</Box>
```

---

## Checklist for New Components

When creating a new component, ensure:

- [ ] Uses coffee color palette (`var(--coffee-*)`)
- [ ] Follows spacing system (4px increments)
- [ ] Touch targets ≥ 44x44px
- [ ] Includes active states (`active:bg-*`)
- [ ] Uses smooth transitions (200ms cubic-bezier)
- [ ] Proper border radius (8-24px for cards)
- [ ] Appropriate shadows for elevation
- [ ] Typography hierarchy is clear
- [ ] Generous padding (16px minimum)
- [ ] Responsive to different screen sizes
- [ ] Safe area padding where needed
- [ ] Accessible color contrast (WCAG AA)

---

## Quick Reference

### Common Class Combinations

```tsx
// Standard card
"p-4 bg-white rounded-xl border border-gray-100"

// Interactive card
"p-4 bg-gray-50 rounded-xl cursor-pointer active:bg-gray-100 transition-colors"

// Icon button
"w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"

// Pill button
"flex items-center gap-2 bg-black rounded-full px-4 py-2 active:opacity-80 transition-opacity"

// Section spacing
"mt-4" (16px), "mt-6" (24px), "space-y-3" (12px gap)

// Flex layouts
"flex items-center gap-3"
"flex justify-between items-center"
"flex flex-col space-y-2"
```

### Color Quick Reference

```tsx
// Text colors
text-primary          // Coffee brown
text-gray-900         // Almost black
text-gray-600         // Medium gray
text-gray-500         // Light gray
text-gray-400         // Very light gray
text-green-600        // Success green
text-red-600          // Error red

// Background colors
bg-white              // Pure white
bg-surface            // Cream
bg-gray-50            // Very light gray
bg-gray-100           // Light gray

// Border colors
border-gray-100       // Light border
border-gray-200       // Medium border
border-divider        // Coffee outline variant
```

---

**End of Guidelines**

For questions or updates, refer to the implementation in:
- `src/components/cart/checkout-sheet.tsx`
- `src/components/cart/checkout-item.tsx`
- `src/css/app.scss`
