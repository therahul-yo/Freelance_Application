# Design Spec: Industrial Blueprint Redesign

**Date:** 2026-04-17  
**Theme:** Neobrutalist Industrial / Technical Blueprint  
**Status:** Approved

## 1. Vision
Transform the existing sleek dark UI into a high-contrast, tactile, and "mechanical" experience. The app should feel like a high-precision tool or a technical blueprint coming to life.

## 2. Visual Foundation

### 2.1 Colors
- **Background (Base):** `#0B0D0F` (Deep Matte Slate)
- **Background (Grid):** Subtle 32px grid lines using `#16191D`
- **Primary Accent:** `#FF6B00` (Safety Orange) - Used for active states, primary actions, and "laser" highlights.
- **Secondary Accent:** `#1E2A3B` (Blueprint Blue) - Used for structural borders and inactive frames.
- **Text (Primary):** `#F0F0F0` (High-contrast White)
- **Text (Muted):** `#808A9D` (Dimmed Gray for metadata/labels)

### 2.2 Geometry & Structure
- **Borders:** Fixed 2px solid lines.
- **Corners:** `border-radius: 0` (Strictly sharp corners).
- **Cards:** Defined by Blueprint Blue borders that turn Safety Orange on interaction. Every card includes a "part-number" (e.g., [ID-882]) in the top-right corner.
- **Shadows:** Neobrutalist style—solid offset blocks, no blur.
  - *Standard Card:* `4px 4px 0px 0px #000000`
  - *Active Button:* `0px 0px 0px 0px #000000` (pressed state)

## 3. Interaction & Animation (Intensity Level 3: Full Industrial)

### 3.1 Laser-Trace Hover
Borders do not fade in; they "draw" themselves.
- **Effect:** A Safety Orange line traces the perimeter of cards/buttons in 200ms when hovered.
- **Implementation:** CSS `clip-path` or `stroke-dashoffset` path animation.

### 3.2 Unfold Panel Transition
Panels and modals unfold like a physical blueprint.
- **Effect:** Vertical scale expansion from 0 to 1 with a 10% "overshoot" (bounce) to simulate mechanical recoil.
- **Direction:** `transform-origin: top`.

### 3.3 Tactile Mechanical Feedback
- **Buttons:** Physical displacement. On `:active`, button shifts `2px` down/right to align with its shadow.
- **System Shake:** Completing a major action (e.g., "Post Gig") triggers a subtle 50ms high-frequency vibration (`translate`) of the UI container.
- **Scanning Loader:** Instead of a spinner, a horizontal orange laser beam scans up and down the content area being loaded.

## 4. Typography
- **Headings:** *Space Grotesk* (Bold) - Geometric and structural.
- **Body:** *Inter* (Medium) - Clean and readable.
- **Data/Monospaced:** *JetBrains Mono* - Used for IDs, part numbers, and technical labels.

## 5. Scope of Changes
1. **Global CSS:** Update variables, root background, and grid pattern.
2. **Component Overhaul:** 
   - `Button.jsx`: Implement "press-in" logic and sharp borders.
   - `Navbar.jsx`: Shift to horizontal blueprint "rail" layout.
   - `Card` (CSS/Component): Add corner labels and laser-trace logic.
3. **Page Transitions:** Add "Unfold" animations to main routes in `App.jsx`.
4. **Input Fields:** Thick borders with orange "LED" indicators for focus.
