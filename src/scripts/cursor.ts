/**
 * Custom cursor -- dot (exact follow) + circle (lerp follow)
 * States: default, hover (interactive elements), link (arrows)
 * Hidden on touch devices via CSS @media (pointer: coarse)
 */

export async function initCursor() {
  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const { gsap } = await import('gsap');

  const dot = document.querySelector('.cursor-dot') as HTMLElement;
  const circle = document.querySelector('.cursor-circle') as HTMLElement;
  if (!dot || !circle) return;

  // quickTo for the circle (lerped follow)
  const xTo = gsap.quickTo(circle, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(circle, 'y', { duration: 0.5, ease: 'power3' });

  // Dot follows exactly via gsap.set (no lerp)
  window.addEventListener('mousemove', (e) => {
    gsap.set(dot, { x: e.clientX, y: e.clientY });
    xTo(e.clientX);
    yTo(e.clientY);
  });

  // Scroll velocity compression on circle
  let scrollVelocity = 0;
  window.addEventListener('lenis-scroll', ((e: CustomEvent) => {
    scrollVelocity = Math.abs(e.detail.velocity || 0);
  }) as EventListener);

  gsap.ticker.add(() => {
    const compression = 1 - Math.min(scrollVelocity / 20, 0.3);
    gsap.set(circle, { scaleY: compression });
    scrollVelocity *= 0.95; // decay
  });

  // Hover states
  function addHoverListeners() {
    // Interactive elements: buttons, details summaries
    document.querySelectorAll('button, summary, [data-cursor="grow"]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('cursor-dot--hover');
        circle.classList.add('cursor-circle--hover');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('cursor-dot--hover');
        circle.classList.remove('cursor-circle--hover');
      });
    });

    // Links
    document.querySelectorAll('a').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        circle.classList.add('cursor-circle--hover');
      });
      el.addEventListener('mouseleave', () => {
        circle.classList.remove('cursor-circle--hover');
      });
    });
  }

  addHoverListeners();

  // Re-attach after reality switch (DOM may update)
  window.addEventListener('reality-change', () => {
    setTimeout(addHoverListeners, 100);
  });

  // Hide default cursor
  document.body.style.cursor = 'none';
  document.querySelectorAll('a, button, summary').forEach((el) => {
    (el as HTMLElement).style.cursor = 'none';
  });
}
