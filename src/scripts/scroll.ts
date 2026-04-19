/**
 * Scroll system -- Lenis smooth scroll + GSAP ScrollTrigger + SplitText
 *
 * DESIGN RULE: Never use the same reveal twice in a row.
 * Each section gets a unique entrance choreography.
 */

export async function initScroll() {
  const { default: Lenis } = await import('lenis');
  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  const { SplitText } = await import('gsap/SplitText');
  const { DrawSVGPlugin } = await import('gsap/DrawSVGPlugin');

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  // Wait for fonts before splitting text
  await document.fonts.ready;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });

  // Connect Lenis to GSAP ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time: number) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ============================================
  // SCROLL PROGRESS BAR
  // ============================================
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    gsap.to(progressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  // ============================================
  // GENERIC REVEALS -- [data-reveal] elements
  // Varied based on data-reveal value
  // ============================================
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const type = (el as HTMLElement).dataset.reveal || 'fade-up';
    const delay = parseFloat((el as HTMLElement).dataset.revealDelay || '0');

    let fromVars: gsap.TweenVars = { opacity: 0, y: 40 };
    let toVars: gsap.TweenVars = { opacity: 1, y: 0 };

    switch (type) {
      case 'fade-up':
        fromVars = { opacity: 0, y: 50 };
        toVars = { opacity: 1, y: 0 };
        break;
      case 'fade-left':
        fromVars = { opacity: 0, x: -60 };
        toVars = { opacity: 1, x: 0 };
        break;
      case 'fade-right':
        fromVars = { opacity: 0, x: 60 };
        toVars = { opacity: 1, x: 0 };
        break;
      case 'fade':
        fromVars = { opacity: 0 };
        toVars = { opacity: 1 };
        break;
      case 'scale':
        fromVars = { opacity: 0, scale: 0.9 };
        toVars = { opacity: 1, scale: 1 };
        break;
    }

    gsap.fromTo(el, fromVars, {
      ...toVars,
      duration: 1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // ============================================
  // SPLIT TEXT HEADINGS -- [data-split-heading]
  // Each gets a unique animation based on its value
  // ============================================
  document.querySelectorAll('[data-split-heading]').forEach((el) => {
    const style = (el as HTMLElement).dataset.splitHeading || 'chars-rise';

    switch (style) {
      case 'chars-rise': {
        const split = new SplitText(el, { type: 'chars', charsClass: 'char' });
        gsap.fromTo(split.chars,
          { opacity: 0, y: '100%', rotateX: -40 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 1, stagger: 0.03, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
      case 'chars-cascade': {
        const split = new SplitText(el, { type: 'chars', charsClass: 'char' });
        gsap.fromTo(split.chars,
          { opacity: 0, y: 30, scale: 0.8 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, stagger: 0.025, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
      case 'words-slide': {
        const split = new SplitText(el, { type: 'words', wordsClass: 'word' });
        gsap.fromTo(split.words,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0,
            duration: 0.9, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
      case 'words-fade': {
        const split = new SplitText(el, { type: 'words', wordsClass: 'word' });
        gsap.fromTo(split.words,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.7, stagger: 0.04, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
      case 'clip-up': {
        // No split -- clip-path reveal on the whole element
        gsap.set(el, { opacity: 1 }); // override the default hidden state
        gsap.fromTo(el,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.2, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
      case 'typewriter': {
        const split = new SplitText(el, { type: 'chars', charsClass: 'char' });
        gsap.fromTo(split.chars,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.05, stagger: 0.05, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );
        break;
      }
    }
  });

  // ============================================
  // CLIP REVEALS -- [data-clip-reveal]
  // Images/blocks that unclip from a direction
  // ============================================
  document.querySelectorAll('[data-clip-reveal]').forEach((el) => {
    const dir = (el as HTMLElement).dataset.clipReveal || 'bottom';
    let from = 'inset(100% 0 0 0)';
    if (dir === 'top') from = 'inset(0 0 100% 0)';
    if (dir === 'left') from = 'inset(0 100% 0 0)';
    if (dir === 'right') from = 'inset(0 0 0 100%)';
    if (dir === 'center') from = 'inset(50% 50% 50% 50%)';

    gsap.fromTo(el,
      { clipPath: from },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }
    );
  });

  // ============================================
  // SCALE REVEALS -- [data-scale-reveal]
  // Images that scale from 1.1 to 1.0
  // ============================================
  document.querySelectorAll('[data-scale-reveal]').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 1.1 },
      {
        opacity: 1, scale: 1,
        duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });

  // ============================================
  // LINE DRAWS -- [data-line-draw]
  // Decorative lines that draw themselves
  // ============================================
  document.querySelectorAll('[data-line-draw]').forEach((el) => {
    gsap.to(el, {
      scaleX: 1,
      duration: 1,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // ============================================
  // PARALLAX -- [data-parallax]
  // ============================================
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat((el as HTMLElement).dataset.parallax || '0.2');
    gsap.to(el, {
      y: () => speed * ScrollTrigger.maxScroll(window) * -0.05,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // ============================================
  // STAGGER GROUPS -- [data-stagger-group]
  // Children animate in with stagger
  // ============================================
  document.querySelectorAll('[data-stagger-group]').forEach((group) => {
    const direction = (group as HTMLElement).dataset.staggerGroup || 'up';
    const children = (group as HTMLElement).children;
    if (!children.length) return;

    let fromVars: gsap.TweenVars = { opacity: 0, y: 50 };
    if (direction === 'alternate') {
      // Odd from left, even from right
      Array.from(children).forEach((child, i) => {
        const fromX = i % 2 === 0 ? -60 : 60;
        gsap.fromTo(child,
          { opacity: 0, x: fromX },
          {
            opacity: 1, x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: child,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
      return;
    }

    if (direction === 'scale') {
      fromVars = { opacity: 0, scale: 0.9, y: 30 };
    }

    gsap.fromTo(children, fromVars, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 80%',
        once: true,
      },
    });
  });

  // ============================================
  // COUNTER ANIMATION -- [data-counter]
  // ============================================
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = (el as HTMLElement).dataset.counter || el.textContent || '';
    gsap.to(el, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          let frame = 0;
          const chars = target.split('');
          const randomChars = '0123456789';
          const interval = setInterval(() => {
            frame++;
            el.textContent = chars.map((c, i) => {
              if (i < frame) return c;
              return /\d/.test(c) ? randomChars[Math.floor(Math.random() * randomChars.length)] : c;
            }).join('');
            if (frame >= chars.length) clearInterval(interval);
          }, 60);
        },
      },
    });
  });

  // ============================================
  // SCRUB TEXT -- paragraphs that reveal on scroll
  // [data-scrub-text] on parent, children <p> scrub opacity
  // ============================================
  document.querySelectorAll('[data-scrub-text]').forEach((container) => {
    const paragraphs = container.querySelectorAll('p');
    paragraphs.forEach((p, i) => {
      gsap.fromTo(p,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: p,
            start: 'top 75%',
            end: 'top 35%',
            scrub: true,
          },
        }
      );
    });
  });

  // ============================================
  // DRAW ON SCROLL -- [data-draw-on-scroll] SVGs
  // ============================================
  document.querySelectorAll('[data-draw-on-scroll]').forEach((svg) => {
    const paths = svg.querySelectorAll('path');
    paths.forEach((path) => {
      gsap.fromTo(path,
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: svg,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 1,
          },
        }
      );
    });
  });

  // ============================================
  // BATCH REVEALS for scattered collage items
  // ============================================
  ScrollTrigger.batch('.portfolio-item', {
    onEnter: (elements) => {
      gsap.fromTo(elements,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.8, ease: 'power2.out' }
      );
    },
    start: 'top 90%',
  });

  // ============================================
  // PAUSE LENIS DURING REALITY TRANSITIONS
  // ============================================
  window.addEventListener('toggle-reality', () => {
    lenis.stop();
    setTimeout(() => lenis.start(), 1500);
  });

  return lenis;
}
