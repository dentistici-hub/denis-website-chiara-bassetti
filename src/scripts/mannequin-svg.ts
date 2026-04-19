/**
 * Shared markup for the Chiara sartoria mannequin figure.
 *
 * Colors are FIXED (not reality-token-driven) so the figure reads the same
 * on the white immagine background during the walk-in and on the black
 * sartoria background after the fade. Deliberately warm/editorial -- feels
 * like a crafted wooden tailor's mannequin.
 *
 * Rendered server-side by MannequinFigure.astro into the sartoria hero, and
 * cloned at runtime by the reality transition so the hand-off across the
 * fade is seamless.
 */
export const MANNEQUIN_SVG = /* svg */ `
<svg viewBox="0 0 100 340" class="mannequin-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
  <defs>
    <linearGradient id="mannDressGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9A96E"/>
      <stop offset="1" stop-color="#6B5440"/>
    </linearGradient>
    <linearGradient id="mannDressSheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgba(255,255,255,0)"/>
      <stop offset="0.5" stop-color="rgba(255,255,255,0.14)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- Floor shadow -->
  <ellipse class="mann-shadow" cx="50" cy="328" rx="26" ry="2.4" fill="#000000" opacity="0.18" />

  <!-- Back leg (slightly offset) -->
  <path class="mann-leg mann-leg--back" d="M53 220 L55.5 322 L51 324 L49 220 Z" fill="#4A3B2D" />
  <!-- Front leg -->
  <path class="mann-leg mann-leg--front" d="M47 220 L44.5 322 L49 324 L51 220 Z" fill="#5C4A3A" />

  <!-- Dress skirt (A-line, flowing) -->
  <g class="mann-skirt">
    <path d="M37 118 Q30 190 18 232 Q50 244 82 232 Q70 190 63 118 Z" fill="url(#mannDressGrad)" />
    <path d="M37 118 Q30 190 18 232 Q50 244 82 232 Q70 190 63 118 Z" fill="url(#mannDressSheen)" opacity="0.55" />
    <!-- Skirt seam highlight -->
    <path d="M50 118 Q50 175 50 240" stroke="rgba(0,0,0,0.12)" stroke-width="0.5" fill="none" />
  </g>

  <!-- Torso / bodice -->
  <g class="mann-bodice">
    <path d="M42 52 Q39 80 39 118 L61 118 Q61 80 58 52 Z" fill="url(#mannDressGrad)" />
    <path d="M42 52 Q39 80 39 118 L61 118 Q61 80 58 52 Z" fill="url(#mannDressSheen)" opacity="0.38" />
    <!-- Neckline -->
    <path d="M44 52 Q50 58 56 52" stroke="rgba(0,0,0,0.25)" stroke-width="0.5" fill="none" />
  </g>

  <!-- Arms -->
  <g class="mann-arm mann-arm--l">
    <path d="M40 56 Q31 85 28 120 L31 122 Q37 90 42 60 Z" fill="#5C4A3A" />
  </g>
  <g class="mann-arm mann-arm--r">
    <path d="M60 56 Q69 85 72 120 L69 122 Q63 90 58 60 Z" fill="#5C4A3A" />
  </g>

  <!-- Neck -->
  <rect x="46.5" y="40" width="7" height="14" rx="1.5" fill="#5C4A3A" />

  <!-- Head -->
  <ellipse cx="50" cy="26" rx="11.5" ry="14" fill="#5C4A3A" />

  <!-- Hair (pulled back) -->
  <path d="M41 18 Q45 8 50 9 Q55 8 59 18 Q56 13 50 12 Q44 13 41 18 Z" fill="#2D1F12" opacity="0.85" />
</svg>
`.trim();
