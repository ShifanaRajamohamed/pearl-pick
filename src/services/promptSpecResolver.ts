export interface PromptContradictionResult {
  hasContradictions: boolean;
  conflicts: string[];
}

export interface DressFormDefaults {
  gender?: 'women' | 'men' | string;
  dressType?: string;
  occasion?: string;
  fabric?: string;
  color?: string;
  sleeve?: string;
  neckline?: string;
  pattern?: string;
  waistStyle?: string;
  backDesign?: string;
  length?: string;
  accessories?: string;
}

export interface ResolvedDressSpec {
  originalPrompt: string;
  cleanPrompt: string;
  gender: 'women' | 'men';
  garmentType: string;
  silhouette: string;
  color: string;
  fabric: string;
  neckline: string;
  sleeves: string;
  length: string;
  waistAndFit: string;
  embroidery: string;
  embroideryPlacement: string | null;
  accessories: string | null;
  exclusions: string[];
  background: string;
  presentationMode: 'adult_model' | 'garment_only';
  backDesign: string;
  backSpecifiedByUser: boolean;
  occasion: string;
  title: string;
  promptOverridesApplied: string[];
}

export interface BuiltPhotographicPrompts {
  garmentSpecificationSummary: string;
  exclusionsSummary: string;
  frontPrompt: string;
  backPrompt: string;
  sidePrompt: string;
  detailPrompt: string;
}

/**
 * Removes legacy auto-injected bracket metadata (e.g. [Silhouette: ... | Style Keywords: ...])
 * so only the user's explicit prompt text is analyzed as primary input.
 */
export function stripLegacyBracketMetadata(rawPrompt: string = ''): string {
  return rawPrompt
    .replace(/\[Silhouette:[\s\S]*?\]/gi, ' ')
    .replace(/\[Style Keywords:[\s\S]*?\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether the user's explicit prompt contains contradictory requirements
 * (e.g. "sleeveless" AND "full-length sleeves", or "floor-length" AND "mini dress").
 */
export function detectPromptContradictions(rawPrompt: string = ''): PromptContradictionResult {
  const clean = stripLegacyBracketMetadata(rawPrompt).toLowerCase();
  const conflicts: string[] = [];

  if (!clean || clean.length < 4) {
    return { hasContradictions: false, conflicts };
  }

  // 1. Sleeve contradictions: sleeveless/no sleeves vs full/long/puff/bell/cap/three-quarter sleeves
  const hasSleeveless =
    /\b(sleeveless|no\s+sleeves?|without\s+sleeves?|strapless\s+bodice)\b/i.test(clean);
  const hasExplicitSleeves =
    /\b(full[-\s]?length\s+(?:sheer\s+)?sleeves?|full\s+(?:sheer\s+)?sleeves?|long\s+(?:sheer\s+)?sleeves?|three[-\s]?quarter\s+sleeves?|3\/4\s+sleeves?|puff\s+sleeves?|bell\s+sleeves?|bishop\s+sleeves?|flute\s+sleeves?|churidar\s+sleeves?)\b/i.test(
      clean
    );

  if (hasSleeveless && hasExplicitSleeves) {
    conflicts.push(
      'Your prompt requests both "sleeveless / no sleeves" and explicit full or long sleeves. Please clarify which sleeve style you want.'
    );
  }

  // 2. Length contradictions: floor-length / full-length maxi vs mini / micro-mini / above-the-knee
  // Make sure "full-length sleeves" doesn't trigger garment length check
  const cleanWithoutSleeveLength = clean.replace(/full[-\s]?length\s+(?:\w+\s+)?sleeves?/g, '');
  const hasFloorLength =
    /\b(floor[-\s]?length|floor[-\s]?sweeping|floor[-\s]?grazing|ankle[-\s]?length|full[-\s]?length\s+(?:gown|dress|maxi|anarkali|lehenga|skirt))\b/i.test(
      cleanWithoutSleeveLength
    );
  const hasMiniLength =
    /\b(mini\s+dress|mini\s+skirt|micro[-\s]?mini|above[-\s]?the[-\s]?knee|short\s+mini)\b/i.test(
      cleanWithoutSleeveLength
    );

  if (hasFloorLength && hasMiniLength) {
    conflicts.push(
      'Your prompt specifies both a floor-length/full-length hemline and a short mini/above-the-knee hemline. Please clarify the desired garment length.'
    );
  }

  // 3. Neckline contradictions: strapless/off-shoulder tube vs turtleneck/high-neck/mandarin collar
  const hasStraplessNeck = /\b(strapless|tube\s+neck(?:line)?)\b/i.test(clean);
  const hasHighClosedNeck =
    /\b(turtleneck|high[-\s]?neck(?:line)?|mandarin\s+collar|closed\s+stand\s+collar|halter\s+neck(?:line)?)\b/i.test(
      clean
    );

  if (hasStraplessNeck && hasHighClosedNeck) {
    conflicts.push(
      'Your prompt combines a strapless/tube neckline with a high-neck, mandarin collar, or halter neckline. Please clarify the neckline style.'
    );
  }

  // 4. Embroidery contradictions: "no embroidery at all / completely plain" vs "all-over heavy embroidery"
  const hasTotalNoEmbroidery =
    /\b(no\s+embroidery(?:\s+anywhere|\s+at\s+all)?|completely\s+plain|completely\s+unembellished|zero\s+embroidery|without\s+any\s+embroidery)\b/i.test(
      clean
    );
  const hasAllOverEmbroidery =
    /\b(all[-\s]?over\s+(?:heavy\s+)?(?:zardozi|embroidery|beadwork|sequins?)|heavily\s+embroidered\s+all\s+over|covered\s+entirely\s+in\s+embroidery)\b/i.test(
      clean
    );

  if (hasTotalNoEmbroidery && hasAllOverEmbroidery) {
    conflicts.push(
      'Your prompt requests both "no embroidery / completely plain" and "all-over heavy embroidery". Please clarify the embellishment requirement.'
    );
  }

  // 5. Presentation mode contradictions: live human model vs no model / garment only
  const hasNoModel = /\b(no\s+model|without\s+a?\s*model|without\s+a?\s*person|garment\s+only)\b/i.test(clean);
  const hasExplicitHumanModel = /\b(worn\s+by\s+a\s+(?:live\s+|human\s+|real\s+)?model|on\s+a\s+live\s+model)\b/i.test(clean);

  if (hasNoModel && hasExplicitHumanModel) {
    conflicts.push(
      'Your prompt asks for the garment to be worn by a model and also specifies "no model / garment only". Please clarify how the garment should be presented.'
    );
  }

  return {
    hasContradictions: conflicts.length > 0,
    conflicts
  };
}

function capitalizePhrase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function extractColorFromPrompt(cleanPrompt: string): string | null {
  // Remove negative clauses ("no gold belt", "without silver necklace") and embroidery clauses ("with gold floral embroidery")
  // before detecting the primary garment colour so embellishment metals don't override the dress colour.
  const withoutNegatives = cleanPrompt
    .replace(/\b(?:no|without|avoid|exclude)\s+[^.,;]+/gi, ' ')
    .replace(/\bwith\s+[^.,;]*?\b(?:embroidery|embellishments?|beadwork|sequins?|zari|zardozi|threadwork|work|border|buttons|trim)\b/gi, ' ');

  const colorPatterns: RegExp[] = [
    /\b((?:deep|dark|light|pale|soft|pastel|bright|rich|royal|imperial|midnight|antique|burnt|dusty|muted|vibrant|neon|metallic|matte|pearl|champagne|rose|blush|emerald|ruby|sapphire|ivory|canary|haldi|sindoor|rani|morpankhi|peacock|sage|mint|olive|forest|bottle|navy|cobalt|sky|ice|powder|baby|coral|peach|salmon|lavender|lilac|mauve|plum|amethyst|burgundy|maroon|wine|bordeaux|crimson|scarlet|cherry|mustard|marigold|saffron|tangerine|rust|terracotta|chocolate|espresso|bronze|copper|charcoal|slate|silver|platinum|obsidian|onyx|ebony|off)[-\s]+(?:green|pink|blue|red|yellow|orange|purple|violet|brown|black|white|grey|gray|gold|ivory|blush|peach|teal|maroon|wine|navy|emerald|crimson|rose|champagne|velvet)?)\b/i,
    /\b(emerald[-\s]?green|blush[-\s]?pink|pearl[-\s]?blush|rani[-\s]?pink|baby[-\s]?pink|rose[-\s]?pink|dusty[-\s]?rose|hot[-\s]?pink|royal[-\s]?blue|midnight[-\s]?blue|navy[-\s]?blue|sky[-\s]?blue|powder[-\s]?blue|ice[-\s]?blue|peacock[-\s]?blue|bottle[-\s]?green|forest[-\s]?green|sage[-\s]?green|mint[-\s]?green|olive[-\s]?green|lime[-\s]?green|crimson[-\s]?red|ruby[-\s]?red|scarlet[-\s]?red|wine[-\s]?red|burgundy|maroon|bordeaux|haldi[-\s]?yellow|mustard[-\s]?yellow|canary[-\s]?yellow|lemon[-\s]?yellow|champagne[-\s]?gold|antique[-\s]?gold|rose[-\s]?gold|ivory[-\s]?white|off[-\s]?white|pearl[-\s]?white|cream|ivory|champagne|lavender|lilac|mauve|amethyst|plum|violet|purple|coral|peach|terracotta|rust|tangerine|marigold|orange|yellow|red|pink|blue|green|black|white|silver|gold|grey|gray|charcoal|brown|beige|taupe)\b/i
  ];

  for (const regex of colorPatterns) {
    const match = withoutNegatives.match(regex);
    if (match && match[1]) {
      const candidate = match[1].replace(/\bvelvet\b/i, '').replace(/[-]+/g, ' ').trim();
      if (candidate.length >= 3) {
        return capitalizePhrase(candidate);
      }
    }
  }
  return null;
}

function extractFabricFromPrompt(cleanPrompt: string): string | null {
  const withoutNegatives = cleanPrompt.replace(/\b(?:no|without|avoid|exclude)\s+[^.,;]+/gi, ' ');
  const fabricRegex =
    /\b((?:pure\s+|mulberry\s+|banarasi\s+|kanjeevaram\s+|kanchipuram\s+|chanderi\s+|tussar\s+|raw\s+|duchess\s+|french\s+|italian\s+|heavy\s+|crushed\s+|stretch\s+|handloom\s+|belgian\s+|egyptian\s+)?(?:silk\s+organza|silk\s+velvet|silk\s+chiffon|silk\s+georgette|silk\s+satin|silk\s+crepe|banarasi\s+brocade|banarasi\s+silk|kanjeevaram\s+silk|raw\s+silk|mulberry\s+silk|chanderi\s+tissue|chanderi\s+silk|chantilly\s+lace|illusion\s+tulle|velvet|organza|chiffon|georgette|satin|crepe|brocade|taffeta|tulle|net|lace|linen|cotton|mulmul|khadi|wool|cashmere|tweed|mikado|charmeuse|habotai|silk))\b/i;

  const match = withoutNegatives.match(fabricRegex);
  if (match && match[1]) {
    return capitalizePhrase(match[1]);
  }
  return null;
}

function extractGarmentTypeAndSilhouette(
  cleanPrompt: string,
  defaultGender: 'women' | 'men'
): { gender: 'women' | 'men'; garmentType: string; silhouette: string } | null {
  const s = cleanPrompt.toLowerCase();

  // Check Menswear types first
  if (/\b(3[-\s]?piece\s+tuxedo|tuxedo|dinner\s+suit|dinner\s+jacket)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Tailored Tuxedo', silhouette: 'Tailored Tuxedo Suit' };
  }
  if (/\b(bandhgala|jodhpuri\s+suit|jodhpuri\s+jacket|jodhpuri)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Jodhpuri Bandhgala Suit', silhouette: 'Structured Bandhgala' };
  }
  if (/\b(sherwani|achkan|angarkha\s+sherwani)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Sherwani', silhouette: 'Long Tailored Sherwani' };
  }
  if (/\b(nehru\s+jacket|bundi\s+jacket|bandi\s+set)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Nehru Jacket & Kurta Set', silhouette: 'Nehru Jacket over Kurta' };
  }
  if (/\b(safari\s+suit)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Safari Suit', silhouette: 'Belted Safari Suit' };
  }
  if (/\b(double[-\s]?breasted\s+blazer|double[-\s]?breasted\s+suit|men'?s\s+suit|blazer\s+suit)\b/i.test(s)) {
    return { gender: 'men', garmentType: 'Tailored Suit', silhouette: 'Structured Tailored Suit' };
  }

  // Check Womenswear / general types
  if (/\b(mermaid\s+gown|mermaid\s+dress|trumpet\s+gown|fishtail\s+gown)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Mermaid Gown',
      silhouette: 'Fitted bodice and hips flaring into a mermaid skirt'
    };
  }
  if (/\b(ball\s*gown)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Ball Gown',
      silhouette: 'Fitted bodice with voluminous full ball-gown skirt'
    };
  }
  if (/\b(saree\s+gown)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Saree Gown',
      silhouette: 'Pre-pleated draped saree gown silhouette'
    };
  }
  if (/\b(saree|sari|kanjeevaram\s+saree|banarasi\s+saree)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Saree with Fitted Blouse',
      silhouette: 'Traditional pleated saree drape with pallu and tailored blouse'
    };
  }
  if (/\b(lehenga(?:\s+choli)?|bridal\s+lehenga|ghagra)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Lehenga Choli',
      silhouette: 'Flared floor-length lehenga skirt with tailored choli blouse'
    };
  }
  if (/\b(anarkali(?:\s+suit|\s+gown)?|kalidar\s+anarkali)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Anarkali Gown',
      silhouette: 'Fitted bodice with flared kalidar Anarkali skirt'
    };
  }
  if (/\b(sharara(?:\s+suit|\s+set)?|gharara)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Sharara Set',
      silhouette: 'Tailored kurti top paired with flared wide-leg sharara trousers'
    };
  }
  if (/\b(corset\s+gown|corset\s+dress|bustier\s+gown|bustier\s+dress)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'Corset Gown',
      silhouette: 'Structured boned corset bodice with flowing skirt'
    };
  }
  if (/\b(cocktail\s+dress|midi\s+dress|tea[-\s]?length\s+dress|sheath\s+dress|bodycon\s+dress|slip\s+dress|mini\s+dress)\b/i.test(s)) {
    const match = s.match(
      /\b(cocktail\s+dress|midi\s+dress|tea[-\s]?length\s+dress|sheath\s+dress|bodycon\s+dress|slip\s+dress|mini\s+dress)\b/i
    );
    const label = match ? capitalizePhrase(match[1]) : 'Cocktail Dress';
    return {
      gender: 'women',
      garmentType: label,
      silhouette: label
    };
  }
  if (/\b(a[-\s]?line\s+gown|a[-\s]?line\s+dress)\b/i.test(s)) {
    return {
      gender: 'women',
      garmentType: 'A-Line Gown',
      silhouette: 'Fitted bodice with a gradual A-line skirt flare'
    };
  }
  if (/\b(evening\s+gown|floor[-\s]?length\s+gown|gown|maxi\s+dress|dress)\b/i.test(s)) {
    const isFittedWaist = /\b(fitted\s+waist|cinched\s+waist)\b/i.test(s);
    return {
      gender: 'women',
      garmentType: 'Gown',
      silhouette: isFittedWaist
        ? 'Full-length gown with fitted waist and flowing skirt'
        : 'Full-length flowing gown silhouette'
    };
  }
  if (/\b(kurta|kurti)\b/i.test(s)) {
    const isMen = defaultGender === 'men' || /\b(men|mens|groom|pajama|churidar|bundi)\b/i.test(s);
    return {
      gender: isMen ? 'men' : 'women',
      garmentType: isMen ? 'Tailored Kurta Ensemble' : 'Tailored Kurti Ensemble',
      silhouette: isMen ? 'Straight-cut tailored men’s kurta with trousers' : 'Tailored women’s kurti silhouette'
    };
  }

  return null;
}

function extractNecklineFromPrompt(cleanPrompt: string): string | null {
  const withoutNegatives = cleanPrompt.replace(/\b(?:no|without|avoid|exclude)\s+[^.,;]+/gi, ' ');
  const patterns: RegExp[] = [
    /\b((?:sculpted\s+|deep\s+|plunging\s+|illusion\s+)?sweetheart\s+neck(?:line)?|sweetheart)\b/i,
    /\b((?:deep\s+|plunging\s+|sculpted\s+)?v[-\s]?neck(?:line)?)\b/i,
    /\b(off[-\s]?the[-\s]?shoulder\s+neck(?:line)?|off[-\s]?shoulder\s+neck(?:line)?|bardot\s+neck(?:line)?|off[-\s]?shoulder)\b/i,
    /\b(one[-\s]?shoulder\s+neck(?:line)?|asymmetric\s+one[-\s]?shoulder|one[-\s]?shoulder)\b/i,
    /\b(halter\s+neck(?:line)?|halter)\b/i,
    /\b(square\s+neck(?:line)?|square[-\s]?cut\s+neck(?:line)?)\b/i,
    /\b(boat\s+neck(?:line)?|bateau\s+neck(?:line)?)\b/i,
    /\b(high[-\s]?neck(?:line)?|turtleneck|mock\s+neck(?:line)?|illusion\s+high\s+neck)\b/i,
    /\b(mandarin\s+(?:bandhgala\s+)?collar|nehru\s+collar|stand\s+collar)\b/i,
    /\b((?:satin\s+|silk\s+)?peak\s+lapels?|notch\s+lapels?|shawl\s+(?:tuxedo\s+)?collar|shawl\s+lapels?)\b/i,
    /\b(scoop\s+neck(?:line)?|round\s+neck(?:line)?|jewel\s+neck(?:line)?|u[-\s]?neck(?:line)?)\b/i,
    /\b(strapless\s+neck(?:line)?|strapless\s+bodice|strapless)\b/i,
    /\b(cowl\s+neck(?:line)?)\b/i
  ];

  for (const regex of patterns) {
    const match = withoutNegatives.match(regex);
    if (match && match[1]) {
      const text = capitalizePhrase(match[1]);
      return /neck|collar|lapel|strapless/i.test(text) ? text : `${text} Neckline`;
    }
  }
  return null;
}

function extractSleevesFromPrompt(cleanPrompt: string): string | null {
  const s = cleanPrompt;
  if (/\b(sleeveless|no\s+sleeves?|without\s+sleeves?)\b/i.test(s)) {
    return 'Sleeveless';
  }
  const sleevePatterns: RegExp[] = [
    /\b(full[-\s]?length\s+sheer\s+sleeves?|long\s+sheer\s+sleeves?|full\s+sheer\s+sleeves?)\b/i,
    /\b(full[-\s]?length\s+(?:fitted\s+)?sleeves?|full\s+(?:fitted\s+)?sleeves?|long\s+(?:fitted\s+)?sleeves?)\b/i,
    /\b(three[-\s]?quarter\s+(?:sheer\s+)?sleeves?|3\/4\s+sleeves?|elbow[-\s]?length\s+sleeves?)\b/i,
    /\b(cap\s+sleeves?|short\s+sleeves?|half\s+sleeves?)\b/i,
    /\b(puff\s+sleeves?|bishop\s+sleeves?|balloon\s+sleeves?)\b/i,
    /\b(bell\s+sleeves?|flute\s+sleeves?|flared\s+sleeves?)\b/i,
    /\b((?:sheer\s+)?cape\s+sleeves?)\b/i,
    /\b(off[-\s]?shoulder\s+sleeves?|dropped\s+sleeves?)\b/i,
    /\b(french\s+tailored\s+cuffs?|churidar\s+sleeves?)\b/i
  ];

  for (const regex of sleevePatterns) {
    const match = s.match(regex);
    if (match && match[1]) {
      return capitalizePhrase(match[1]);
    }
  }
  return null;
}

function extractLengthFromPrompt(cleanPrompt: string, garmentType: string): string {
  const cleanWithoutSleeveLength = cleanPrompt.replace(/full[-\s]?length\s+(?:\w+\s+)?sleeves?/gi, '');
  if (/\b(floor[-\s]?length|floor[-\s]?sweeping|floor[-\s]?grazing)\b/i.test(cleanWithoutSleeveLength)) {
    return 'Floor-length';
  }
  if (/\b(ankle[-\s]?length)\b/i.test(cleanWithoutSleeveLength)) {
    return 'Ankle-length';
  }
  if (/\b(tea[-\s]?length|midi[-\s]?length|midi|calf[-\s]?length)\b/i.test(cleanWithoutSleeveLength)) {
    return 'Midi / Tea-length';
  }
  if (/\b(knee[-\s]?length)\b/i.test(cleanWithoutSleeveLength)) {
    return 'Knee-length';
  }
  if (/\b(mini|above[-\s]?the[-\s]?knee)\b/i.test(cleanWithoutSleeveLength)) {
    return 'Mini / Above-the-knee';
  }
  if (/\b(gown|lehenga|saree|anarkali|mermaid)\b/i.test(garmentType)) {
    return 'Floor-length';
  }
  return 'Full-length tailored';
}

function extractWaistAndFitFromPrompt(cleanPrompt: string, silhouette: string): string {
  const matches: string[] = [];
  if (/\b(fitted\s+waist|cinched\s+waist|sculpted\s+waist)\b/i.test(cleanPrompt)) {
    matches.push('Fitted waist');
  }
  if (/\b(basque\s+waist(?:line)?)\b/i.test(cleanPrompt)) {
    matches.push('Basque waistline');
  }
  if (/\b(empire\s+waist(?:line)?)\b/i.test(cleanPrompt)) {
    matches.push('Empire waistline');
  }
  if (/\b(corset(?:ed)?\s+(?:bodice|waist))\b/i.test(cleanPrompt)) {
    matches.push('Structured corset bodice');
  }
  if (/\b(fluid\s+train|sweeping\s+train|cathedral\s+train|court\s+train)\b/i.test(cleanPrompt)) {
    const m = cleanPrompt.match(/\b(fluid\s+train|sweeping\s+train|cathedral\s+train|court\s+train)\b/i);
    if (m) matches.push(capitalizePhrase(m[1]));
  }
  return matches.length > 0 ? matches.join(', ') : silhouette;
}

function extractEmbroideryAndPlacement(
  cleanPrompt: string,
  formPattern?: string
): { embroidery: string; placementConstraint: string | null } {
  const lower = cleanPrompt.toLowerCase();

  // Check if user explicitly asked for no embroidery / plain
  if (/\b(no\s+embroidery|unembellished|plain\s+fabric|without\s+embroidery|minimalist\s+plain)\b/i.test(lower)) {
    return {
      embroidery: 'Clean unembellished fabric finish (no surface embroidery)',
      placementConstraint: 'Do not add any embroidery, beadwork, or sequins anywhere on the garment'
    };
  }

  // Check placement restriction phrases like "gold floral embroidery only along the hem" or "embroidery only on the collar"
  const onlyPlacementMatch = cleanPrompt.match(
    /\b((?:[\w-]+\s+){0,4}(?:embroidery|embellishments?|beadwork|pearls?|sequins?|zardozi|motif|lace|work))\s+(only\s+(?:along|on|at|around)\s+the\s+[\w\s-]+?)(?:[.,;]|$|\band\b|\bno\b)/i
  );
  if (onlyPlacementMatch) {
    const motif = capitalizePhrase(onlyPlacementMatch[1]);
    const where = onlyPlacementMatch[2].trim();
    return {
      embroidery: `${motif} ${where}`,
      placementConstraint: `Place ${motif.toLowerCase()} STRICTLY ${where} — keep all other areas of the garment (bodice, waist, sleeves, and main body) completely free of embroidery or extra embellishments`
    };
  }

  // Also check "only along the hem" appearing anywhere in the prompt
  const genericOnlyMatch = cleanPrompt.match(/\b(only\s+(?:along|on|at|around)\s+the\s+(?:hem|hemline|border|collar|cuffs|neckline|bodice|waist|sleeves))\b/i);

  // Extract explicit embellishment descriptions from prompt
  const embellishmentMatch = cleanPrompt.match(
    /\b((?:small\s+|delicate\s+|fine\s+|hand-finished\s+|heavy\s+|subtle\s+|gold\s+|silver\s+|antique\s+gold\s+|tonal\s+|3d\s+|hand-worked\s+)?(?:floral\s+embroidery|pearl\s+embellishments?|pearl\s+constellation|pearl\s+beadwork|pearl\s+work|zardozi\s+(?:collar\s+)?embroidery|dabka\s+and\s+zardozi|zardozi\s+work|chikankari\s+(?:resham\s+)?embroidery|mirror\s+work|sequin\s+embroidery|crystal\s+embellishments?|kundan\s+work|resham\s+embroidery|maggam\s+work|shadow\s+work|beadwork|embroidery|embellishments?)(?:\s+(?:only\s+)?(?:along|on|at|around)\s+the\s+[\w\s]+?)?)(?:[.,;]|$|\band\s+no\b|\bno\b)/i
  );

  if (embellishmentMatch && embellishmentMatch[1]) {
    const desc = capitalizePhrase(embellishmentMatch[1]);
    const placementConstraint = genericOnlyMatch
      ? `Restrict surface embellishment strictly ${genericOnlyMatch[1]} — do not place embroidery elsewhere on the garment`
      : null;
    return {
      embroidery: desc,
      placementConstraint
    };
  }

  // If prompt is detailed (> 25 chars) and doesn't mention any embroidery, do NOT inject unrequested heavy zardozi!
  if (cleanPrompt.trim().length > 25) {
    return {
      embroidery: 'Clean tailored finish with no unrequested embroidery',
      placementConstraint: 'Do not add unrequested embroidery, borders, or beadwork'
    };
  }

  return {
    embroidery: formPattern || 'Clean tailored finish',
    placementConstraint: null
  };
}

function extractExclusionsFromPrompt(
  cleanPrompt: string,
  placementConstraint: string | null,
  hasRequestedAccessories: boolean
): string[] {
  const exclusions: string[] = [];

  // Match explicit negative sentences/clauses like "No necklace, no belt", "No necklace or belt", "without jewelry"
  const negativeClauseRegex = /\b(?:no|without|exclude|avoid)\s+([a-zA-Z\s,/-]+?)(?=[.;!]|$|\b(?:plain|neutral|soft|clean|white|studio|background|worn|with\s+a)\b)/gi;
  let match: RegExpExecArray | null;
  while ((match = negativeClauseRegex.exec(cleanPrompt)) !== null) {
    const rawClause = match[1].trim().replace(/,\s*$/, '');
    if (rawClause && rawClause.length > 1 && !/\b(sleeves?|embroidery|model)\b/i.test(rawClause)) {
      exclusions.push(`No ${rawClause}`);
    } else if (rawClause && /\b(necklace|belt|jewel|earring|bracelet|choker|bangle|ring|veil|dupatta|cape|border|sash|brooch|tie|pocket\s+square)\b/i.test(rawClause)) {
      exclusions.push(`No ${rawClause}`);
    }
  }

  // Specifically detect common items in "No X, no Y" or "No X or Y"
  const lower = cleanPrompt.toLowerCase();
  if (/\bno\s+necklace\b|\bwithout\s+necklace\b/i.test(lower)) {
    if (!exclusions.some((e) => e.toLowerCase().includes('necklace'))) {
      exclusions.push('No necklace');
    }
  }
  if (/\bno\s+(?:[\w\s,]+\s+or\s+)?belt\b|\bno\s+belt\b|\bwithout\s+belt\b/i.test(lower)) {
    if (!exclusions.some((e) => e.toLowerCase().includes('belt'))) {
      exclusions.push('No belt or waist sash');
    }
  }
  if (/\bno\s+jewel(?:le)?ry\b|\bwithout\s+jewel(?:le)?ry\b/i.test(lower)) {
    exclusions.push('No jewelry');
  }

  if (placementConstraint) {
    exclusions.push(placementConstraint);
  }

  // Baseline guardrails against unrequested hallucinated items (Requirement 3)
  if (!hasRequestedAccessories) {
    if (!/\b(necklace|choker|pendant|jewelry|jewellery)\b/i.test(lower)) {
      exclusions.push('Do not add unrequested necklaces or statement jewelry');
    }
    if (!/\b(belt|waistband|cummerbund|sash)\b/i.test(lower)) {
      exclusions.push('Do not add any unrequested belt or waist sash');
    }
    if (!/\b(cape|shawl|stole|dupatta|veil|jacket\s+over)\b/i.test(lower)) {
      exclusions.push('Do not add unrequested capes, dupattas, veils, or extra layered garments');
    }
    if (!/\b(border|piping)\b/i.test(lower)) {
      exclusions.push('Do not add unrequested decorative borders');
    }
  }

  return Array.from(new Set(exclusions));
}

function extractRequestedAccessories(cleanPrompt: string): string | null {
  const withoutNegatives = cleanPrompt.replace(/\b(?:no|without|avoid|exclude)\s+[^.,;]+/gi, ' ');
  const accMatches: string[] = [];

  const patterns = [
    /\b((?:matching\s+|scalloped\s+|sheer\s+|organza\s+|embroidered\s+)?dupatta)\b/i,
    /\b((?:silk\s+)?pocket\s+square)\b/i,
    /\b((?:brass\s+|lion-crest\s+|polki\s+|emerald\s+)?brooch)\b/i,
    /\b((?:matching\s+)?potli(?:\s+bag)?)\b/i,
    /\b((?:cathedral\s+|sheer\s+)?veil)\b/i,
    /\b((?:matching\s+|royal\s+|kantha\s+)?stole)\b/i
  ];

  for (const regex of patterns) {
    const m = withoutNegatives.match(regex);
    if (m && m[1]) {
      accMatches.push(capitalizePhrase(m[1]));
    }
  }

  return accMatches.length > 0 ? accMatches.join(', ') : null;
}

function extractBackgroundFromPrompt(cleanPrompt: string): string {
  const bgMatch = cleanPrompt.match(
    /\b((?:plain\s+white|neutral|clean\s+white|soft\s+grey|soft\s+gray|minimalist|warm\s+beige|seamless\s+white|daylight|outdoor\s+garden|palace\s+courtyard|architectural|luxury\s+atelier|runway)?\s*(?:studio\s+background|white\s+background|neutral\s+background|background|backdrop|setting))\b/i
  );
  if (bgMatch && bgMatch[1] && bgMatch[1].trim().length > 6) {
    return capitalizePhrase(bgMatch[1].trim());
  }
  return 'Clean, softly lit neutral studio background';
}

function extractPresentationMode(cleanPrompt: string): 'adult_model' | 'garment_only' {
  if (
    /\b(garment[-\s]?only|product[-\s]?only|no\s+model|without\s+a?\s*model|without\s+a?\s*person|flat[-\s]?lay|invisible\s+mannequin|on\s+a\s+mannequin)\b/i.test(
      cleanPrompt
    )
  ) {
    return 'garment_only';
  }
  return 'adult_model';
}

function extractBackDesignFromPrompt(
  cleanPrompt: string,
  gender: 'women' | 'men',
  neckline: string
): { backDesign: string; backSpecifiedByUser: boolean } {
  const backMatch = cleanPrompt.match(
    /\b(deep\s+v[-\s]?back|deep\s+u[-\s]?back|open\s+back|backless|keyhole\s+back|lace[-\s]?up\s+corset\s+back|illusion\s+sheer\s+back|covered\s+high\s+back|buttoned\s+back|double\s+side\s+vents|single\s+back\s+vent)\b/i
  );
  if (backMatch && backMatch[1]) {
    return {
      backDesign: capitalizePhrase(backMatch[1]),
      backSpecifiedByUser: true
    };
  }

  if (gender === 'men') {
    return {
      backDesign: 'Clean tailored back shoulder seam with classic double side vents compatible with the front cut',
      backSpecifiedByUser: false
    };
  }

  return {
    backDesign: `Clean tailored back panel with a concealed center-back zipper closure compatible with the ${neckline.toLowerCase()}`,
    backSpecifiedByUser: false
  };
}

/**
 * Resolves the authoritative garment specification.
 * Explicit user prompt details ALWAYS override form selections.
 * Form selections are used ONLY when the user's prompt does not specify that attribute.
 */
export function resolveDressSpecifications(
  rawPrompt: string = '',
  formDefaults: DressFormDefaults = {}
): ResolvedDressSpec {
  const cleanPrompt = stripLegacyBracketMetadata(rawPrompt);
  const defaultGender: 'women' | 'men' = formDefaults.gender === 'men' ? 'men' : 'women';
  const promptOverridesApplied: string[] = [];

  // 1. Garment Type & Silhouette
  const promptGarment = extractGarmentTypeAndSilhouette(cleanPrompt, defaultGender);
  const gender: 'women' | 'men' = promptGarment ? promptGarment.gender : defaultGender;
  const garmentType = promptGarment
    ? promptGarment.garmentType
    : formDefaults.dressType || (gender === 'men' ? 'Jodhpuri Bandhgala Suit' : 'Gown');
  const silhouette = promptGarment ? promptGarment.silhouette : garmentType;

  if (promptGarment && formDefaults.dressType && promptGarment.garmentType.toLowerCase() !== formDefaults.dressType.toLowerCase()) {
    promptOverridesApplied.push(`Garment type set to "${promptGarment.garmentType}" from prompt`);
  }

  // 2. Colour
  const promptColor = extractColorFromPrompt(cleanPrompt);
  const color = promptColor || formDefaults.color || (gender === 'men' ? 'Midnight Obsidian' : 'Blush Pink');
  if (promptColor && formDefaults.color && promptColor.toLowerCase() !== formDefaults.color.toLowerCase()) {
    promptOverridesApplied.push(`Colour set to "${promptColor}" from prompt`);
  }

  // 3. Fabric
  const promptFabric = extractFabricFromPrompt(cleanPrompt);
  const fabric = promptFabric || formDefaults.fabric || (gender === 'men' ? 'Raw Silk' : 'Silk Organza');
  if (promptFabric && formDefaults.fabric && promptFabric.toLowerCase() !== formDefaults.fabric.toLowerCase()) {
    promptOverridesApplied.push(`Fabric set to "${promptFabric}" from prompt`);
  }

  // 4. Neckline
  const promptNeckline = extractNecklineFromPrompt(cleanPrompt);
  const neckline =
    promptNeckline ||
    formDefaults.neckline ||
    (gender === 'men' ? 'Mandarin Collar' : 'Sweetheart Neckline');
  if (promptNeckline && formDefaults.neckline && promptNeckline.toLowerCase() !== formDefaults.neckline.toLowerCase()) {
    promptOverridesApplied.push(`Neckline set to "${promptNeckline}" from prompt`);
  }

  // 5. Sleeves
  const promptSleeves = extractSleevesFromPrompt(cleanPrompt);
  const sleeves =
    promptSleeves ||
    formDefaults.sleeve ||
    (gender === 'men' ? 'Full-Length Tailored Sleeves' : 'Full Sleeves');
  if (promptSleeves && formDefaults.sleeve && promptSleeves.toLowerCase() !== formDefaults.sleeve.toLowerCase()) {
    promptOverridesApplied.push(`Sleeves set to "${promptSleeves}" from prompt`);
  }

  // 6. Length & Waist/Fit
  const length = extractLengthFromPrompt(cleanPrompt, garmentType);
  const waistAndFit = extractWaistAndFitFromPrompt(cleanPrompt, silhouette);

  // 7. Embroidery & Placement
  const { embroidery, placementConstraint } = extractEmbroideryAndPlacement(
    cleanPrompt,
    formDefaults.pattern
  );

  // 8. Accessories & Exclusions
  const accessories = extractRequestedAccessories(cleanPrompt);
  const exclusions = extractExclusionsFromPrompt(cleanPrompt, placementConstraint, Boolean(accessories));

  // 9. Background & Presentation
  const background = extractBackgroundFromPrompt(cleanPrompt);
  const presentationMode = extractPresentationMode(cleanPrompt);

  // 10. Back construction
  const { backDesign, backSpecifiedByUser } = extractBackDesignFromPrompt(cleanPrompt, gender, neckline);

  const occasion = formDefaults.occasion || (gender === 'men' ? 'Formal & Ceremonial' : 'Evening & Bridal Couture');
  const title = `${color} ${fabric} ${garmentType}`.replace(/\s+/g, ' ').trim();

  return {
    originalPrompt: rawPrompt,
    cleanPrompt,
    gender,
    garmentType,
    silhouette,
    color,
    fabric,
    neckline,
    sleeves,
    length,
    waistAndFit,
    embroidery,
    embroideryPlacement: placementConstraint,
    accessories,
    exclusions,
    background,
    presentationMode,
    backDesign,
    backSpecifiedByUser,
    occasion,
    title,
    promptOverridesApplied
  };
}

/**
 * Builds the resolved photographic prompts for Front, Back, Side, and Close-Up Detail views.
 * Never leaves unresolved placeholders and strictly enforces user details and exclusions.
 */
export function buildPhotographicPrompts(spec: ResolvedDressSpec): BuiltPhotographicPrompts {
  const modelDescriptor =
    spec.presentationMode === 'garment_only'
      ? 'a finished bespoke garment presented as a standalone full-length product photograph without a human model'
      : spec.gender === 'men'
      ? 'an adult male fashion model wearing the following finished garment'
      : 'an adult female fashion model wearing the following finished garment';

  const specParts: string[] = [
    `${spec.color} ${spec.fabric} ${spec.length.toLowerCase()} ${spec.garmentType}`,
    `Silhouette & Fit: ${spec.waistAndFit}`,
    `Neckline/Collar: ${spec.neckline}`,
    `Sleeves: ${spec.sleeves}`,
    `Surface Detail / Embroidery: ${spec.embroidery}`
  ];

  if (spec.accessories) {
    specParts.push(`Requested Accessories: ${spec.accessories}`);
  }

  const userRequestClause = spec.cleanPrompt
    ? `Exact user request: "${spec.cleanPrompt}". Resolved garment specifications: ${specParts.join('; ')}.`
    : `Resolved garment specifications: ${specParts.join('; ')}.`;

  const exclusionsSummary =
    spec.exclusions.length > 0
      ? spec.exclusions.join('. ')
      : 'Do not add unrequested jewelry, necklaces, belts, capes, borders, or extra layered garments';

  const frontPrompt = [
    `Professional full-length fashion photograph of ${modelDescriptor}: ${userRequestClause}`,
    `Realistic textile texture, weight, transparency, and sheen of ${spec.fabric}; physically plausible stitching, seams, hems, embroidery, and garment construction; natural fabric drape, pleats, folds, and gravity; accurate fit around the body with natural contact shadows; lifelike human proportions, realistic skin texture, natural hands, and poised natural standing posture facing the camera.`,
    `Entire garment visible from top of neckline to the complete floor hemline without cropping the hem or sleeves.`,
    `Background setting: ${spec.background}. Soft photographic studio lighting with realistic floor shadows.`,
    `The result must look like a real professional fashion e-commerce photograph of a physical garment worn by a real person, NEVER a fashion sketch, SVG drawing, flat vector shape, technical illustration, cartoon, plastic mannequin, or CGI render. Do not render any text, labels, watermarks, or UI badges inside the photograph.`,
    `Preserve all requested garment details and strictly enforce these exclusions: ${exclusionsSummary}.`
  ].join(' ');

  const backPrompt = [
    `Using the provided front-view fashion photograph as the strict visual reference for the exact garment, model identity, fabric texture, colour (${spec.color}), lighting, and background (${spec.background}), generate the matching FULL-LENGTH BACK VIEW fashion photograph.`,
    `Show the exact same model wearing the exact same ${spec.color} ${spec.fabric} ${spec.garmentType} turned 180 degrees facing away from the camera in a natural full-length standing pose, with the entire back of the garment visible from shoulders to the complete floor hem.`,
    `Back construction: ${spec.backDesign}. Sleeves: ${spec.sleeves}. Surface detail: ${spec.embroidery}.`,
    `Maintain identical garment colour, fabric weight and sheen, hemline, lighting, and studio background as the front reference image. Change only the viewing angle to the rear view rather than redesigning the garment. Do not render any text or labels inside the photograph.`,
    `Strictly enforce all exclusions: ${exclusionsSummary}.`
  ].join(' ');

  const sidePrompt = [
    `Using the provided front-view fashion photograph as the strict visual reference for the exact garment, model identity, fabric texture, colour (${spec.color}), lighting, and background (${spec.background}), generate the matching FULL-LENGTH SIDE PROFILE VIEW fashion photograph.`,
    `Show the exact same model wearing the exact same ${spec.color} ${spec.fabric} ${spec.garmentType} turned 90 degrees in side profile in a natural full-length standing pose, with the complete garment visible from neckline and sleeve profile down to the floor hemline.`,
    `Preserve the exact ${spec.neckline}, ${spec.sleeves}, ${spec.waistAndFit}, and ${spec.embroidery}.`,
    `Maintain identical garment colour, fabric drape, lighting, and studio background as the front reference image. Change only the viewing angle to the side profile rather than redesigning the garment. Do not render any text or labels inside the photograph.`,
    `Strictly enforce all exclusions: ${exclusionsSummary}.`
  ].join(' ');

  const detailPrompt = [
    `Using the provided front-view fashion photograph as the strict visual reference for the exact garment, generate a photorealistic CLOSE-UP MACRO fashion photograph of the fabric and surface craftsmanship of this exact ${spec.color} ${spec.fabric} ${spec.garmentType}.`,
    `Show realistic physical textile weave, thread grain, precision seam stitching, natural fabric folds, and the exact surface finish (${spec.embroidery}) under soft photographic studio lighting.`,
    `Preserve the exact ${spec.color} colour and ${spec.fabric} material properties from the reference photograph. Do not invent unrequested motifs or change the colour. Do not render any text or labels inside the photograph.`,
    `Strictly enforce all exclusions: ${exclusionsSummary}.`
  ].join(' ');

  return {
    garmentSpecificationSummary: specParts.join(' • '),
    exclusionsSummary,
    frontPrompt,
    backPrompt,
    sidePrompt,
    detailPrompt
  };
}
