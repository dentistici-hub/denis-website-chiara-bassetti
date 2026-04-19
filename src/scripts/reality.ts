/**
 * Reality router.
 *
 * Two realities, two routes:
 *   immagine -> /
 *   sartoria -> /sartoria/
 *
 * Navigation is SPA-style via Astro's ClientRouter so the persistent
 * mannequin in BaseLayout survives the page swap. No hard reload, no flicker.
 *
 * Flow:
 *   1. User clicks toggle (fires 'toggle-reality' event on window)
 *   2. runExit(current, next) plays the exit choreography
 *   3. navigate(REALITY_URLS[next]) swaps the DOM but preserves the mannequin
 *   4. 'astro:page-load' fires; initReality sees we just navigated and runs
 *      the entrance choreography
 */

import { navigate } from 'astro:transitions/client';
import { runExit, runEntrance } from './transition';

const REALITIES = ['immagine', 'sartoria'] as const;
type Reality = typeof REALITIES[number];

// Astro injects `base` into BASE_URL (trailing-slash normalized). At root
// deploy this is '/', at subpath deploy it's '/denis-website-chiara-bassetti/'.
// Either way, concatenating 'sartoria/' gives the right URL.
const BASE = import.meta.env.BASE_URL;

const REALITY_URLS: Record<Reality, string> = {
  immagine: BASE,
  sartoria: BASE + 'sartoria/',
};

// Module state persists across SPA navigations because the script tag is
// executed once and the module's closure outlives the DOM swap.
let current: Reality = 'immagine';
let previous: Reality | null = null;
let transitioning = false;
let toggleBound = false;
let isFirstPageLoad = true;

async function handleToggle(): Promise<void> {
  if (transitioning) return;
  transitioning = true;
  const next: Reality = current === 'immagine' ? 'sartoria' : 'immagine';
  // Record where we came from so the entrance on the new page knows whether
  // to fire the sphere-recompose / mannequin-hide logic.
  previous = current;
  try {
    await runExit(current, next);
    await navigate(REALITY_URLS[next]);
  } finally {
    transitioning = false;
  }
}

function paintToggleState(reality: Reality): void {
  const btn = document.getElementById('reality-toggle');
  if (!btn) return;
  btn.querySelectorAll<HTMLElement>('.reality-toggle__opt').forEach((opt) => {
    opt.classList.toggle('is-active', opt.dataset.opt === reality);
  });
}

export async function initReality(): Promise<void> {
  current = document.documentElement.classList.contains('sartoria')
    ? 'sartoria'
    : 'immagine';

  // Tell downstream listeners (sphere, fog, etc.) the current reality.
  window.dispatchEvent(
    new CustomEvent('reality-change', { detail: { reality: current } }),
  );

  // Repaint the toggle's active state on every page-load (fresh DOM after
  // each SPA swap).
  paintToggleState(current);

  // Install delegated listeners ONCE on `document` so they survive the
  // ClientRouter's DOM swap without needing to re-bind per navigation.
  if (!toggleBound) {
    toggleBound = true;
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#reality-toggle')) {
        handleToggle();
      }
    });
  }

  // If this is a subsequent page-load (i.e. we arrived here via navigate),
  // play the entrance. On the very first load, no entrance.
  if (!isFirstPageLoad) {
    await runEntrance(current, previous);
  }
  isFirstPageLoad = false;
}

export function getCurrentReality(): Reality {
  return current;
}
