```markdown
# Design System Strategy: The Curated Commons

## 1. Overview & Creative North Star
This design system is built to facilitate trust and high-energy exchange within a collegiate environment. We are moving away from the "utility-only" feel of traditional marketplaces and toward a concept we call **"The Curated Commons."** 

This aesthetic blends the intellectual rigor of academia with the vibrant, social warmth of a student lounge. To achieve a signature "Editorial" feel, we reject the rigid, boxed-in layouts of 2010-era web design. Instead, we embrace **intentional asymmetry, massive typographic contrast, and layered surfaces** that feel like physical objects resting on a desk. We are not just building a list of items; we are curate a community experience that feels premium, verified, and safe.

---

## 2. Colors & The Surface Manifesto
The color palette balances the energetic warmth of Coral with a trustworthy Academic Blue. However, the true sophistication of this system lies in the neutrals.

### The Color Tokens
- **Primary Influence:** `primary` (#9b4243) for authoritative states and `primary_container` (#ea7f7f) for the "Signature Coral" warmth.
- **Secondary Support:** `secondary` (#4453bf) provides the professional "Secondary Blue" anchor for verified status and trust indicators.
- **The Canvas:** `surface` (#fcf9f8) is our base, providing a "warm white" that feels more high-end than clinical #FFFFFF.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Shifts:** Use a `surface_container_low` section to house cards sitting on a `surface` background.
2.  **Tonal Transitions:** Use subtle shifts between `surface_container` tiers to indicate where one functional area ends and another begins.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper. 
- **Bottom Layer:** `surface` (Base page background).
- **Section Layer:** `surface_container_low` (Grouped content areas).
- **Component Layer:** `surface_container_lowest` (#ffffff) (The "White Card" effect).
- **Interactive Layer:** `surface_bright` (Active/hovered states).

### The "Glass & Gradient" Rule
For hero sections or floating navigation, use **Glassmorphism**. Apply `surface_container_lowest` at 70% opacity with a `24px` backdrop blur. For primary CTAs, do not use flat hex codes; use a subtle linear gradient from `primary` to `primary_container` to give buttons a tactile, "clickable" soul.

---

## 3. Typography: The Editorial Voice
We utilize a high-contrast scale to create an "Editorial" hierarchy that guides the eye effortlessly.

- **The Voice (Space Grotesk):** Headings use Space Grotesk. It is modern and geometric. Use `display-lg` for hero statements with a negative letter-spacing of `-0.02em` to feel like a high-end magazine.
- **The Engine (Inter):** All functional UI and body copy use Inter. It provides a clean, friendly counter-balance to the eccentricities of Space Grotesk.

**Hierarchy Intent:**
- **Display/Headline:** Use `headline-lg` in `on_surface` for major category titles.
- **Body:** Use `body-lg` for item descriptions to ensure readability for students on the move.
- **Label:** Use `label-md` in `on_secondary_fixed_variant` for metadata (e.g., "Verified Student") to add a "stamped" professional feel.

---

## 4. Elevation & Depth: Beyond the Drop Shadow
We convey hierarchy through **Tonal Layering** and physical physics rather than structural lines.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_lowest` card resting on a `surface_container_low` section creates a natural "lift" without a single pixel of shadow.
- **Ambient Shadows:** Shadows are reserved for "Floating" elements (Modals, Popovers). Use a large blur (32px+) with a 4% opacity. The shadow color should be a tint of `surface_tint` (#9b4243) rather than black, creating a natural, warm glow.
- **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use the `outline_variant` token at **20% opacity**. Never use a 100% opaque border.
- **Edge Softness:** All containers use the `DEFAULT` (8px) radius for a "polished-yet-warm" feel. Use `full` (pill-shape) only for status tags or selection chips.

---

## 5. Components

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. White text (`on_primary`). 8px radius. Use `title-sm` for the label.
- **Secondary:** `secondary_fixed_dim` background with `on_secondary_fixed` text. This provides a "soft blue" alternative for secondary actions like "Message Seller."
- **Ghost/Tertiary:** No background. `primary` text. Use for "Cancel" or "Back" actions.

### Cards & Lists (The "No-Divider" Layout)
- **Cards:** Use `surface_container_lowest` (#ffffff). Forbid the use of divider lines inside cards. Use the Spacing Scale (24px or 32px gaps) to separate the title from the body.
- **Lists:** Instead of horizontal rules, use a 1px `surface_container_highest` background shift on hover to indicate interactivity.

### Chips & Verification Tags
- **Verified Student Tag:** Use `secondary_container` with `on_secondary_container` text. This blue "stamp" signals trust.
- **Category Chips:** Use `surface_container_high` with a `full` (9999px) radius.

### Input Fields
- **State:** Rest state uses `surface_container_low` as a background (no border). 
- **Focus State:** Transitions to `surface_container_lowest` with a 1px "Ghost Border" using `primary` at 40% opacity. This creates a "glow" effect rather than a hard line.

---

## 6. Do's and Don'ts

### Do
- **Use "Breathing Room":** If you think you have enough white space, add 8px more. Editorial design thrives on "air."
- **Overlap Elements:** Let a product image slightly break the boundary of its container to create a "3D" layered effect.
- **Tone-on-Tone:** Place `primary_fixed` icons on `primary_fixed_dim` backgrounds for sophisticated, low-contrast visual interest.

### Don't
- **Don't use #000000:** Use `on_surface` (#1c1b1b) for text to keep the "warm" student-centric vibe.
- **Don't use hard borders:** Avoid 100% opaque `outline` tokens. They feel "default" and break the premium illusion.
- **Don't crowd the margins:** Keep a minimum of 24px padding inside all cards and containers.
- **Don't use generic shadows:** Never use the default "Drop Shadow" preset in your design tool. Always tint the shadow with the primary brand hue.```