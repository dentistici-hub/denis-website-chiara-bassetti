/**
 * Service data for the interactive services section.
 * Used by both realities: Consulenza d'Immagine and Sartoria.
 *
 * ContentBlock defines the building blocks of each service's detail panel --
 * an infinite-scrolling stream rendered by the panel component.
 *
 * `title` uses \n for line breaks (rendered with white-space: pre-line).
 * `label` is the ALL CAPS version shown on the scatter grid.
 */

export interface ContentBlock {
  type: 'media' | 'text' | 'list' | 'caption' | 'divider';
  label?: string;
  ratio?: string;
  src?: string;
  title?: string;
  body?: string;
  items?: string[];
  text?: string;
}

export interface ServiceData {
  num: string;
  color: string;
  title: string;
  label: string;
  desc: string;
  credits: string;
  object3d: string;
  image?: string;
  spline?: string;
  position: { top: string; left?: string; right?: string; w: number; h: number };
  blocks: ContentBlock[];
}

// ---------------------------------------------------------------------------
// IMMAGINE SERVICES
// ---------------------------------------------------------------------------

export const IMMAGINE_SERVICES: ServiceData[] = [
  {
    num: '01',
    color: '#B8364B',
    title: 'Identità\nCromatica',
    label: 'IDENTITÀ CROMATICA',
    desc: 'Scopri i colori che ti appartengono. Un percorso che intreccia estetica, emozione e la tua vera essenza attraverso l\'analisi cromatica personalizzata.',
    credits: 'Consulenza individuale\nDurata ~2 ore',
    object3d: 'prism',
    position: { top: '8%', left: '14%', w: 120, h: 120 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/identita-cromatica-hero.png',
      },
      {
        type: 'text',
        title: 'Il Percorso',
        body: 'Il colore non è decorazione — <strong>è linguaggio</strong>. Iniziamo dall\'analisi della tua carnagione, occhi e capelli per identificare la stagione cromatica di appartenenza. Non solo una palette, ma un modo di stare al mondo con più presenza e meno sforzo.\n\nOgni tonalità sbagliata sottrae energia al tuo viso. Ogni tonalità giusta <strong>amplifica ciò che sei già</strong>. Il percorso è individuale, calibrato su di te.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/gradient-abstract.png',
      },
      {
        type: 'caption',
        text: 'Analisi effettuata con drappeggi certificati in luce naturale controllata',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Analisi della stagione cromatica personale',
          'Test con drappeggi professionali certificati',
          'Palette colori personalizzata in formato digitale',
          'Guida agli abbinamenti e ai tessuti consigliati',
        ],
      },
      {
        type: 'media',
        ratio: '21/9',
        src: '/images/services/palette-personale.png',
      },
      {
        type: 'divider',
      },
      {
        type: 'text',
        title: 'Per Chi È',
        body: 'Per chi vuole smettere di comprare capi che poi non indossa mai. Per chi si sente spenta o fuori posto nonostante un guardaroba pieno. Per chi cerca <strong>chiarezza invece di regole</strong>.\n\nNon c\'è una stagione migliore delle altre. C\'è la tua stagione, e imparare a riconoscerla cambia tutto.',
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/identita-bubbles.png',
      },
    ],
  },

  {
    num: '02',
    color: '#7A2040',
    title: 'Test\nArmocromia',
    label: 'TEST ARMOCROMIA',
    desc: 'Analisi scientifica della tua palette personale. Il test RAH combinato con l\'armocromia classica per una diagnosi cromatica completa.',
    credits: 'Consulenza individuale\nDurata ~1.5 ore',
    object3d: 'fan-deck',
    spline: 'https://my.spline.design/3dcircularcardscopycopy-p4bTu4URVZkzemQ7J3QGApQx-qQf/',
    position: { top: '2%', left: '40%', w: 200, h: 200 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/rah-test.png',
      },
      {
        type: 'text',
        title: 'Il Metodo',
        body: 'L\'armocromia classica divide in quattro stagioni. Il metodo RAH affina ulteriormente, identificando <strong>dodici sottotipi</strong> con criteri oggettivi e misurabili. Il risultato è una diagnosi cromatica più precisa, capace di distinguere tra tonalità che all\'occhio sembrano simili ma che sul viso producono effetti opposti.\n\nIl test dura circa un\'ora e mezza e si svolge in luce naturale con drappeggi standardizzati. <strong>Nessuna interpretazione soggettiva</strong> — solo quello che la luce rivela.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/gradient-abstract.png',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Test RAH completo con classificazione in sottotipi',
          'Analisi armocromia classica a quattro stagioni',
          'Scheda cromatica personalizzata con campioni',
          'Comparazione tra i due sistemi e spiegazione delle differenze',
        ],
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/palette-personale.png',
      },
    ],
  },

  {
    num: '03',
    color: '#6B2D5A',
    title: 'Capsula\nDopaminica',
    label: 'CAPSULA DOPAMINICA',
    desc: 'Un guardaroba capsula pensato per semplificarti la vita. Chiarezza e gioia nel rituale quotidiano del vestirsi.',
    credits: 'Consulenza individuale\nDurata ~1.5 ore',
    object3d: 'capsule',
    image: '/images/services/capsula-duck.gif',
    position: { top: '16%', right: '8%', w: 105, h: 105 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-after.png',
      },
      {
        type: 'text',
        title: 'L\'Idea',
        body: 'La dopamina non viene solo dai grandi acquisti — viene dal <strong>vestirsi ogni mattina con intenzione</strong>. Una capsula dopaminica non è una capsula minimalista. È un insieme selezionato di capi che ti fanno sentire bene, che funzionano insieme, che parlano di te.\n\nPartendo dalla tua palette cromatica, dalle occasioni della tua vita e dal tuo stile personale, costruiamo insieme un guardaroba snello che <strong>non lascia nulla al caso</strong>.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/wardrobe-messy.png',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Definizione delle occasioni e dei bisogni reali del guardaroba',
          'Selezione di capi base e pezzi carattere in palette',
          'Mappa degli abbinamenti possibili tra i capi',
          'Lista d\'acquisto consapevole per colmare le lacune',
        ],
      },
      {
        type: 'media',
        ratio: '21/9',
        src: '/images/services/wardrobe-before.png',
      },
    ],
  },

  {
    num: '04',
    color: '#1B6B6B',
    title: 'Consulenza\nViso',
    label: 'CONSULENZA VISO',
    desc: 'Valorizza i tuoi lineamenti e riscopri la tua energia. Una lettura che va oltre la forma per trovare armonia.',
    credits: 'Consulenza individuale\nDurata ~1 ora',
    object3d: 'face',
    position: { top: '52%', left: '5%', w: 78, h: 78 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/consulenza-viso-hero.jpg',
      },
      {
        type: 'text',
        title: 'L\'Approccio',
        body: 'La morfologia del viso guida le scelte di scollature, colletti, accessori, acconciature — e persino il trucco. Ma l\'analisi della forma è solo il punto di partenza. <strong>L\'energia che il viso trasmette</strong> — angolare, morbida, asimmetrica, intensa — è altrettanto determinante per capire cosa funziona e cosa toglie presenza.\n\nUna consulenza che lavora <strong>con la tua unicità</strong>, non contro di essa.',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Analisi morfologica del viso e delle proporzioni',
          'Lettura dell\'energia e del carattere espressivo',
          'Indicazioni su scollature, colletti e accessori valorizzanti',
          'Suggerimenti per acconciature e make-up in linea con i tuoi lineamenti',
        ],
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/face-styling.jpg',
      },
    ],
  },

  {
    num: '05',
    color: '#B8A060',
    title: 'Guardaroba',
    label: 'GUARDAROBA',
    desc: 'Decluttering, analisi, nuovi abbinamenti. Più leggerezza e sicurezza nel vestirsi ogni giorno.',
    credits: 'A domicilio\nDurata ~2.5 ore',
    object3d: 'hanger',
    image: '/images/services/guardaroba-moira.gif',
    position: { top: '46%', left: '38%', w: 135, h: 100 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-messy.png',
      },
      {
        type: 'text',
        title: 'Il Processo',
        body: 'Arrivo da te, apriamo l\'armadio insieme e <strong>guardiamo onestamente</strong> quello che c\'è. Cosa tieni, cosa liberi, cosa non hai mai davvero capito come indossare. Poi lavoriamo sugli abbinamenti possibili tra i capi che rimangono — spesso il guardaroba perfetto è già lì, solo <strong>non ancora visto</strong>.\n\nNessun giudizio. Solo chiarezza.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/wardrobe-before.png',
      },
      {
        type: 'caption',
        text: 'Consulenza svolta a domicilio, in tuo spazio e al tuo ritmo',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Revisione completa del guardaroba a domicilio',
          'Analisi di ogni capo in relazione alla palette e allo stile personale',
          'Nuovi abbinamenti scoperti tra capi già posseduti',
          'Strategia per colmare le lacune con acquisti mirati',
        ],
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-after.png',
      },
    ],
  },

  {
    num: '06',
    color: '#C45A5A',
    title: 'RAH\nColor Test',
    label: 'RAH COLOR TEST',
    desc: 'Diagnosi cromatica avanzata con il metodo RAH. Il test più preciso per identificare la tua palette ideale.',
    credits: 'Consulenza individuale\nDurata ~1 ora',
    object3d: 'vials',
    position: { top: '62%', right: '12%', w: 92, h: 92 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/rah-test.png',
      },
      {
        type: 'text',
        title: 'Il Test',
        body: 'Il metodo RAH — sviluppato per superare i limiti dell\'armocromia tradizionale — lavora su <strong>criteri misurabili e riproducibili</strong>. Dodici categorie invece di quattro, con una mappatura delle sottotonie e dei contrasti che permette una precisione che il sistema stagionale non raggiunge.\n\nIl test è rapido — circa un\'ora — ma <strong>la diagnosi è definitiva</strong>. Non dovrai mai chiederti di nuovo quali colori funzionano per te.',
      },
      {
        type: 'list',
        label: 'Cosa Include',
        items: [
          'Classificazione completa secondo il metodo RAH a dodici categorie',
          'Analisi delle sottotone, saturazione e livello di contrasto personale',
          'Palette digitale con indicazione dei colori ideali per categoria d\'uso',
          'Confronto con l\'armocromia classica e spiegazione delle differenze operative',
        ],
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/gioielli.jpg',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// SARTORIA SERVICES
// ---------------------------------------------------------------------------

export const SARTORIA_SERVICES: ServiceData[] = [
  {
    num: '01',
    color: '#C9A96E',
    title: 'Abito\nSu Misura',
    label: 'ABITO SU MISURA',
    desc: 'Un capo pensato per te, costruito su di te. Ogni cucitura racconta la tua storia.',
    credits: 'Su appuntamento\nProcesso 3-6 settimane',
    object3d: 'dress-form',
    position: { top: '8%', left: '12%', w: 120, h: 120 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/chiara-portrait.png',
      },
      {
        type: 'text',
        title: 'Il Processo',
        body: 'Iniziamo con una conversazione — su di te, sull\'occasione, su come vuoi sentirti. Non solo misure, ma intenzione. <strong>Il corpo è il punto di partenza</strong>, non il problema da risolvere.\n\nDopo il primo appuntamento, il cartamodello viene costruito da zero. Nessun adattamento da taglia standard. Tutto nasce da te.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'caption',
        text: 'Ogni abito prevede minimo due prove durante il processo di costruzione',
      },
      {
        type: 'list',
        label: 'Il Percorso Comprende',
        items: [
          'Consulenza iniziale e raccolta dell\'intenzione e dello stile',
          'Presa delle misure completa e costruzione del cartamodello personale',
          'Selezione del tessuto con campionario fisico in atelier',
          'Due o più prove intermedie per rifinitura e adattamento',
          'Consegna e adattamenti finali inclusi',
        ],
      },
      {
        type: 'media',
        ratio: '21/9',
        src: '/images/services/gradient-abstract.png',
      },
      {
        type: 'text',
        title: 'I Tessuti',
        body: 'Lavoriamo con fornitori selezionati in Italia. <strong>Lana, seta, cotone e lino</strong> di fascia alta — tessuti che hanno un comportamento preciso sul corpo e che reggono il tempo. Su richiesta è possibile portare un tessuto proprio con un significato personale.\n\nLa scelta del tessuto è parte integrante del processo creativo, non un dettaglio secondario.',
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'caption',
        text: 'Tessuti principalmente italiani e francesi, con selezione stagionale',
      },
      {
        type: 'divider',
      },
      {
        type: 'text',
        title: 'Per Chi È',
        body: 'Per chi ha smesso di trovare pronto a moda ciò che cerca. Per chi ha un\'occasione che merita qualcosa di unico. Per chi vuole <strong>un capo che duri vent\'anni</strong> invece di una stagione.\n\nNon è un lusso inaccessibile — è la scelta di investire su qualcosa fatto per rimanere.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/wardrobe-before.png',
      },
    ],
  },

  {
    num: '02',
    color: '#8B7355',
    title: 'Modifiche\nSartoriali',
    label: 'MODIFICHE SARTORIALI',
    desc: 'Far vestire perfettamente ciò che già possiedi. Precisione millimetrica.',
    credits: 'Su appuntamento\nTempi 1-2 settimane',
    object3d: 'scissors',
    position: { top: '5%', left: '48%', w: 88, h: 88 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'text',
        title: 'L\'Arte del Dettaglio',
        body: 'Un capo che veste bene e uno che veste perfettamente sono spesso separati da <strong>due centimetri e un\'ora di lavoro</strong>. La modifica sartoriale non è un ripiego — è il riconoscimento che il corpo non si adatta ai capi, sono i capi ad adattarsi al corpo.\n\nPorta quello che non vesti perché non ti sta bene. <strong>Lo facciamo diventare tuo.</strong>',
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-after.png',
      },
      {
        type: 'list',
        label: 'Interventi',
        items: [
          'Restringimenti e allargamenti su giacche, pantaloni, gonne e abiti',
          'Accorciamento e allungamento di orli, maniche e gambe',
          'Adattamento spalle e schiena su giacche strutturate',
          'Modifiche di busti, scolli e chiusure',
          'Adattamenti su capi vintage o di particolare valore affettivo',
        ],
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/chiara-portrait.png',
      },
    ],
  },

  {
    num: '03',
    color: '#D4B87A',
    title: 'Consulenza\nTessuti',
    label: 'CONSULENZA TESSUTI',
    desc: 'Impara a riconoscere la qualità. Toccare, capire, scegliere con consapevolezza.',
    credits: 'Su appuntamento\nDurata ~1.5 ore',
    object3d: 'fabric',
    position: { top: '14%', right: '8%', w: 105, h: 105 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'text',
        title: 'Toccare Per Capire',
        body: 'La fast fashion ha anestetizzato la mano. Abbiamo dimenticato com\'è un tessuto che <strong>vale davvero</strong> — come cade, come rispira, come invecchia con il tempo. Questa consulenza ri-educa il tatto e l\'occhio.\n\nNon un corso teorico — una sessione pratica con campioni fisici, dove impari a fare domande giuste prima di comprare.',
      },
      {
        type: 'media',
        ratio: '21/9',
        src: '/images/services/gradient-abstract.png',
      },
      {
        type: 'list',
        label: 'Cosa Imparerai',
        items: [
          'Distinguere le fibre naturali dalle sintetiche al tatto e alla luce',
          'Riconoscere la qualità di tessitura e finitura nei capi pronti',
          'Capire come i diversi tessuti si comportano sul corpo e nel tempo',
          'Fare acquisti consapevoli leggendo etichette e valutando costruzione',
        ],
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/chiara-portrait.png',
      },
    ],
  },

  {
    num: '04',
    color: '#6B5D4F',
    title: 'Riparazioni',
    label: 'RIPARAZIONI',
    desc: 'Ridare vita a ciò che ami. Perché i capi migliori meritano una seconda possibilità.',
    credits: 'Senza appuntamento\nTempi 3-7 giorni',
    object3d: 'thimble',
    position: { top: '50%', left: '5%', w: 78, h: 78 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'text',
        title: 'Restauro Tessile',
        body: 'Riparare non è accontentarsi — è <strong>scegliere la cura invece del consumo</strong>. Un bottone sostituito con precisione, una cucitura rifatta dove si è aperta, uno strappo ricucito fino a renderlo invisibile. Piccoli interventi che prolungano la vita di capi che meritano di durare.\n\nAccettiamo lavori su capi di qualsiasi complessità. <strong>Nessun capo troppo amato per essere salvato.</strong>',
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-before.png',
      },
      {
        type: 'list',
        label: 'Interventi',
        items: [
          'Sostituzione bottoni, cerniere, ganci e chiusure',
          'Riparazione cuciture aperte e strappi su qualsiasi tessuto',
          'Rammendo invisibile su lana, seta e tessuti delicati',
          'Restauro fodere e rinforzo punti di usura',
          'Interventi su capi vintage e di particolare pregio',
        ],
      },
    ],
  },

  {
    num: '05',
    color: '#A08050',
    title: 'Abito da\nCerimonia',
    label: 'ABITO DA CERIMONIA',
    desc: 'Per i momenti che contano. Un abito che sia all\'altezza della tua occasione.',
    credits: 'Su appuntamento\nProcesso 6-10 settimane',
    object3d: 'ceremony-hanger',
    position: { top: '44%', left: '38%', w: 135, h: 100 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/chiara-portrait.png',
      },
      {
        type: 'text',
        title: 'Il Momento',
        body: 'Un matrimonio, un anniversario, una prima. Occasioni che non si ripetono e che meritano un abito costruito apposta — <strong>non adattato, non scelto per comodità</strong>, ma progettato per quel giorno preciso.\n\nIl processo inizia con la comprensione dell\'occasione e di come vuoi sentirti. Il resto è artigianato al servizio di quel momento.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'caption',
        text: 'Disponibile anche per abiti da sposa su commissione, con tempi estesi',
      },
      {
        type: 'list',
        label: 'Il Percorso',
        items: [
          'Consulenza sull\'occasione, sul dress code e sull\'intenzione estetica',
          'Sviluppo del concept e selezione dei materiali con campionario',
          'Costruzione del cartamodello e realizzazione della prima prova',
          'Prove di rifinitura fino alla vestibilità perfetta',
          'Consegna con borsa porta-abito e istruzioni di cura',
        ],
      },
      {
        type: 'media',
        ratio: '21/9',
        src: '/images/services/gradient-abstract.png',
      },
    ],
  },

  {
    num: '06',
    color: '#C9A96E',
    title: 'Upcycling\nCreativo',
    label: 'UPCYCLING CREATIVO',
    desc: 'Trasformare il vecchio in qualcosa di nuovo. Sostenibilità con stile.',
    credits: 'Su appuntamento\nTempi variabili',
    object3d: 'morph-garment',
    position: { top: '60%', right: '12%', w: 92, h: 92 },
    blocks: [
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-messy.png',
      },
      {
        type: 'text',
        title: 'Nuova Vita',
        body: 'Il cappotto di tua nonna che non vesti più ma non riesci a cedere. La giacca del tuo ex preferito che ha perso il bouton ma conserva il tessuto. <strong>I capi con storia meritano un futuro</strong>, non un sacchetto per il mercatino.\n\nLavorando sul tessuto esistente — tagliando, ricombinando, aggiungendo — creiamo qualcosa di nuovo senza sprecare nulla di ciò che c\'era.',
      },
      {
        type: 'media',
        ratio: '3/4',
        src: '/images/services/fabric-texture.png',
      },
      {
        type: 'list',
        label: 'Possibilità',
        items: [
          'Trasformazione di capi in nuove silhouette (cappotto in giacca, abito in gonna)',
          'Combinazione di tessuti diversi per creare capi ibridi originali',
          'Aggiunta di dettagli sartoriali su capi esistenti per personalizzarli',
          'Recupero creativo di capi con danni o usura significativa',
        ],
      },
      {
        type: 'media',
        ratio: '16/10',
        src: '/images/services/wardrobe-after.png',
      },
      {
        type: 'text',
        title: 'Sostenibilità Reale',
        body: 'Non il greenwashing del "compra meno ma compra meglio". La sostenibilità reale è <strong>non comprare affatto</strong> quando si può trasformare, riparare, reinventare. L\'upcycling sartoriale è il modo più radicale di rispettare il lavoro nascosto in ogni capo.\n\nOgni progetto è unico — i tempi e i costi dipendono dalla complessità della trasformazione.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Base-path prefixing (for GitHub Pages subpath deploys)
// ---------------------------------------------------------------------------

const BASE: string = import.meta.env.BASE_URL;

function withBase(path: string): string {
  if (!path || !path.startsWith('/')) return path;
  // BASE is always trailing-slashed. Drop the leading '/' on path to avoid '//'.
  return BASE + path.slice(1);
}

function prefixServicePaths(services: ServiceData[]): void {
  for (const svc of services) {
    if (svc.image) svc.image = withBase(svc.image);
    if (svc.spline) svc.spline = withBase(svc.spline);
    for (const block of svc.blocks) {
      if (block.src) block.src = withBase(block.src);
    }
  }
}

prefixServicePaths(IMMAGINE_SERVICES);
prefixServicePaths(SARTORIA_SERVICES);

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getServices(reality: 'immagine' | 'sartoria'): ServiceData[] {
  return reality === 'sartoria' ? SARTORIA_SERVICES : IMMAGINE_SERVICES;
}
