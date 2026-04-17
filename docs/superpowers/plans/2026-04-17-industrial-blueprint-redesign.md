# Industrial Blueprint Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the UI into a high-precision, Neobrutalist "Industrial Blueprint" theme with mechanical animations and a slate/orange color palette.

**Architecture:** 
- Centralize all design tokens in `index.css`.
- Enhance core components (`Button`, `Navbar`, `Input`, `Card`) with tactile feedback and laser-trace animations.
- Implement a global grid background and sharp-corner structural layout.

**Tech Stack:** React, Vanilla CSS, Framer Motion (if already present, otherwise CSS transitions).

---

### Task 1: Global Design Tokens & Grid System

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Update CSS Variables**

Replace the existing `:root` variables with the Industrial Blueprint palette.

```css
:root {
  --color-bg-primary: #0B0D0F;
  --color-bg-secondary: #16191D;
  --color-grid: #1A1E23;
  --color-accent-primary: #FF6B00; /* Safety Orange */
  --color-accent-secondary: #1E2A3B; /* Blueprint Blue */
  --color-text-primary: #F0F0F0;
  --color-text-secondary: #808A9D;
  --color-border: #1E2A3B;
  --color-border-active: #FF6B00;
  --radius-none: 0px;
  --spacing-grid: 32px;
}
```

- [ ] **Step 2: Implement Grid Background**

Apply the technical grid to the body.

```css
body {
  background-color: var(--color-bg-primary);
  background-image: 
    linear-gradient(to right, var(--color-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--color-grid) 1px, transparent 1px);
  background-size: var(--spacing-grid) var(--spacing-grid);
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: Reset Radius and Shadows**

Force sharp corners and blocky shadows.

```css
* {
  border-radius: var(--radius-none) !important;
}

.card {
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  box-shadow: 4px 4px 0px 0px #000000;
  transition: border-color 0.2s ease;
}

.card:hover {
  border-color: var(--color-border-active);
}
```

- [ ] **Step 4: Verify UI loading**

Run the app and check that the background is dark slate with a subtle grid and all cards have sharp corners.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: implement industrial blueprint global tokens and grid"
```

---

### Task 2: Mechanical Button Component

**Files:**
- Modify: `frontend/src/components/Button.jsx`
- Modify: `frontend/src/App.css` (for button-specific animations)

- [ ] **Step 1: Update Button Styles**

Implement the "Press-In" tactile feedback.

```css
/* In App.css */
.btn-industrial {
  position: relative;
  background: var(--color-accent-secondary);
  color: white;
  border: 2px solid #000;
  box-shadow: 4px 4px 0px 0px #000;
  transition: all 0.05s active;
  font-family: 'Space Grotesk', sans-serif;
  text-transform: uppercase;
  font-weight: 800;
}

.btn-industrial:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px 0px #000;
}

.btn-primary-industrial {
  background: var(--color-accent-primary);
  color: black;
}
```

- [ ] **Step 2: Update Button Component Logic**

Modify `Button.jsx` to use the new classes.

```javascript
// frontend/src/components/Button.jsx
const Button = ({ children, variant = 'primary', ...props }) => {
  const className = `btn-industrial ${variant === 'primary' ? 'btn-primary-industrial' : ''}`;
  return <button className={className} {...props}>{children}</button>;
};
```

- [ ] **Step 3: Verify Button Tactile Feel**

Ensure buttons "sink" into their shadow when clicked.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Button.jsx frontend/src/App.css
git commit -m "feat: implement mechanical button feedback"
```

---

### Task 3: Laser-Trace Card Interaction

**Files:**
- Modify: `frontend/src/App.css`

- [ ] **Step 1: Add Laser-Trace Animation**

Create the CSS for the "drawing" border effect.

```css
@keyframes laserTrace {
  0% { clip-path: inset(0 100% 100% 0); }
  25% { clip-path: inset(0 0 100% 0); }
  50% { clip-path: inset(0 0 0 0); }
  75% { clip-path: inset(0 0 0 100%); }
  100% { clip-path: inset(0 100% 0 0); }
}

.card-laser-wrapper {
  position: relative;
}

.card-laser-border {
  position: absolute;
  inset: -2px;
  border: 2px solid var(--color-accent-primary);
  pointer-events: none;
  opacity: 0;
}

.card:hover .card-laser-border {
  opacity: 1;
  animation: laserTrace 0.4s linear forwards;
}
```

- [ ] **Step 2: Apply to Common Cards**

Find a card in the landing page or dashboard and wrap its content or add the laser border element.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.css
git commit -m "style: add laser-trace hover animation to cards"
```

---

### Task 4: Unfolding Panel Animations

**Files:**
- Modify: `frontend/src/App.jsx` (or specific page components)

- [ ] **Step 1: Define Unfold Keyframes**

```css
@keyframes unfoldPanel {
  0% { transform: scaleY(0); transform-origin: top; }
  70% { transform: scaleY(1.05); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
}

.unfold-animate {
  animation: unfoldPanel 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
```

- [ ] **Step 2: Apply to Main Content Area**

Wrap the main `<section>` or `<Routes>` container with the `unfold-animate` class to trigger on page load.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.css
git commit -m "style: implement unfolding panel transitions"
```
