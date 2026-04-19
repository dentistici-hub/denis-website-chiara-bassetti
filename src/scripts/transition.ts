/**
 * transition.ts
 *
 * Reality transition between the two pages, orchestrated around an Astro
 * ClientRouter SPA navigation. No persistent element across the swap --
 * each page owns its own hero (sphere on immagine, Spline mannequin on
 * sartoria); the transition is entirely a content fade + background tween.
 *
 * Flow:
 *   runExit(from, to)   -- sphere burst (if leaving immagine), content fade,
 *                          tween body bg to destination color.
 *   navigate(url)       -- Astro swaps the whole DOM.
 *   runEntrance(cur)    -- fade the new content in; if entering immagine
 *                          from sartoria, fire sphere-recompose.
 */

import { gsap } from 'gsap';

type Reality = 'immagine' | 'sartoria';

// Sartoria bg tone now matches the atelier's terracotta-rose plaster walls
// so the scroll-scrubbed hero flows into the content below without a visible
// color seam. The immagine side stays cream.
const REALITY_BG: Record<Reality, string> = {
  immagine: '#FAF8F5',
  sartoria: '#BC9181',
};

// ---------------------------------------------------------------------------
// Scroll-to-top -- graceful glide before the exit choreography starts
// ---------------------------------------------------------------------------

function scrollToTop(): Promise<void> {
  return new Promise((resolve) => {
    const lenis = (window as any).__lenis;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y < 4) return resolve();

    // Duration scales with distance so short trips don't feel laggy and long
    // trips don't feel rushed. Capped so total transition stays ~predictable.
    const duration = Math.min(0.9, Math.max(0.35, y / 1800));

    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, {
        duration,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic
        onComplete: () => resolve(),
      });
      // Safety: if lenis doesn't fire onComplete (e.g. stopped), resolve.
      setTimeout(resolve, duration * 1000 + 120);
    } else {
      // Plain JS glide
      const start = performance.now();
      const from = y;
      const dur = duration * 1000;
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, from * (1 - eased));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    }
  });
}

// ---------------------------------------------------------------------------
// Wash overlay -- diagonal clip-path sweep
// ---------------------------------------------------------------------------

function createFadeOverlay(color: string, cx: number, cy: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'reality-fade';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: 9998',
    // A whisper of internal gradient so the black isn't flat -- reads as a
    // soft bloom rather than a plain cover. Shade center (near mannequin)
    // slightly lighter than edges.
    `background: radial-gradient(ellipse 80% 80% at ${cx}px ${cy}px, ${lighten(color, 10)} 0%, ${color} 100%)`,
    'pointer-events: none',
    'will-change: clip-path, opacity',
    // Start with an invisible clip (zero-radius circle at the center point)
    `clip-path: circle(0% at ${cx}px ${cy}px)`,
  ].join(';');
  document.body.appendChild(el);
  return el;
}

// Lightens or darkens a hex color by `amt` percent toward #808080.
function lighten(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (c: number) => {
    // Push toward 128 by amt%
    const delta = (128 - c) * (amt / 100);
    return Math.max(0, Math.min(255, Math.round(c + delta)));
  };
  const hx = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hx(f(r))}${hx(f(g))}${hx(f(b))}`;
}

// ---------------------------------------------------------------------------
// Sphere burst -- fire-and-forget, safety timeout for sartoria page
// ---------------------------------------------------------------------------

function fireSphereBurst(maxMs = 1700): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const onDone = () => {
      if (done) return;
      done = true;
      window.removeEventListener('sphere-burst-complete', onDone);
      resolve();
    };
    window.addEventListener('sphere-burst-complete', onDone, { once: true });
    window.dispatchEvent(new CustomEvent('sphere-burst'));
    // Safety: if there's no sphere on the current page, resolve anyway.
    setTimeout(onDone, maxMs);
  });
}

// ---------------------------------------------------------------------------
// Text scramble -- corrupts characters and fades opacity in parallel
// ---------------------------------------------------------------------------

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+=<>';

function scrambleElements(selectors: string[], duration: number): Promise<void> {
  const els: HTMLElement[] = [];
  selectors.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => els.push(el));
  });
  if (els.length === 0) return Promise.resolve();

  const originals = els.map((el) => el.textContent || '');
  const start = performance.now();

  return new Promise((resolve) => {
    function frame() {
      const t = Math.min(1, (performance.now() - start) / (duration * 1000));
      for (let i = 0; i < els.length; i++) {
        const orig = originals[i];
        let out = '';
        for (let j = 0; j < orig.length; j++) {
          const c = orig[j];
          if (c === ' ' || c === '\n' || c === '\t') {
            out += c;
          } else if (Math.random() < t * 0.95) {
            out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          } else {
            out += c;
          }
        }
        els[i].textContent = out;
        els[i].style.opacity = String(Math.max(0, 1 - t * 1.1));
      }
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

// ---------------------------------------------------------------------------
// Exit
// ---------------------------------------------------------------------------

export async function runExit(from: Reality, to: Reality): Promise<void> {
  // Glide the page to the top so the transition plays over a predictable
  // layout -- hero centered, nothing mid-scroll when the fade covers.
  await scrollToTop();

  // Kill any lingering lenis scroll-jacking so animations run smoothly
  window.dispatchEvent(new CustomEvent('lenis-stop'));

  const fadeColor = REALITY_BG[to];

  // ---- Phase 1: vanish the current page (0 - 1.5s) ----
  // Sphere disintegrates AND all other content fades to an empty white stage.
  // Nothing else (including the mannequin) lives on screen during this phase.
  const phase1 = gsap.timeline();
  let burstPromise: Promise<void> = Promise.resolve();

  if (from === 'immagine') {
    burstPromise = fireSphereBurst(1700);

    phase1.to('.palette__chip', {
      y: -280,
      rotation: 'random(-45, 45)',
      opacity: 0,
      duration: 0.55,
      stagger: { each: 0.03, from: 'random' },
      ease: 'power2.in',
    }, 0);

    phase1.to('.scatter-item', {
      scale: 0.7,
      opacity: 0,
      duration: 0.5,
      stagger: { each: 0.025, from: 'random' },
      ease: 'power2.in',
    }, 0);

    phase1.to('.ann', {
      opacity: 0,
      y: -10,
      duration: 0.35,
      stagger: 0.02,
      ease: 'power2.in',
    }, 0);

    // The whole collage section fades so the background really is white
    // before the mannequin enters.
    phase1.to('.collage, .hook__name, .hook__role, .sphere-svg', {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
    }, 0);
  }

  if (from === 'sartoria') {
    // Fade ALL sartoria content including the Spline scene. On swap, the
    // whole page DOM is replaced -- the Spline canvas teardown happens as
    // part of that; no special dismissal is needed here.
    phase1.to(
      '.sart-hero__name, .sart-hero__role, .sart-hero__statement, .sart-hero__brief, .sart-hero__meta, .sart-hero__scene, .sart-services, .sart-cta',
      {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power2.in',
      },
      0,
    );
  }

  phase1.to('header, footer', {
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in',
  }, 0);

  // Wait for phase 1 AND the sphere burst to fully finish before the bg
  // tween starts. Phase 1's tweens end ~0.6s; the sphere burst ends ~1.5s.
  // The longer wins.
  await Promise.all([phase1.then(), burstPromise]);

  // ---- Phase 2: whole-page color transition ----
  // Tween the document background uniformly through grey to the destination
  // color. This is what visually sells the shift between realities.
  await gsap.to(document.body, {
    backgroundColor: fadeColor,
    duration: 1.0,
    ease: 'power2.inOut',
  }).then();
}

// ---------------------------------------------------------------------------
// Entrance
// ---------------------------------------------------------------------------

export async function runEntrance(
  current: Reality,
  previous: Reality | null,
): Promise<void> {
  // Hide content BEFORE removing the paint-hold class, otherwise there's a
  // one-frame paint at full opacity.
  const hideSelector =
    current === 'sartoria'
      ? '.sart-hero > *, .sart-services, .sart-cta, header, footer'
      : 'main > *, header, footer';

  gsap.set(hideSelector, { opacity: 0, y: 16 });
  document.documentElement.classList.remove('reality-entering');

  // Sphere recompose: if we arrived back at immagine from sartoria, fire the
  // reverse burst so the sphere visibly reassembles from its scattered state.
  // The sphere script re-runs on SPA nav (data-astro-rerun), so the listener
  // is freshly installed; we fire on the next tick to give it time to bind.
  if (current === 'immagine' && previous === 'sartoria') {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('sphere-recompose'));
    });
  }

  await gsap.to(hideSelector, {
    opacity: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.05,
    ease: 'power2.out',
  }).then();

  window.dispatchEvent(new CustomEvent('lenis-start'));
}
