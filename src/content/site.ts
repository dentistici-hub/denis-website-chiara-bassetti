/**
 * Single source of truth for Chiara Bassetti Studio -- identity, services,
 * FAQ. Consumed by SchemaLayer (JSON-LD), llms.txt, <meta> tags, and any
 * human-readable block that wants the canonical copy.
 *
 * Keep this file Italian (the site is Italian), concise, and up-to-date.
 * When you change a service here, it propagates to AI search + Google +
 * social card previews without touching the HTML.
 */

export const site = {
  name: 'Chiara Bassetti Studio',
  legalName: 'Chiara Bassetti',
  role: 'Image Consultant & Makedresser',
  tagline: 'Consulenza d\'immagine e sartoria su misura a Torino.',
  description:
    'Chiara Bassetti Studio: consulenza d\'immagine personalizzata (armocromia, analisi del viso, guardaroba, capsula dopaminica) e sartoria su misura (abiti cuciti a mano, modifiche sartoriali, restauro di capi vintage). Atelier a Torino, su appuntamento.',
  shortDescription:
    'Consulenza d\'immagine e sartoria su misura a Torino. Chiara Bassetti -- Image Consultant & Makedresser.',
  url: 'https://dentistici-hub.github.io/denis-website-chiara-bassetti',
  canonicalDomain: 'https://chiarabassetti.studio',
  language: 'it',
  locale: 'it_IT',
  lastUpdated: '2026-04-19',
  founded: '2023',

  founder: {
    name: 'Chiara Bassetti',
    role: 'Image Consultant & Makedresser',
    bio:
      'Chiara Bassetti è image consultant e sarta formata in Italia. Unisce analisi cromatica scientifica (armocromia + metodo RAH) alla tecnica sartoriale tradizionale per costruire guardaroba consapevoli e abiti su misura che durano nel tempo.',
    knowsAbout: [
      'Armocromia',
      'Metodo RAH Color Test',
      'Analisi del viso',
      'Consulenza guardaroba',
      'Sartoria su misura',
      'Modifiche sartoriali',
      'Restauro capi vintage',
      'Consulenza tessuti',
    ],
    sameAs: ['https://www.instagram.com/chiarabassetti.studio/'],
  },

  contact: {
    email: 'hello@chiarabassetti.studio',
    instagram: 'https://www.instagram.com/chiarabassetti.studio/',
    instagramHandle: '@chiarabassetti.studio',
    city: 'Torino',
    region: 'Piemonte',
    country: 'IT',
    address: '',
    appointmentOnly: true,
  },

  geo: {
    placename: 'Torino, Italia',
    region: 'IT-21',
    position: '45.0703;7.6869',
  },
} as const;

export interface SiteService {
  id: string;
  reality: 'immagine' | 'sartoria';
  num: string;
  title: string;
  description: string;
  longDescription: string;
  duration?: string;
  location?: string;
}

export const services: SiteService[] = [
  {
    id: 'identita-cromatica',
    reality: 'immagine',
    num: '01',
    title: 'Identità Cromatica',
    description:
      'Percorso individuale di analisi cromatica per identificare la stagione che ti appartiene e costruire una palette colore personalizzata.',
    longDescription:
      'Dall\'analisi di carnagione, occhi e capelli alla definizione della stagione cromatica personale. Il percorso si conclude con una palette digitale e una guida agli abbinamenti, ai tessuti e ai materiali consigliati.',
    duration: '~2 ore',
    location: 'Atelier Torino',
  },
  {
    id: 'test-armocromia',
    reality: 'immagine',
    num: '02',
    title: 'Test Armocromia',
    description:
      'Test RAH + armocromia classica: dodici sottotipi cromatici con criteri oggettivi e misurabili per una diagnosi colore completa.',
    longDescription:
      'Il metodo RAH supera i limiti dell\'armocromia tradizionale classificando in dodici sottotipi invece di quattro. Luce naturale controllata, drappeggi certificati, nessuna interpretazione soggettiva. La diagnosi è definitiva.',
    duration: '~1,5 ore',
    location: 'Atelier Torino',
  },
  {
    id: 'capsula-dopaminica',
    reality: 'immagine',
    num: '03',
    title: 'Capsula Dopaminica',
    description:
      'Un guardaroba capsula costruito su palette e stile personali -- capi che ti fanno sentire bene, che funzionano insieme.',
    longDescription:
      'Non è un guardaroba minimalista: è un insieme curato di capi base e pezzi carattere selezionati sulla tua palette cromatica, sulle occasioni della tua vita e sul tuo stile. Mappa degli abbinamenti e lista d\'acquisto consapevole inclusa.',
    duration: '~1,5 ore',
    location: 'Atelier Torino',
  },
  {
    id: 'consulenza-viso',
    reality: 'immagine',
    num: '04',
    title: 'Consulenza Viso',
    description:
      'Analisi morfologica del viso, lettura dell\'energia e indicazioni pratiche su scollature, acconciature e make-up.',
    longDescription:
      'La forma del viso è il punto di partenza, non il punto di arrivo. Analisi delle proporzioni, lettura dell\'energia espressiva (angolare, morbida, asimmetrica) e indicazioni su scollature, colletti, accessori, acconciature e trucco.',
    duration: '~1 ora',
    location: 'Atelier Torino',
  },
  {
    id: 'guardaroba',
    reality: 'immagine',
    num: '05',
    title: 'Guardaroba',
    description:
      'Revisione completa del guardaroba a domicilio: decluttering, nuovi abbinamenti, strategia d\'acquisto.',
    longDescription:
      'Consulenza a domicilio nel tuo spazio. Apriamo l\'armadio insieme, decidiamo cosa tieni e cosa liberi, scopriamo nuovi abbinamenti tra capi che già hai, costruiamo una lista d\'acquisto mirata per colmare le lacune.',
    duration: '~2,5 ore',
    location: 'A domicilio',
  },
  {
    id: 'rah-color-test',
    reality: 'immagine',
    num: '06',
    title: 'RAH Color Test',
    description:
      'Diagnosi cromatica avanzata con il metodo RAH. Il test più preciso per identificare la palette ideale.',
    longDescription:
      'Classificazione completa secondo il metodo RAH a dodici categorie. Analisi di sottotonie, saturazione e contrasto personale. Palette digitale indicando i colori ideali per categoria d\'uso. Confronto con l\'armocromia classica.',
    duration: '~1 ora',
    location: 'Atelier Torino',
  },
  {
    id: 'abito-su-misura',
    reality: 'sartoria',
    num: '01',
    title: 'Abito Su Misura',
    description:
      'Abito cucito a mano con tecnica sartoriale italiana -- cartamodello costruito da zero, tessuti selezionati, minimo due prove.',
    longDescription:
      'Consulenza iniziale, presa misure completa, cartamodello personale, selezione tessuti con campionario in atelier, due o più prove intermedie, consegna con adattamenti finali. Nessun adattamento da taglia standard: tutto parte dal tuo corpo.',
    duration: '3-6 settimane',
    location: 'Atelier Torino',
  },
  {
    id: 'modifiche-sartoriali',
    reality: 'sartoria',
    num: '02',
    title: 'Modifiche Sartoriali',
    description:
      'Restringimenti, orli, adattamenti di spalle e busti su capi esistenti con precisione millimetrica.',
    longDescription:
      'Interventi su giacche, pantaloni, gonne, abiti e capi vintage. Restringimenti e allargamenti, accorciamento di orli e maniche, adattamento spalle e schiena, modifiche di scolli e chiusure. Tempi 1-2 settimane.',
    duration: '1-2 settimane',
    location: 'Atelier Torino',
  },
  {
    id: 'consulenza-tessuti',
    reality: 'sartoria',
    num: '03',
    title: 'Consulenza Tessuti',
    description:
      'Sessione pratica di riconoscimento tessuti: distinguere fibre, valutare qualità, leggere etichette.',
    longDescription:
      'Ri-educazione del tatto e dell\'occhio. Distinzione fra fibre naturali e sintetiche, qualità di tessitura e finitura, comportamento del tessuto sul corpo e nel tempo. Oltre 80 campioni fisici in atelier. Tessuti italiani e francesi con selezione stagionale.',
    duration: '~1,5 ore',
    location: 'Atelier Torino',
  },
  {
    id: 'restauro-capi',
    reality: 'sartoria',
    num: '04',
    title: 'Restauro Capi',
    description:
      'Restauro tessile di capi vintage, storici o ereditati -- cuciture, fodere, rammendo invisibile, sostituzione chiusure.',
    longDescription:
      'Il cappotto della nonna, il vestito da sposa ritrovato, la giacca con valore affettivo. Sostituzione bottoni e cerniere, rammendo invisibile su lana e seta, restauro fodere, reinterpretazione creativa di capi vintage in silhouette contemporanee.',
    duration: '2-4 settimane',
    location: 'Atelier Torino',
  },
];

export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: 'Dove si trova l\'atelier di Chiara Bassetti?',
    answer:
      'L\'atelier si trova a Torino, in Piemonte. Tutte le consulenze e le prove sartoriali avvengono esclusivamente su appuntamento.',
  },
  {
    question: 'Che cos\'è l\'armocromia e in cosa si differenzia dal metodo RAH?',
    answer:
      'L\'armocromia classica classifica in quattro stagioni (primavera, estate, autunno, inverno). Il metodo RAH affina il sistema in dodici sottotipi, aggiungendo criteri misurabili di sottotonie, saturazione e contrasto personale. La diagnosi RAH è più precisa e riproducibile, indipendente dall\'interpretazione dell\'operatore.',
  },
  {
    question: 'Quanto dura un percorso di abito su misura?',
    answer:
      'Il processo richiede tipicamente 3-6 settimane dalla consulenza iniziale alla consegna. Include la costruzione del cartamodello personale da zero, la selezione dei tessuti con campionario, e almeno due prove intermedie di rifinitura.',
  },
  {
    question: 'È possibile portare un tessuto proprio per un abito su misura?',
    answer:
      'Sì. Su richiesta è possibile lavorare un tessuto fornito dal cliente, soprattutto quando ha un significato personale. La scelta del tessuto è parte integrante del processo creativo.',
  },
  {
    question: 'Accettate capi vintage o con valore affettivo per modifiche e restauro?',
    answer:
      'Sì. Il restauro tessile e le modifiche su capi vintage o di particolare valore affettivo sono una parte importante del lavoro dell\'atelier. Ogni restauro inizia con una diagnosi del tessuto e un piano di intervento.',
  },
  {
    question: 'Come si prenota una consulenza?',
    answer:
      `Scrivendo a ${site.contact.email} o via Instagram (${site.contact.instagramHandle}). Tutte le consulenze sono su appuntamento, sia nell\'atelier di Torino sia a domicilio.`,
  },
];

export type SiteData = typeof site;
