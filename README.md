# Chiara Bassetti

Website for Chiara Bassetti — Image Consultant & Sartoria a Torino.

**Live preview:** https://dentistici-hub.github.io/denis-website-chiara-bassetti/

---

## About

Dual-reality site experience:

- **Immagine** (`/`) — consulenza d'immagine. Interactive Munsell color sphere hero, Pantone-matched chips, services scatter grid.
- **Sartoria** (`/sartoria/`) — scroll-scrubbed cinematic walk into a 3D fashion atelier with clickable service hotspots.

Switching between realities triggers a custom GSAP + Astro `ClientRouter` transition: sphere burst, background color tween, SPA page swap, entrance animations.

---

## Stack

- [Astro 6](https://astro.build) — static site generator with SPA-style routing via `ClientRouter`
- [Three.js](https://threejs.org) — WebGL Munsell sphere on the immagine hero
- [GSAP](https://gsap.com) — transition choreography + content animations
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll
- Vanilla TypeScript — no framework component overhead
- Custom shaders, procedural color tooling, Higgsfield frame sequence for the sartoria hero

---

## Development

Requires Node `>= 22.12.0`.

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # static build to dist/
npm run preview # preview the production build
```

---

## Deployment

Deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`. Pages subpath is injected via the `base` field in `astro.config.mjs`.

Live site: **https://dentistici-hub.github.io/denis-website-chiara-bassetti/**

---

## Credits

- Design + engineering: Denis Tcaci
- AI assistance: Claude (Anthropic)
- Sartoria atelier walkthrough rendered via [Higgsfield AI](https://higgsfield.ai)
