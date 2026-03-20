# Engage Styling Guidelines

---

## 1. Typography

### Font Family

**Primary font:** [Inter](https://fonts.google.com/specimen/Inter)

- **Configured in:** `src/app/layout.tsx`
- **CSS variable:** `--font-sans`
- **Subsets:** Latin, Vietnamese
- **Applied globally** via Tailwind's `font-sans` utility

**Usage:**

```tsx
// Already applied globally to <html> element
// Use Tailwind utilities for font weight/size:
<p className="text-sm font-medium">Medium text</p>
<h1 className="text-2xl font-bold">Bold heading</h1>
```

**Font weights available:**

- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)

**Why Inter:**

- Excellent readability at small sizes
- Professional, modern aesthetic
- Wide language support (Vietnamese included)
- Optimized for UI/screen reading

---

## 2. Links & Navigation

**Link buttons and nav items should use black (foreground) color by default**, not muted/gray. This follows the shadcn site style.

**Nav items:**

```tsx
<Link
  className={cn(
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
    isActive && "bg-accent",
  )}
>
  {label}
</Link>
```

**Key points:**

- Default text color: `text-foreground` (black) — inherited, no class needed
- Active state: `bg-accent` background only
- Hover: `hover:bg-accent hover:text-accent-foreground`
- **Never use** `text-muted-foreground` for nav items

---

## 3. General Rules

- **Tailwind only** — No custom CSS files
- **Shadcn conventions** — Follow component styling patterns
- **No inline styles** — Use Tailwind utilities
- **Consistent spacing** — Use Tailwind's spacing scale (px-4, py-2, gap-6, etc.)

---

_More styling guidelines will be added as the project evolves._
