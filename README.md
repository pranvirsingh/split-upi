# SplitUPI — One amount. Multiple UPI QR codes.

Generate ready-to-pay UPI QR codes in seconds. No signup required.

**Live:** https://split-upi-ochre.vercel.app/

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## What it does

- Enter UPI ID, receiver name, total amount, max per QR, optional note
- Splits the total with integer-paise math so parts always sum exactly
  - `4500 / 1999 → 1999 + 1999 + 502`
  - `10000 / 1999 → 1999 × 5 + 5`
- Generates standard UPI URIs (`upi://pay?pa=…&pn=…&am=…&cu=INR&tn=…`) + QR codes fully client-side
- Download branded PNGs, copy UPI links, Share / Share All (Web Share API), Print All, Download All
- Mobile-first, PWA installable, offline-capable, print stylesheet

## Tests

```bash
npm test          # vitest: unit, denial, QR-decode (39 tests)
npm run test:logic # spec regression script
```

Covers all required cases from the spec (splitting, rounding, validation, URI generation).

## Mobile (Android)

Same web code, wrapped with Capacitor (`app.splitupi`).

- App shows the generator only — no marketing sections.
- QR PNGs save/share through the native system sheet.
- Debug APK is built in CI on every version tag and attached to the GitHub Release.
- Privacy policy: `/privacy.html` (linked in-app, needed for Play Store later).

## CI/CD

- **CI (GitHub Actions):** every push to `main` and every pull request runs `npm ci` → `npm run test:logic` → `npm run build`. See `.github/workflows/ci.yml`.
- **CD (Vercel):** import the repo in the Vercel dashboard (zero-config for Vite — build `npm run build`, output `dist`). Every PR gets a preview deployment; merging to `main` deploys production.

## Positioning

“Split one amount into multiple ready-to-pay UPI QR codes.” The tool does not process or hold money — payment happens in the payer's UPI app. It does not claim to avoid any bank/UPI-app fees, limits, or policies. Presets (₹499/₹999/₹1,999/₹4,999) are convenience options only.
