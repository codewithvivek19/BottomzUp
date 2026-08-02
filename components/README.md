# Components (reference)

This Bottomz Up website is **static HTML / CSS / JS** — it does **not** run React, Tailwind, or shadcn out of the box.

The `ui/control-knob.tsx` file is kept as a **reference** for a future React app.  
The **live heat dial** on the Wings section is:

- `css/control-knob.css`
- `js/control-knob.js`
- wired into `js/wings-forge.js` + home/menu markup

## Why `components/ui`?

In shadcn projects, the default component path is `components/ui` (configured in `components.json`). Keeping that folder name means:

- `npx shadcn@latest add …` drops files in a known place  
- Imports stay consistent: `@/components/ui/…`  
- Team and docs assume this layout

## Setup a real shadcn + Tailwind + TypeScript app (optional)

```bash
# Next.js (recommended)
npx create-next-app@latest bottomz-ui --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd bottomz-ui

# shadcn
npx shadcn@latest init
# choose defaults → components land in components/ui

# framer-motion (required by control-knob)
npm install framer-motion

# copy this file into that project
# components/ui/control-knob.tsx
```

Ensure `lib/utils.ts` exports `cn` (shadcn creates this).

Then:

```tsx
import ControlKnob from "@/components/ui/control-knob";
```
