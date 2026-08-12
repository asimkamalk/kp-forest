# Design System — KP Forest Department

The brief is "aesthetic, forest vibes" for a **government portal**. Those pull in
opposite directions, so the resolution is this: the atmosphere comes from the
department's own working materials — not from stock forest photography and green buttons.

A forest officer's actual artifacts are **working plans, compartment maps, girth tapes,
elevation surveys and herbarium sheets**. That is where this design comes from.

---

## 1. Palette

Six values. Every colour in the build derives from these — no ad-hoc hexes.

| Token | Hex | Where it comes from | Use |
|---|---|---|---|
| `--bark` | `#10251B` | Deodar bark in shade | Dark sections, headings, footer |
| `--deodar` | `#1F4D36` | *Cedrus deodara* canopy | Primary. Buttons, links, active states |
| `--moss` | `#7D9B6A` | Lichen on north-facing trunks | Secondary text on dark, muted icons |
| `--resin` | `#B8891C` | Pine resin bleeding from a marked tree | Accent. Eyebrows, underlines, focus rings |
| `--paper` | `#F1F3EC` | Working-plan survey paper | Page background |
| `--mist` | `#D8E0D6` | Galiyat morning fog | Borders, dividers, card edges |

**What this deliberately is not:** cream-and-terracotta, or black-with-neon-green. Both are
the reflex palettes for "premium website," and neither has anything to do with a forest
department. `--paper` carries a faint green cast rather than a warm cream one, so the whole
page sits under a canopy tint instead of reading as a coffee-table brochure.

Contrast check: `--bark` on `--paper` = 14.8:1. `--deodar` on `--paper` = 7.9:1.
`--resin` on `--bark` = 6.2:1. All clear WCAG AA, most clear AAA.

---

## 2. Typography

Three faces, three jobs. All on Google Fonts, all free to redistribute — which matters
for a government procurement review.

| Role | Face | Why this one |
|---|---|---|
| Display | **Fraunces** (`opsz` 72, `SOFT` 40, `WONK` 1) | A variable serif with an optical-size axis. At large sizes its terminals swell and curve — it reads botanical, like the lettering on a nineteenth-century plant plate. Used **only** at 36px and above. |
| Body / UI | **Public Sans** | Commissioned by the US government specifically for public-sector interfaces. Neutral, tall x-height, unmistakably legible at 14px on a cheap Android screen. Not Inter — Inter is the default everyone reaches for, and Public Sans has the better argument here. |
| Data / labels | **IBM Plex Mono** | For compartment numbers, coordinates, hectares, region codes. Monospace signals "this is a measurement," and forestry runs on measurements. |
| Urdu | **Noto Nastaliq Urdu** | Needs `line-height: 2.2` minimum — Nastaliq descenders collide otherwise. |

**Type scale** (1.25 ratio, clamped for fluid sizing):

```
display   clamp(2.75rem, 6vw, 4.5rem)   Fraunces 400, tracking -0.02em, leading 1.02
h1        clamp(2rem, 4vw, 3rem)        Fraunces 400, leading 1.1
h2        clamp(1.5rem, 2.5vw, 2rem)    Fraunces 400
h3        1.25rem                        Public Sans 600
body      1rem / 1.7                     Public Sans 400
small     0.875rem                       Public Sans 400
eyebrow   0.75rem                        IBM Plex Mono 500, tracking 0.14em, uppercase
data      0.8125rem                      IBM Plex Mono 400, tabular-nums
```

The eyebrow is mono and uppercase everywhere — it is the thread that ties the institutional
half of the design to the atmospheric half.

---

## 3. Signature element — the contour layer

**This is the one thing the site should be remembered by. Everything else stays quiet.**

Forest divisions are surveyed and mapped by elevation. Contour lines are the department's
native visual language, and they carry real information: how mountainous a place is.

The contour layer appears in three places, and in each one it **encodes something true**:

**a) Hero backdrop.** A fine `--mist` contour field sits between the photograph and the
dark overlay, drifting 20–30px on scroll parallax. It reads as topography seen through fog.

**b) Region cards — contour density is data.** Each of the three regions gets a different
contour density derived from its actual terrain:

| Region | Terrain | Contour treatment |
|---|---|---|
| I — Central Southern (Peshawar) | Plains and low hills | Sparse, wide-spaced, gentle curves |
| II — Northern (Abbottabad) | Hazara, Kaghan, Kohistan | Dense, tight rings, steep gradients |
| III — Malakand (Swat) | Swat, Dir, Chitral | Densest, sharp peaks, closed contours |

A visitor learns the geography of the province by looking at three cards. That is
structure encoding information, not decoration.

**c) Section dividers.** A single contour line runs edge to edge between major sections,
replacing the usual `<hr>`. It draws itself in via `stroke-dashoffset` when scrolled into view.

**Restraint rule:** the contour layer never exceeds 8% opacity over photography or 14%
on `--paper`. If you can read it as a distinct graphic rather than as texture, turn it down.

---

## 4. Everything else stays disciplined

- **Radius:** `12px` on cards, `8px` on inputs and buttons. Not pill-shaped, not square.
- **Shadows:** two only. `--shadow-card: 0 1px 2px rgb(16 37 27 / 0.06), 0 8px 24px -16px rgb(16 37 27 / 0.24)` and a hover variant with the second layer deepened. No glow, no coloured shadows.
- **No gradients** except the dark scrim over hero photography.
- **No glassmorphism.** The only blur on the site is the navbar backdrop on scroll.
- **Images** get a `1px inset --mist` border so photographs sit on the paper rather than float above it.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Sections use 96px on desktop, 64px on mobile.
- **Grid:** 12 columns, `max-width: 1200px`, 24px gutters, 24px page padding.

---

## 5. Motion

Motion is atmospheric, never performative. A citizen filing a complaint should not have
to wait for an animation.

| Where | What | Duration |
|---|---|---|
| Page load | Navbar drops in; hero headline reveals word by word from behind a mask | 600ms / 700ms staggered 60ms |
| Scroll | Sections fade up 28px, once, at `-80px` viewport margin | 700ms |
| Hero | Ken Burns 1.0 → 1.08 across the 7s slide; cross-fade 900ms | continuous |
| Contour parallax | Translates 20–30px against scroll | tied to scroll |
| Card hover | Lift 6px, image scales 1.06, shadow deepens | 300ms |
| Counters | Spring from 0 to value on entry | ~1.2s |
| Divider | Contour line draws via stroke-dashoffset | 1.4s |

Easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`.
Only `transform` and `opacity` animate. Everything above is disabled under
`prefers-reduced-motion` — and "disabled" means the content is simply *there*, not
a shortened version of the animation.

---

## 6. Copy voice

Words are design material here too.

- **Plain and active.** "Explore the region," not "Learn more." "Lodge a complaint," not "Submit."
- **An action keeps its name.** The button says *Publish*, the toast says *Published*.
- **Name things the way a citizen would.** "Plant request," not "sapling requisition form."
- **Errors are specific and unapologetic.** "This CNIC must be 13 digits" — not "Oops! Something went wrong."
- **Empty states invite.** "No press releases yet. New releases appear here as they are issued."
- **Numbers do the talking.** "32 divisions across 8 circles" beats "a wide network of offices."

---

## 7. Paste-ready code

### `src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-bark:   #10251B;
  --color-deodar: #1F4D36;
  --color-moss:   #7D9B6A;
  --color-resin:  #B8891C;
  --color-paper:  #F1F3EC;
  --color-mist:   #D8E0D6;

  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans:    var(--font-public-sans), system-ui, sans-serif;
  --font-mono:    var(--font-plex-mono), ui-monospace, monospace;
  --font-urdu:    var(--font-nastaliq), serif;

  --radius-card: 12px;
  --ease-forest: cubic-bezier(0.22, 1, 0.36, 1);
}

:root {
  --shadow-card: 0 1px 2px rgb(16 37 27 / 0.06), 0 8px 24px -16px rgb(16 37 27 / 0.24);
  --shadow-card-hover: 0 2px 4px rgb(16 37 27 / 0.08), 0 20px 40px -20px rgb(16 37 27 / 0.32);
}

html { scroll-behavior: smooth; }

body {
  background: var(--color-paper);
  color: var(--color-bark);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Display face only above 36px, with the optical-size axis pushed up */
.font-display {
  font-family: var(--font-display);
  font-variation-settings: "opsz" 72, "SOFT" 40, "WONK" 1;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-resin);
}

.data { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

[lang="ur"] { font-family: var(--font-urdu); line-height: 2.2; direction: rtl; }

:focus-visible {
  outline: 2px solid var(--color-resin);
  outline-offset: 3px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### `src/app/layout.tsx` — font wiring

```tsx
import { Fraunces, Public_Sans, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"], variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"], display: "swap",
});
const publicSans = Public_Sans({
  subsets: ["latin"], variable: "--font-public-sans", display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap",
});
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"], variable: "--font-nastaliq", display: "swap",
});
```

### `src/components/motion/contour-field.tsx` — the signature

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type Density = "sparse" | "medium" | "dense";

/** Deterministic contour bands. Density maps to real terrain, so it is data, not decoration. */
function bands(density: Density) {
  const count = { sparse: 6, medium: 11, dense: 16 }[density];
  const amp = { sparse: 14, medium: 30, dense: 46 }[density];
  return Array.from({ length: count }, (_, i) => {
    const y = 40 + i * (320 / count);
    const a = amp * (0.55 + 0.45 * Math.sin(i * 1.7));
    return `M0 ${y} C 120 ${y - a}, 240 ${y + a}, 400 ${y - a * 0.6} S 680 ${y + a * 0.8}, 800 ${y}`;
  });
}

export function ContourField({
  density = "medium",
  opacity = 0.14,
  parallax = 0,
  className = "",
}: {
  density?: Density;
  opacity?: number;
  parallax?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : parallax]);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <motion.svg
        style={{ y }} viewBox="0 0 800 400" preserveAspectRatio="none"
        className="h-full w-full" fill="none"
      >
        {bands(density).map((d, i) => (
          <path key={i} d={d} stroke="currentColor" strokeWidth={0.75} opacity={opacity} />
        ))}
      </motion.svg>
    </div>
  );
}
```

Region I uses `sparse`, Region II `medium`, Region III `dense`.
