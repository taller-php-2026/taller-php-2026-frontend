---
name: SoftUI Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#695f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#baad3e'
  on-tertiary-container: '#474000'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#f4e570'
  tertiary-fixed-dim: '#d7c957'
  on-tertiary-fixed: '#201c00'
  on-tertiary-fixed-variant: '#4f4800'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 24px
  gutter: 16px
---

## Brand & Style
This design system centers on a **SoftUI / Neomorphic-lite** aesthetic, blending the cleanliness of modern SaaS with the approachability of soft, tactile surfaces. The brand personality is professional yet welcoming, designed to reduce cognitive load through low-contrast transitions and generous white space. 

The visual language uses a mix of **Minimalism** and **Modern Corporate** styles. It prioritizes clarity and a sense of "calm efficiency" for service-based platforms. The emotional response should be one of reliability and ease, achieved through the use of rounded geometries, subtle depth through shadows rather than heavy lines, and a refreshing primary accent that feels both organic and clinical.

## Colors
The palette is rooted in a refreshing **Soft Teal** (#0e9488) used for primary actions, success states, and key brand moments. This is balanced by a high-clarity neutral scale that favors cool grays to maintain a professional atmosphere.

- **Primary:** Used for the main call-to-action buttons, active states, and focus indicators.
- **Background:** A very light gray (#f8fafc) provides the base canvas, allowing white cards to "pop" with minimal effort.
- **Surface:** Pure white (#ffffff) is reserved for interactive cards and containers to maximize perceived cleanliness.
- **Accents:** Use a 10% opacity version of the primary teal for subtle hover states and secondary highlights (chips/badges).

## Typography
**Inter** is the core typeface, chosen for its exceptional legibility in digital interfaces. The typographic hierarchy relies on weight changes rather than extreme size shifts to maintain the "soft" professional look.

- **Headlines:** Use Semi-Bold (600) or Bold (700) with slight negative letter spacing to feel compact and modern.
- **Body Text:** Use Regular (400) weight for long-form content. For secondary information, use a slightly lighter gray color rather than a smaller font size to preserve readability.
- **Interactive Labels:** Use Semi-Bold (600) to distinguish clickable elements from static text.

## Layout & Spacing
The system utilizes a **Fixed Grid** approach for desktop views to maintain a curated, editorial feel, while transitioning to a **Fluid Grid** for mobile. 

The spacing philosophy is generous, using a 4px base unit. 24px (lg) is the standard margin for containers, while 16px (md) is used for internal card padding. Elements should feel "airy"—never crowd the content. Use white space as a functional tool to group related items instead of relying solely on borders.

## Elevation & Depth
Elevation in this design system is achieved through **Ambient Shadows** and tonal layering. 

- **Level 0 (Background):** The light gray canvas.
- **Level 1 (Cards):** White surfaces with a soft, multi-layered shadow (e.g., `0px 4px 20px rgba(0, 0, 0, 0.04)`). These should feel like they are resting gently on the surface.
- **Level 2 (Active/Hover):** When a user interacts with a card, the shadow should slightly expand and become more diffused, simulating a subtle lift.
- **Level 3 (Modals/Dropdowns):** Higher contrast shadows to clearly separate the element from the main content flow.

Avoid heavy black shadows; instead, use shadows with a tiny hint of the primary teal or a neutral blue-gray to keep the palette cohesive.

## Shapes
The shape language is consistently **Rounded**. The standard corner radius is **8px** for small components (inputs, buttons) and **16px** for larger containers (cards, modals). 

This consistent roundness removes the "sharpness" typical of enterprise software, contributing to the soft, approachable aesthetic. Use "pill" shapes exclusively for tags or chips to differentiate them from functional buttons.

## Components

### Buttons
- **Primary:** Solid teal background, white text. Apply a very subtle vertical gradient (Teal-500 to Teal-600) to add a touch of "soft" volume.
- **Secondary:** White background with a 1px low-contrast border (#e2e8f0) or a light teal tint.
- **Shape:** 8px corner radius.

### Input Fields
- **Default:** White background, 1px light gray border (#e2e8f0), and 8px rounding.
- **Focus:** The border color shifts to the primary teal with a soft glow (box-shadow) of the same color at 15% opacity.

### Cards
- **Structure:** Pure white background, 16px corner radius, and Level 1 elevation.
- **Header:** Use a subtle horizontal divider or simply a change in font weight to separate the title from the body.

### Chips & Badges
- **Style:** Pill-shaped (fully rounded).
- **Colors:** Use "Ghost" styling—light primary tint background with dark primary text for high legibility without visual weight.

### Lists & Tables
- **Dividers:** Use extremely thin (1px) and light (#f1f5f9) lines. Avoid borders where possible; use vertical spacing (16px) to define row separation.

### Calendar & Scheduling
- **Active State:** Solid primary color circles/rectangles with rounded corners.
- **Inactive/Disabled:** Light gray text with no background, avoiding any visual "clutter" for unavailable slots.