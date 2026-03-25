```markdown
# Design System Strategy: The Organic Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Sanctuary."** 

Moving beyond a standard non-profit template, this system treats digital space as a physical landscape. We reject the rigid, "boxed-in" nature of traditional web design in favor of **Organic Editorialism**. By utilizing intentional asymmetry, layered depth, and a high-contrast typographic scale, we create an experience that feels as quiet and restorative as a morning in the forest. 

The goal is to evoke *emotional trust* through sophisticated minimalism. We use large-scale nature photography as structural elements, allowing the UI to breathe through expansive white space (the "Silent Grid") and soft, fluid transitions.

---

## 2. Colors: The Natural Palette
Our color strategy mimics the layers of a forest floor. We utilize a tonal-first approach where color transitions define boundaries rather than lines.

### Core Tones
*   **Primary (`#384e31`) & Primary Container (`#4f6647`):** The "Forest Canopy." Used for high-impact brand moments and key calls to action.
*   **Secondary (`#7c5730`):** The "Earth." Used for grounding elements and functional accents.
*   **Tertiary (`#703823`):** The "Terracotta." Reserved for emotional highlights or urgent rescue alerts.
*   **Background (`#fbf9f2`):** The "Morning Mist." A warm, off-white base that prevents the clinical feel of pure hex white.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning or containment. 
Structure must be achieved through:
1.  **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
2.  **Negative Space:** Using the `16` (5.5rem) or `20` (7rem) spacing tokens to create mental model separations.
3.  **Soft Edges:** Relying on the `xl` (1.5rem) corner radius to soften the transition between imagery and UI.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine, handmade paper. 
*   **Base:** `surface` (`#fbf9f2`)
*   **Inner Content:** `surface-container` (`#f0eee7`)
*   **Floating Elements:** `surface-container-lowest` (`#ffffff`) 

### The "Glass & Gradient" Rule
To add "soul," use subtle gradients for Hero sections, transitioning from `primary` to `primary_container`. For floating navigation or over-image labels, apply **Glassmorphism**: use `surface` at 70% opacity with a `20px` backdrop blur.

---

## 3. Typography: Editorial Authority
The interplay between **Noto Serif** and **Manrope** creates a balance between heritage (trust) and modern efficiency (action).

*   **Display & Headlines (Noto Serif):** These are our "Voice." Use `display-lg` (3.5rem) for hero statements with a negative letter-spacing of `-0.02em`. This creates a high-end, editorial feel.
*   **Body (Manrope):** Our "Information." Use `body-lg` (1rem) for readability. Ensure a generous line-height (1.6) to maintain the feeling of "breathing room."
*   **Labels (Manrope):** Use `label-md` in All Caps with `0.05em` letter spacing for a sophisticated, "curated" look on small functional tags.

---

## 4. Elevation & Depth: Tonal Layering
We do not use elevation to denote "z-index" in the traditional sense; we use it to denote "Presence."

*   **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` card on a `surface-container-low` background. This "soft lift" feels more natural and less digital.
*   **Ambient Shadows:** Where floating is required (e.g., a "Donate" FAB), use a custom shadow: `0 20px 40px rgba(27, 28, 24, 0.06)`. The shadow color is derived from `on-surface` at a very low opacity to mimic natural light filtered through trees.
*   **The Ghost Border Fallback:** If a border is required for accessibility (e.g., input fields), use `outline-variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Soft & Intentional

### Buttons
*   **Primary:** Background: `primary`. Text: `on-primary`. Radius: `full`. No shadow.
*   **Secondary:** Background: `surface-container-high`. Text: `on-secondary-container`. 
*   **Interactions:** On hover, a subtle shift to `primary_container` creates a "soft glow" effect rather than a hard color change.

### Cards & Lists
*   **Forbidden:** Divider lines between items.
*   **Requirement:** Use the `8` (2.75rem) spacing token to separate list items. Cards should use `surface-container-low` with an `xl` radius.
*   **Image Integration:** Photos within cards should always use a `top-left` and `bottom-right` radius of `xl`, leaving the other corners square to create a "custom cut" architectural look.

### Input Fields
*   Background: `surface-container-lowest`. 
*   Border: `none` (use a 2px bottom-accent of `outline_variant` that expands to `primary` on focus).
*   Label: `label-md` positioned above the field, never inside.

### Signature Component: The "Nature-In-Focus" Carousel
A custom component for fawn rescue stories. It uses a `surface-container-highest` background, asymmetrical image placement, and `display-sm` typography that overlaps the image edge slightly to break the "grid-block" look.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Offset text blocks from center-aligned images to create a high-end magazine layout.
*   **Use Large Imagery:** Photography of nature should be the "primary color" of any page.
*   **Respect the "Silent Grid":** If in doubt, add more white space. Use the `20` (7rem) token between major sections.

### Don't:
*   **Don't use hard black:** Use `on-surface` (`#1b1c18`) for text; it is a soft charcoal that is easier on the eyes.
*   **Don't use 1px dividers:** Dividers are a sign of "template" design. Use color shifts or space.
*   **Don't use standard "Alert Red":** Use `error` (`#ba1a1a`) which is tuned to be legible but still earthy enough to match the forest palette.
*   **Don't use sharp corners:** Every interactive element must have at least a `md` (0.75rem) radius to maintain the "Soft Minimalism" style.