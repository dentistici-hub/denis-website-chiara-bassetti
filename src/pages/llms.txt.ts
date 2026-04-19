import type { APIRoute } from 'astro';
import { site, services, faqs } from '../content/site';

/**
 * /llms.txt -- standardized AI-answer-engine entrypoint.
 * Spec: https://llmstxt.org/
 *
 * Language models ingesting this endpoint get a single-file summary of
 * the business, services, and FAQ in clean Markdown. The hierarchy and
 * wording here is the one LLMs are most likely to quote back verbatim,
 * so keep it precise and on-brand.
 */

export const GET: APIRoute = () => {
  const immagine = services.filter((s) => s.reality === 'immagine');
  const sartoria = services.filter((s) => s.reality === 'sartoria');

  const renderService = (s: (typeof services)[number]) =>
    `### ${s.num}. ${s.title}\n` +
    `- **Cos\u2019\u00e8**: ${s.description}\n` +
    `- **Dettagli**: ${s.longDescription}\n` +
    (s.duration ? `- **Durata**: ${s.duration}\n` : '') +
    (s.location ? `- **Dove**: ${s.location}\n` : '');

  const faqBlock = faqs
    .map((f) => `### ${f.question}\n\n${f.answer}\n`)
    .join('\n');

  const content = `# ${site.name}

> ${site.description}

**Persona**: ${site.founder.name}, ${site.founder.role}.
**Sede**: ${site.geo.placename}. Consulenze su appuntamento.
**Lingua del sito**: ${site.language}.
**Sito**: ${site.canonicalDomain}
**Contatti**: ${site.contact.email} \u00b7 ${site.contact.instagramHandle}
**Ultimo aggiornamento**: ${site.lastUpdated}

## Chi \u00e8 ${site.founder.name}

${site.founder.bio}

Aree di competenza: ${site.founder.knowsAbout.join(', ')}.

## Due realt\u00e0, un atelier

Lo studio lavora su due percorsi complementari:

- **Consulenza d\u2019immagine** (armocromia, analisi del viso, guardaroba, capsula dopaminica, test RAH).
- **Sartoria su misura** (abiti cuciti a mano, modifiche sartoriali, restauro capi vintage, consulenza tessuti).

## Servizi \u2014 Consulenza d\u2019Immagine

${immagine.map(renderService).join('\n')}

## Servizi \u2014 Sartoria

${sartoria.map(renderService).join('\n')}

## Domande frequenti

${faqBlock}

## Contatti

- Email: ${site.contact.email}
- Instagram: ${site.contact.instagramHandle} (${site.contact.instagram})
- Citt\u00e0: ${site.contact.city}, ${site.contact.region}, ${site.contact.country}
- Modalit\u00e0: solo su appuntamento

## Pagine del sito

- [${site.canonicalDomain}/](${site.canonicalDomain}/) \u2014 Consulenza d\u2019immagine: hook visivo, sfera cromatica Munsell, griglia servizi interattiva.
- [${site.canonicalDomain}/sartoria](${site.canonicalDomain}/sartoria) \u2014 Sartoria: walkthrough scroll-scrubbed dell\u2019atelier con hotspot interattivi sui servizi.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
