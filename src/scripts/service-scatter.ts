/**
 * service-scatter.ts
 * Renders service items into the scatter grid, manages 3D objects,
 * handles item clicks (open panel), and responds to reality switches.
 */

import { getServices, type ServiceData } from './service-data';
import { createServiceObject, type ObjectResult } from './service-objects';
import { openServicePanel, closeServicePanel, initServicePanel, isServicePanelOpen } from './service-panel';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let activeObjects: ObjectResult[] = [];
let animFrameId: number | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentReality(): 'immagine' | 'sartoria' {
  return document.documentElement.classList.contains('sartoria')
    ? 'sartoria'
    : 'immagine';
}

// ---------------------------------------------------------------------------
// Render items into the scatter grid
// ---------------------------------------------------------------------------

function renderItems(container: HTMLElement, services: ServiceData[]): void {
  // Dispose all existing 3D objects
  activeObjects.forEach((obj) => obj.dispose());
  activeObjects = [];

  // Clear container
  container.innerHTML = '';

  const scatterEl = document.getElementById('svc-scatter');

  services.forEach((service) => {
    // -- Wrapper div --
    const item = document.createElement('div');
    item.className = 'scatter-item';

    // Position from service data
    item.style.top = service.position.top;
    if (service.position.left) {
      item.style.left = service.position.left;
    }
    if (service.position.right) {
      item.style.right = service.position.right;
    }

    // -- Number --
    const numDiv = document.createElement('div');
    numDiv.className = 'scatter-item__num';
    numDiv.textContent = service.num;
    item.appendChild(numDiv);

    // -- Visual: spline embed, image/gif, or 3D canvas --
    if (service.spline) {
      const splineCanvas = document.createElement('canvas');
      splineCanvas.className = 'scatter-item__spline';
      splineCanvas.width = service.position.w * 2;
      splineCanvas.height = service.position.h * 2;
      splineCanvas.style.width = `${service.position.w}px`;
      splineCanvas.style.height = `${service.position.h}px`;
      item.appendChild(splineCanvas);

      // Load Spline scene async
      import('@splinetool/runtime').then(({ Application }) => {
        const app = new Application(splineCanvas);
        app.load(service.spline!).then(() => {
          // Spline loaded successfully
        }).catch((err: any) => {
          console.warn('Spline load failed, falling back', err);
        });
      });
    } else if (service.image) {
      const img = document.createElement('img');
      img.className = 'scatter-item__img';
      img.src = service.image;
      img.alt = service.label;
      img.loading = 'lazy';
      img.style.width = `${service.position.w}px`;
      img.style.height = `${service.position.h}px`;
      item.appendChild(img);
    } else {
      const canvas = document.createElement('canvas');
      canvas.className = 'scatter-item__canvas';
      canvas.width = service.position.w * 2;
      canvas.height = service.position.h * 2;
      canvas.style.width = `${service.position.w}px`;
      canvas.style.height = `${service.position.h}px`;
      item.appendChild(canvas);

      const objResult = createServiceObject(canvas, service.object3d);
      if (objResult) {
        activeObjects.push(objResult);
      }
    }

    // -- Label --
    const labelDiv = document.createElement('div');
    labelDiv.className = 'scatter-item__label';
    labelDiv.textContent = service.label;
    item.appendChild(labelDiv);

    // -- Drag + click handling --
    // mousedown records start coords; mousemove past a small threshold flips
    // to drag mode and adjusts top/left; mouseup either lands the drag or
    // (if movement was below threshold) lets the click fire to open the panel.
    const DRAG_THRESHOLD = 5;
    let itemStartLeft = 0;
    let itemStartTop = 0;
    let startMouseX = 0;
    let startMouseY = 0;
    let isPointerDown = false;
    let hasDragged = false;

    item.addEventListener('pointerdown', (e: PointerEvent) => {
      // Ignore right-click / middle-click
      if (e.button !== 0) return;
      isPointerDown = true;
      hasDragged = false;

      const itemRect = item.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      itemStartLeft = itemRect.left - parentRect.left;
      itemStartTop = itemRect.top - parentRect.top;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      // Pin to absolute px so the percent-based right/left can't fight the drag
      item.style.left = `${itemStartLeft}px`;
      item.style.top = `${itemStartTop}px`;
      item.style.right = 'auto';
      item.style.transition = 'none';
      item.style.transform = 'none'; // suppress :hover scale while dragging
      item.style.cursor = 'grabbing';
      item.style.zIndex = '10';
      try { item.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    });

    item.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      if (!hasDragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        hasDragged = true;
      }
      if (hasDragged) {
        item.style.left = `${itemStartLeft + dx}px`;
        item.style.top = `${itemStartTop + dy}px`;
      }
    });

    const endDrag = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      item.style.transition = '';
      item.style.transform = '';
      item.style.cursor = '';
      item.style.zIndex = '';
      try { item.releasePointerCapture(e.pointerId); } catch {}
    };
    item.addEventListener('pointerup', endDrag);
    item.addEventListener('pointercancel', endDrag);

    // -- Click handler (opens panel) -- skipped if the pointer moved enough
    // to count as a drag. Click fires after pointerup, so we read hasDragged.
    item.addEventListener('click', (e) => {
      if (hasDragged) {
        e.stopImmediatePropagation();
        return;
      }
      if (scatterEl) {
        scatterEl.classList.add('panel-open');
      }
      openServicePanel(service);
    });

    container.appendChild(item);
  });
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------

function animateAll(): void {
  activeObjects.forEach((obj) => obj.animate());
  animFrameId = requestAnimationFrame(animateAll);
}

// ---------------------------------------------------------------------------
// Close panel helper (removes blur from scatter grid)
// ---------------------------------------------------------------------------

function handlePanelClose(): void {
  const scatterEl = document.getElementById('svc-scatter');
  if (scatterEl) {
    scatterEl.classList.remove('panel-open');
  }
  closeServicePanel();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export function initServiceScatter(): void {
  const container = document.getElementById('svc-scatter-items');
  if (!container) return;

  // Initialize the panel (close button, overlay, escape key)
  initServicePanel();

  // Determine current reality and render
  const reality = getCurrentReality();
  const services = getServices(reality);
  renderItems(container, services);
  animateAll();

  // -- Close handlers (scatter-side: remove blur) --

  const closeBtn = document.getElementById('svc-panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', handlePanelClose);
  }

  const overlay = document.getElementById('svc-panel-overlay');
  if (overlay) {
    overlay.addEventListener('click', handlePanelClose);
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isServicePanelOpen()) {
      handlePanelClose();
    }
  });

  // -- Reality change listener --

  document.addEventListener('reality-change', ((e: CustomEvent) => {
    // If panel is open, close it first
    if (isServicePanelOpen()) {
      const scatterEl = document.getElementById('svc-scatter');
      if (scatterEl) {
        scatterEl.classList.remove('panel-open');
      }
      closeServicePanel();
    }

    // Cancel current animation loop
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    // Get new services for new reality
    const newReality = getCurrentReality();
    const newServices = getServices(newReality);

    // Re-render and restart animation
    renderItems(container, newServices);
    animateAll();
  }) as EventListener);
}
