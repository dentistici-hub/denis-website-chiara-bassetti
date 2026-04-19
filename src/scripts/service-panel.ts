/**
 * Service panel -- open/close, content rendering, infinite scroll.
 *
 * Usage:
 *   initServicePanel()            -- call once on mount
 *   openServicePanel(service)     -- populate + slide in
 *   closeServicePanel()           -- slide out + clean up
 *   isServicePanelOpen()          -- boolean guard
 */

import type { ServiceData, ContentBlock } from './service-data';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _open = false;
let _cleanupScroll: (() => void) | null = null;

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

// ---------------------------------------------------------------------------
// Content rendering
// ---------------------------------------------------------------------------

function buildBlockHTML(block: ContentBlock, color: string): string {
  switch (block.type) {
    case 'media': {
      const ratio = block.ratio ?? '16/10';
      const [w, h] = ratio.split('/').map(Number);
      const pb = h && w ? `${(h / w) * 100}%` : '62.5%';
      const imgHtml = block.src
        ? `<img src="${block.src}" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
        : '';
      return `
    <div class="svc-block--media" style="padding-bottom:${pb}; position:relative; overflow:hidden;">
      ${imgHtml}
    </div>`;
    }

    case 'text': {
      const titleHtml = block.title
        ? `<p class="svc-block__section-title">${block.title}</p>`
        : '';
      const bodyHtml = block.body
        ? `<p class="svc-block__body">${block.body}</p>`
        : '';
      return `<div class="svc-block--text">${titleHtml}${bodyHtml}</div>`;
    }

    case 'list': {
      const labelHtml = block.label
        ? `<p class="svc-block__list-label">${block.label}</p>`
        : '';
      const items = (block.items ?? [])
        .map((item) => `<li>${item}</li>`)
        .join('');
      return `<div class="svc-block--list">${labelHtml}<ul>${items}</ul></div>`;
    }

    case 'caption': {
      return `<div class="svc-block--caption"><p>${block.text ?? ''}</p></div>`;
    }

    case 'divider': {
      return `<div class="svc-block--divider"></div>`;
    }

    default:
      return '';
  }
}

function buildStreamHTML(service: ServiceData): string {
  return service.blocks
    .map((block) => buildBlockHTML(block, service.color))
    .join('');
}

// ---------------------------------------------------------------------------
// Infinite scroll
// ---------------------------------------------------------------------------

function setupInfiniteScroll(streamEl: HTMLElement): () => void {
  const onScroll = () => {
    const half = streamEl.scrollHeight / 2;
    if (half <= 0) return;
    if (streamEl.scrollTop >= half) {
      streamEl.scrollTop -= half;
    }
  };
  streamEl.addEventListener('scroll', onScroll, { passive: true });
  return () => streamEl.removeEventListener('scroll', onScroll);
}

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

export async function openServicePanel(service: ServiceData): Promise<void> {
  const panel    = el('svc-panel');
  const overlay  = el('svc-panel-overlay');
  const infoEl   = el('svc-panel-info');
  const numEl    = el('svc-panel-num');
  const titleEl  = el('svc-panel-title');
  const descEl   = el('svc-panel-desc');
  const credEl   = el('svc-panel-credits');
  const streamEl = el('svc-panel-stream');
  const contentEl = el('svc-panel-stream-content');

  if (!panel) return;

  // --- Populate info strip ---
  numEl.textContent  = `${service.num}.`;
  titleEl.textContent = service.title;
  descEl.textContent  = service.desc;
  credEl.textContent  = service.credits;

  // Apply service color as CSS variable
  infoEl.style.setProperty('--svc-color', service.color);
  contentEl.style.setProperty('--svc-color', service.color);

  // --- Build stream: duplicate for infinite scroll ---
  const singlePass = buildStreamHTML(service);
  contentEl.innerHTML = singlePass + singlePass;

  // Reset scroll position
  streamEl.scrollTop = 0;

  // Clean up previous scroll listener if any
  if (_cleanupScroll) {
    _cleanupScroll();
    _cleanupScroll = null;
  }

  _cleanupScroll = setupInfiniteScroll(streamEl);

  // --- Animate in ---
  const { gsap } = await import('gsap');

  // Ensure visible for animation start
  panel.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');

  gsap.fromTo(
    panel,
    { x: '100%' },
    {
      x: '0%',
      duration: 0.55,
      ease: 'power4.out',
      onStart: () => {
        panel.classList.add('open');
      },
    }
  );

  _open = true;

  // Stop Lenis smooth scroll and lock body
  window.dispatchEvent(new Event('lenis-stop'));
  document.body.style.overflow = 'hidden';
}

export async function closeServicePanel(): Promise<void> {
  if (!_open) return;

  const panel   = el('svc-panel');
  const overlay = el('svc-panel-overlay');

  if (!panel) return;

  const { gsap } = await import('gsap');

  overlay.classList.remove('open');

  await gsap.to(panel, {
    x: '100%',
    duration: 0.45,
    ease: 'power3.in',
  });

  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');

  // Clean up infinite scroll
  if (_cleanupScroll) {
    _cleanupScroll();
    _cleanupScroll = null;
  }

  _open = false;
  document.body.style.overflow = '';

  // Restart Lenis smooth scroll
  window.dispatchEvent(new Event('lenis-start'));
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function initServicePanel(): void {
  const closeBtn = el('svc-panel-close');
  const overlay  = el('svc-panel-overlay');
  const panel    = el('svc-panel');

  if (!panel) return;

  // X button
  closeBtn?.addEventListener('click', () => {
    closeServicePanel();
  });

  // Overlay click
  overlay?.addEventListener('click', () => {
    closeServicePanel();
  });

  // Escape key
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && _open) {
      closeServicePanel();
    }
  });

  // Prevent wheel events from leaking through panel to page
  panel.addEventListener('wheel', (e: WheelEvent) => {
    e.stopPropagation();
  }, { passive: false });

  overlay?.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
}

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

export function isServicePanelOpen(): boolean {
  return _open;
}
