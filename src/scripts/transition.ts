/**
 * transition.ts
 *
 * Reality transition between the two pages, orchestrated around an Astro
 * ClientRouter SPA navigation. The mannequin lives in BaseLayout as a
 * `transition:persist` element, so her DOM survives the page swap -- no
 * flicker across the navigation.
 *
 * Flow:
 *   runExit(from, to)   -- sphere burst, content fade, walk mannequin in,
 *                          tween body bg to destination color. No teardown.
 *   navigate(url)       -- Astro swaps <main>/<header>/<footer>; mannequin
 *                          element persists across the swap.
 *   runEntrance(cur)    -- fade the new content back in around her.
 */

import { gsap } from 'gsap';

type Reality = 'immagine' | 'sartoria';

const REALITY_BG: Record<Reality, string> = {
  immagine: '#FAF8F5',
  sartoria: '#0A0A0A',
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

// ---------------------------------------------------------------------------
// Persistent mannequin -- single element in BaseLayout, animated in/out
// around the SPA navigation. She never teardowns, so the swap is invisible.
// ---------------------------------------------------------------------------

function getMannequin(): HTMLElement | null {
  return document.querySelector('.persistent-mannequin');
}

async function runMannequinWalkIn(): Promise<void> {
  const mannequin = getMannequin();
  if (!mannequin) return;

  const vw = window.innerWidth;
  const startX = -(vw * 0.75);

  // xPercent: -50 gives the center anchor. x is the walk offset.
  gsap.set(mannequin, { xPercent: -50, x: startX, opacity: 0 });

  const tl = gsap.timeline();
  tl.to(mannequin, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0);
  tl.to(mannequin, { x: 0, duration: 1.5, ease: 'power2.out' }, 0);

  await tl.then();

  // At rest, hand positioning back to CSS so the inline `matrix(...)` GSAP
  // leaves behind doesn't sub-pixel-drift against the stylesheet's
  // `translate3d(-50%, 0, 0)` after the SPA swap.
  mannequin.style.transform = '';
  mannequin.style.opacity = '';
}

// Reverse direction: she's already at the center on sartoria; walk her off
// to the right and fade. Called when the user clicks back to immagine.
async function runMannequinWalkOut(): Promise<void> {
  const mannequin = getMannequin();
  if (!mannequin) return;

  const vw = window.innerWidth;
  const endX = vw * 0.8;

  // She arrives here at x:0 (her resting center). Make sure xPercent is
  // correct in case any stale inline transform is lingering.
  gsap.set(mannequin, { xPercent: -50 });

  const tl = gsap.timeline();
  tl.to(mannequin, { x: endX, duration: 1.5, ease: 'power2.in' }, 0);
  tl.to(mannequin, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 1.1);

  await tl.then();

  // Snap back to center + hand positioning to CSS so she enters the SPA
  // swap with zero inline transform drift.
  gsap.set(mannequin, { x: 0, xPercent: -50 });
  mannequin.style.transform = '';
  mannequin.style.opacity = '';
}

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
    // Fade sartoria text/content. The mannequin is NOT in the selector --
    // she's persistent and walks off separately in phase 2.
    phase1.to(
      '.sart-hero__name, .sart-hero__role, .sart-hero__statement, .sart-hero__brief, .sart-hero__meta, .sart-services, .sart-cta',
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

  // Wait for phase 1 AND the sphere burst to fully finish before the
  // mannequin is allowed to enter. Phase 1's tweens end ~0.6s; the sphere
  // burst ends ~1.5s. The longer wins.
  await Promise.all([phase1.then(), burstPromise]);

  // ---- Phase 2: mannequin walk ----
  // Immagine -> sartoria: walks IN from off-screen left to center
  // Sartoria -> immagine: walks OUT to off-screen right
  if (from === 'immagine' && to === 'sartoria') {
    await runMannequinWalkIn();
  } else if (from === 'sartoria' && to === 'immagine') {
    await runMannequinWalkOut();
  }

  // ---- Phase 3: whole-page color transition ----
  // Tween the document background uniformly through grey to the destination
  // color. No spatial origin -- the screen just shifts tone, the mannequin
  // stands still in her center anchor on top.
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
