export const extractDataFromRawText = (
  rawText: string
): { amount?: number; source?: string } => {
  const text = rawText.toLowerCase();

  // Match all monetary values (e.g., 12, 12.50, 1.200,00)
  const amountMatches = text.match(/\d+([.,]\d{2})?/g);

  let amount: number | undefined;
  if (amountMatches) {
    const numericValues = amountMatches.map(val =>
      parseFloat(val.replace(',', '.'))
    );
    amount = Math.max(...numericValues);
  }

  const keywordCategoryMap: Record<string, string> = {
    // --- Food
    ristorante: 'food', trattoria: 'food', osteria: 'food', pizzeria: 'food',
    pinsa: 'food', paninoteca: 'food', gastronomia: 'food', 'tavola calda': 'food',
    apericena: 'food', menu: 'food', coperto: 'food', pizza: 'food',
    margherita: 'food', diavola: 'food', 'quattro formaggi': 'food',
    carbonara: 'food', amatriciana: 'food', lasagna: 'food', gnocchi: 'food',
    risotto: 'food', pasta: 'food', penne: 'food', spaghetti: 'food',
    tagliatelle: 'food', ravioli: 'food', tortellini: 'food', bistecca: 'food',
    cotoletta: 'food', arrosto: 'food', panino: 'food', focaccia: 'food',
    bruschetta: 'food', toast: 'food', tagliere: 'food', antipasto: 'food',
    primo: 'food', secondo: 'food', contorno: 'food', dolce: 'food',
    gelato: 'food', tiramisù: 'food', cannolo: 'food', crostata: 'food',
    caffè: 'food', ristò: 'food', enoteca: 'food', mc: 'food', mcdonald: 'food',
    burgerking: 'food', kebab: 'food', kebabaro: 'food', sushi: 'food', food: 'food',

    // --- Drinks
    pepsi: 'drinks', coca: 'drinks', cocacola: 'drinks', fanta: 'drinks',
    sprite: 'drinks', chinotto: 'drinks', cedrata: 'drinks', birra: 'drinks',
    heineken: 'drinks', moretti: 'drinks', peroni: 'drinks', 'nastro azzurro': 'drinks',
    vino: 'drinks', rosso: 'drinks', bianco: 'drinks', prosecco: 'drinks',
    spumante: 'drinks', acqua: 'drinks', naturale: 'drinks', frizzante: 'drinks',
    'yogurt da bere': 'drinks', aranciata: 'drinks', limonata: 'drinks',
    spritz: 'drinks', cappuccino: 'drinks', macchiato: 'drinks',
    espresso: 'drinks', aperitivo: 'drinks', bibita: 'drinks', drink: 'drinks', drinks: 'drinks', 

    // --- Shopping
    tshirt: 'shopping', 't-shirt': 'shopping', polo: 'shopping',
    camicia: 'shopping', maglietta: 'shopping', felpa: 'shopping', giacca: 'shopping',
    pantaloni: 'shopping', jeans: 'shopping', shorts: 'shopping',
    vestito: 'shopping', abito: 'shopping', gonna: 'shopping', scarpe: 'shopping',
    stivali: 'shopping', intimo: 'shopping', calze: 'shopping',
    cappello: 'shopping', guanti: 'shopping', borsa: 'shopping',
    zaino: 'shopping', occhiali: 'shopping', profumo: 'shopping',
    accessori: 'shopping', sharee: 'shopping', panjabi: 'shopping',
    zara: 'shopping', hm: 'shopping', primark: 'shopping', coin: 'shopping',
    ovs: 'shopping', 'tally weijl': 'shopping', bershka: 'shopping', shopping: 'shopping',

    // --- Grocery
    supermercato: 'grocery', market: 'grocery', discount: 'grocery',
    alimentari: 'grocery', minimarket: 'grocery', 'negozio alimentare': 'grocery',
    pane: 'grocery', latte: 'grocery', burro: 'grocery', yogurt: 'grocery',
    formaggio: 'grocery', mozzarella: 'grocery', parmigiano: 'grocery',
    uova: 'grocery', prosciutto: 'grocery', salame: 'grocery', mortadella: 'grocery',
    zucchero: 'grocery', sale: 'grocery', olio: 'grocery', aceto: 'grocery',
    farina: 'grocery', riso: 'grocery', biscotti: 'grocery', cioccolato: 'grocery',
    frutta: 'grocery', verdura: 'grocery', mela: 'grocery', banana: 'grocery',
    limone: 'grocery', pomodoro: 'grocery', insalata: 'grocery', carota: 'grocery',
    conad: 'grocery', esselunga: 'grocery', carrefour: 'grocery', coop: 'grocery',
    lidl: 'grocery', eurospin: 'grocery', md: 'grocery', iper: 'grocery',
    pam: 'grocery', tigre: 'grocery', despar: 'grocery', aldi: 'grocery', grocery: 'grocery',

    // --- Transport
    taxi: 'transport', uber: 'transport', bus: 'transport', autobus: 'transport',
    metro: 'transport', treno: 'transport', biglietto: 'transport', viaggio: 'transport',
    noleggio: 'transport', auto: 'transport', benzina: 'transport', gasolio: 'transport',
    parcheggio: 'transport', atac: 'transport', trenitalia: 'transport',
    italo: 'transport', frecciarossa: 'transport', trenord: 'transport', transport: 'transport',

    // --- Medicine
    farmacia: 'medicine', aspirina: 'medicine', paracetamolo: 'medicine',
    tachipirina: 'medicine', antinfiammatorio: 'medicine', antibiotico: 'medicine',
    medicinale: 'medicine', farmaco: 'medicine', analgesico: 'medicine',
    cerotto: 'medicine', disinfettante: 'medicine', medico: 'medicine',
    ospedale: 'medicine', visita: 'medicine', analisi: 'medicine', medicine: 'medicine',

    // --- Entertainment
    cinema: 'entertainment', netflix: 'entertainment', 'prime video': 'entertainment',
    teatro: 'entertainment', museo: 'entertainment', mostra: 'entertainment',
    galleria: 'entertainment', concerto: 'entertainment', discoteca: 'entertainment',
    festa: 'entertainment', evento: 'entertainment', sagra: 'entertainment',
    partita: 'entertainment', calcio: 'entertainment', stadio: 'entertainment',
    juventus: 'entertainment', inter: 'entertainment', milan: 'entertainment',
    napoli: 'entertainment', lazio: 'entertainment', roma: 'entertainment', entertainment: 'entertainment',

    // --- Travel
    hotel: 'travel', albergo: 'travel', 'b&b': 'travel', ostello: 'travel',
    resort: 'travel', villaggio: 'travel', 'biglietto aereo': 'travel',
    aereo: 'travel', volo: 'travel', ryanair: 'travel', 'ita airways': 'travel',
    traghetto: 'travel', nave: 'travel', colosseo: 'travel', vaticano: 'travel',
    'musei vaticani': 'travel', 'piazza san marco': 'travel', duomo: 'travel',
    tour: 'travel', guida: 'travel', escursione: 'travel', 'visita guidata': 'travel', travel: 'travel',

    // --- Bills & Utilities
    elettricità: 'bills', gas: 'bills', internet: 'bills',
    luce: 'bills', telefono: 'bills', bolletta: 'bills', enel: 'bills',
    tim: 'bills', vodafone: 'bills', windtre: 'bills',

    // --- Rent / Housing
    affitto: 'rent', locazione: 'rent', canone: 'rent', condominio: 'rent', rent: 'rent',

    // --- Education
    scuola: 'education', 'tassa universitaria': 'education', 'retta scolastica': 'education',
    'mensile scuola': 'education', asilo: 'education', 'libri scolastici': 'education',
    'materiale scolastico': 'education', education: 'education', università: 'education', college: 'education', school: 'education', university: 'education',

    // --- Insurance / Finance
    assicurazione: 'insurance', 'polizza auto': 'insurance', 'polizza casa': 'insurance',
    banca: 'finance', bonifico: 'finance', pagamento: 'finance', commissione: 'finance', insurance: 'insurance', financial: 'finance', investment: 'finance',

    // --- Others
    tabacchi: 'others', sigarette: 'others', accendino: 'others', lotto: 'others',
    'gratta e vinci': 'others', edicolante: 'others', giornale: 'others',
    rivista: 'others', libro: 'others', cartoleria: 'others', fioraio: 'others',
    fiori: 'others', parrucchiere: 'others', barbiere: 'others', estetista: 'others',
    'centro estetico': 'others', palestra: 'others', 'abbonamento palestra': 'others',
    'personal trainer': 'others', piscina: 'others', massaggio: 'others',
  };

  let category = 'others';

  for (const keyword in keywordCategoryMap) {
    if (text.includes(keyword)) {
      category = keywordCategoryMap[keyword];
      break;
    }
  }

  return {
    amount,
    source: category,
  };
};
