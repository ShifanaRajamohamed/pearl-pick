export interface CoutureVisualSpec {
  gender?: 'women' | 'men' | string;
  dressType?: string;
  color?: string;
  fabric?: string;
  neckline?: string;
  sleeve?: string;
  pattern?: string;
  occasion?: string;
  title?: string;
  prompt?: string;
  angle?: 'front' | 'back' | 'side' | 'detail';
}

interface ColorPaletteTheme {
  name: string;
  primary: string;
  secondary: string;
  highlight: string;
  deepShadow: string;
  accentMetallic: string;
  embroidery: string;
  studioBgTop: string;
  studioBgBottom: string;
}

const COLOR_THEMES: Record<string, ColorPaletteTheme> = {
  pearl_blush: {
    name: 'Pearl Blush',
    primary: '#E8C5CC',
    secondary: '#D4A5B0',
    highlight: '#F9ECEF',
    deepShadow: '#9E6B78',
    accentMetallic: '#D4AF37',
    embroidery: '#FFFDF9',
    studioBgTop: '#262022',
    studioBgBottom: '#171314'
  },
  rani_pink: {
    name: 'Rani Gulabi Pink',
    primary: '#C92A6A',
    secondary: '#9E194E',
    highlight: '#EA6699',
    deepShadow: '#630C30',
    accentMetallic: '#F3C65F',
    embroidery: '#FFE599',
    studioBgTop: '#281820',
    studioBgBottom: '#160D12'
  },
  sindoor_red: {
    name: 'Sindoor Crimson Red',
    primary: '#A81C2E',
    secondary: '#7D101E',
    highlight: '#D64556',
    deepShadow: '#4D0710',
    accentMetallic: '#E5BD52',
    embroidery: '#F7DF94',
    studioBgTop: '#291719',
    studioBgBottom: '#170C0E'
  },
  ivory_gold: {
    name: 'Antique Gold & Ivory',
    primary: '#EAE1D0',
    secondary: '#CFC0A6',
    highlight: '#FAF6EE',
    deepShadow: '#948367',
    accentMetallic: '#C89D3C',
    embroidery: '#D4AF37',
    studioBgTop: '#26231E',
    studioBgBottom: '#151310'
  },
  midnight_navy: {
    name: 'Midnight Royal Navy',
    primary: '#1B2E4B',
    secondary: '#111E34',
    highlight: '#365580',
    deepShadow: '#09111F',
    accentMetallic: '#D4AF37',
    embroidery: '#E6C875',
    studioBgTop: '#161D29',
    studioBgBottom: '#0C1017'
  },
  peacock_blue: {
    name: 'Morpankhi Peacock Blue',
    primary: '#0F5278',
    secondary: '#093854',
    highlight: '#297BA8',
    deepShadow: '#052233',
    accentMetallic: '#DFB957',
    embroidery: '#B8E2F2',
    studioBgTop: '#14232B',
    studioBgBottom: '#0B1318'
  },
  sage_green: {
    name: 'Sage Mehendi Green',
    primary: '#687D63',
    secondary: '#4B5C47',
    highlight: '#8FA68A',
    deepShadow: '#2F3B2C',
    accentMetallic: '#D4AF37',
    embroidery: '#F0EAD6',
    studioBgTop: '#1E241D',
    studioBgBottom: '#111410'
  },
  imperial_emerald: {
    name: 'Imperial Emerald',
    primary: '#165B40',
    secondary: '#0D3D2A',
    highlight: '#2C8562',
    deepShadow: '#062418',
    accentMetallic: '#E2BA53',
    embroidery: '#F4DC92',
    studioBgTop: '#14241E',
    studioBgBottom: '#0A1310'
  },
  antique_gold: {
    name: 'Haldi Antique Gold',
    primary: '#C99838',
    secondary: '#9E721E',
    highlight: '#E8BE68',
    deepShadow: '#66470C',
    accentMetallic: '#FFF2C2',
    embroidery: '#FFF8E0',
    studioBgTop: '#262015',
    studioBgBottom: '#14110B'
  },
  bordeaux_wine: {
    name: 'Bordeaux Wine Velvet',
    primary: '#5E1933',
    secondary: '#3F0E20',
    highlight: '#8A3052',
    deepShadow: '#240611',
    accentMetallic: '#D9B14E',
    embroidery: '#F0D58C',
    studioBgTop: '#24151B',
    studioBgBottom: '#130B0E'
  },
  midnight_obsidian: {
    name: 'Kashi Midnight Obsidian',
    primary: '#222024',
    secondary: '#151317',
    highlight: '#423E47',
    deepShadow: '#09080A',
    accentMetallic: '#D4AF37',
    embroidery: '#E5C467',
    studioBgTop: '#211E1C',
    studioBgBottom: '#12100F'
  },
  charcoal_slate: {
    name: 'Charcoal Savile Slate',
    primary: '#3A3E45',
    secondary: '#26292E',
    highlight: '#595F69',
    deepShadow: '#15171A',
    accentMetallic: '#C9A959',
    embroidery: '#E0D6C3',
    studioBgTop: '#1E2024',
    studioBgBottom: '#111214'
  },
  lavender_mist: {
    name: 'Lavender Gulmarg Mist',
    primary: '#B59EC4',
    secondary: '#8E759E',
    highlight: '#D6C5E3',
    deepShadow: '#584466',
    accentMetallic: '#DFC57B',
    embroidery: '#FAF2FF',
    studioBgTop: '#221E26',
    studioBgBottom: '#131016'
  }
};

export function resolveColorTheme(colorStr: string = '', promptStr: string = ''): ColorPaletteTheme {
  const combined = `${colorStr} ${promptStr}`.toLowerCase();
  if (combined.includes('rani') || combined.includes('fuchsia') || combined.includes('magenta') || combined.includes('hot pink')) {
    return COLOR_THEMES.rani_pink;
  }
  if (combined.includes('red') || combined.includes('sindoor') || combined.includes('crimson') || combined.includes('ruby') || combined.includes('scarlet')) {
    return COLOR_THEMES.sindoor_red;
  }
  if (combined.includes('emerald') || combined.includes('forest') || combined.includes('bottle green')) {
    return COLOR_THEMES.imperial_emerald;
  }
  if (combined.includes('sage') || combined.includes('mehendi') || combined.includes('olive') || combined.includes('mint') || combined.includes('green')) {
    return COLOR_THEMES.sage_green;
  }
  if (combined.includes('peacock') || combined.includes('morpankhi') || combined.includes('teal') || combined.includes('turquoise') || combined.includes('sapphire')) {
    return COLOR_THEMES.peacock_blue;
  }
  if (combined.includes('navy') || combined.includes('midnight blue') || combined.includes('royal blue') || combined.includes('blue')) {
    return COLOR_THEMES.midnight_navy;
  }
  if (combined.includes('bordeaux') || combined.includes('wine') || combined.includes('burgundy') || combined.includes('maroon') || combined.includes('plum')) {
    return COLOR_THEMES.bordeaux_wine;
  }
  if (combined.includes('obsidian') || combined.includes('black') || combined.includes('kashi') || combined.includes('onyx')) {
    return COLOR_THEMES.midnight_obsidian;
  }
  if (combined.includes('charcoal') || combined.includes('slate') || combined.includes('grey') || combined.includes('gray')) {
    return COLOR_THEMES.charcoal_slate;
  }
  if (combined.includes('lavender') || combined.includes('lilac') || combined.includes('purple') || combined.includes('violet')) {
    return COLOR_THEMES.lavender_mist;
  }
  if (combined.includes('ivory') || combined.includes('white') || combined.includes('cream') || combined.includes('champagne') || combined.includes('off-white')) {
    return COLOR_THEMES.ivory_gold;
  }
  if (combined.includes('gold') || combined.includes('haldi') || combined.includes('ochre') || combined.includes('yellow') || combined.includes('mustard')) {
    return COLOR_THEMES.antique_gold;
  }
  if (combined.includes('blush') || combined.includes('pearl') || combined.includes('rose') || combined.includes('pastel') || combined.includes('pink') || combined.includes('peach')) {
    return COLOR_THEMES.pearl_blush;
  }
  return COLOR_THEMES.pearl_blush;
}

type GarmentSilhouette =
  | 'lehenga'
  | 'gown'
  | 'anarkali'
  | 'saree'
  | 'corset'
  | 'bandhgala'
  | 'tuxedo'
  | 'sherwani'
  | 'nehru'
  | 'blazer';

function resolveSilhouette(spec: CoutureVisualSpec): { gender: 'women' | 'men'; silhouette: GarmentSilhouette; label: string } {
  const combined = `${spec.dressType || ''} ${spec.prompt || ''}`.toLowerCase();
  const isMen =
    spec.gender === 'men' ||
    combined.includes('bandhgala') ||
    combined.includes('tuxedo') ||
    combined.includes('sherwani') ||
    combined.includes('nehru') ||
    combined.includes('bundi') ||
    combined.includes('blazer') ||
    combined.includes('achkan') ||
    combined.includes('safari') ||
    combined.includes('menswear') ||
    combined.includes('groom');

  if (isMen) {
    if (combined.includes('tuxedo') || combined.includes('dinner')) {
      return { gender: 'men', silhouette: 'tuxedo', label: 'Savile Row 3-Piece Tuxedo' };
    }
    if (combined.includes('sherwani') || combined.includes('achkan')) {
      return { gender: 'men', silhouette: 'sherwani', label: 'Imperial Awadh Sherwani' };
    }
    if (combined.includes('nehru') || combined.includes('bundi') || combined.includes('kurta')) {
      return { gender: 'men', silhouette: 'nehru', label: 'Bespoke Nehru Jacket & Kurta' };
    }
    if (combined.includes('blazer') || combined.includes('safari') || combined.includes('suit')) {
      return { gender: 'men', silhouette: 'blazer', label: 'Italian Double-Breasted Suit' };
    }
    return { gender: 'men', silhouette: 'bandhgala', label: 'Royal Jodhpuri Bandhgala' };
  }

  if (combined.includes('lehenga') || combined.includes('choli') || combined.includes('ghagra')) {
    return { gender: 'women', silhouette: 'lehenga', label: 'Royal Bridal Lehenga & Choli' };
  }
  if (combined.includes('anarkali') || combined.includes('sharara') || combined.includes('kalidar')) {
    return { gender: 'women', silhouette: 'anarkali', label: 'Floor-Length Kalidar Anarkali' };
  }
  if (combined.includes('saree') || combined.includes('sari') || combined.includes('kanjeevaram')) {
    return { gender: 'women', silhouette: 'saree', label: 'Sculpted Kanjeevaram Saree Gown' };
  }
  if (combined.includes('corset') || combined.includes('basque')) {
    return { gender: 'women', silhouette: 'corset', label: 'Boned Basque Corset Couture' };
  }
  return { gender: 'women', silhouette: 'gown', label: 'Haute Couture Evening Gown' };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateCoutureSVGDataUri(spec: CoutureVisualSpec): string {
  const { gender, silhouette, label } = resolveSilhouette(spec);
  const theme = resolveColorTheme(spec.color, spec.prompt);
  const angle = spec.angle || 'front';
  const fabricLabel = spec.fabric || (gender === 'men' ? 'Pure Banarasi Raw Silk' : 'Mulberry Silk Organza');
  const necklineLabel = spec.neckline || (gender === 'men' ? 'Mandarin Bandhgala Collar' : 'Sculpted Sweetheart');
  const sleeveLabel = spec.sleeve || (gender === 'men' ? 'French Tailored Cuffs' : 'Fitted Couture Sleeves');
  const patternLabel = spec.pattern || (gender === 'men' ? '24K Gold Dabka Zardozi' : 'Hand Pearl & Zardozi Work');

  const angleTitleMap = {
    front: 'FRONT SILHOUETTE',
    back: 'BACK TAILORING & CLOSURE',
    side: 'SIDE PROFILE & DRAPE',
    detail: 'MACRO WEAVE & EMBROIDERY'
  };

  let garmentArtwork = '';

  if (angle === 'detail') {
    // Macro high-precision textile weave, zardozi bullion, pearl beadwork & seam callout
    garmentArtwork = `
      <!-- Macro Fabric Drape Folds -->
      <rect x="45" y="110" width="510" height="530" rx="22" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-opacity="0.5"/>
      <path d="M 45 200 Q 190 160 310 210 T 555 190 L 555 640 L 45 640 Z" fill="url(#shadowFoldGrad)" opacity="0.55"/>
      <path d="M 45 340 Q 210 290 360 350 T 555 320 L 555 640 L 45 640 Z" fill="url(#garmentGrad)" opacity="0.8"/>

      <!-- Fine Silk Warp & Weft Micro-Grid -->
      <g stroke="${theme.highlight}" stroke-opacity="0.14" stroke-width="1">
        ${Array.from({ length: 18 }).map((_, i) => `<line x1="60" y1="${135 + i * 28}" x2="540" y2="${135 + i * 28}" />`).join('')}
        ${Array.from({ length: 16 }).map((_, i) => `<line x1="${75 + i * 30}" y1="125" x2="${75 + i * 30}" y2="625" />`).join('')}
      </g>

      <!-- Intricate Zardozi / Pearl Artisan Motif Border -->
      <g transform="translate(300, 345)">
        <circle r="135" fill="none" stroke="${theme.accentMetallic}" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>
        <circle r="102" fill="none" stroke="${theme.embroidery}" stroke-width="1.5" opacity="0.7"/>
        <circle r="68" fill="${theme.deepShadow}" fill-opacity="0.45" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
        <!-- 8-Point Royal Zardozi Floral Medallion -->
        ${Array.from({ length: 8 }).map((_, i) => {
          const deg = i * 45;
          return `<g transform="rotate(${deg})">
            <path d="M 0 -22 C 18 -46 18 -78 0 -98 C -18 -78 -18 -46 0 -22 Z" fill="${theme.accentMetallic}" fill-opacity="0.35" stroke="${theme.embroidery}" stroke-width="1.8"/>
            <circle cx="0" cy="-62" r="4.5" fill="${theme.embroidery}"/>
            <circle cx="0" cy="-115" r="5" fill="${theme.accentMetallic}"/>
          </g>`;
        }).join('')}
        <circle r="18" fill="${theme.accentMetallic}" stroke="${theme.embroidery}" stroke-width="3"/>
        <circle r="7" fill="${theme.embroidery}"/>
      </g>

      <!-- Scalloped Zari Border Along Bottom of Macro Swatch -->
      <path d="M 65 555 Q 105 530 145 555 T 225 555 T 305 555 T 385 555 T 465 555 T 535 555" fill="none" stroke="${theme.accentMetallic}" stroke-width="3.5"/>
      <path d="M 65 572 L 535 572" stroke="${theme.embroidery}" stroke-width="1.5" stroke-dasharray="3 5"/>

      <!-- Technical Callout Loupe Tags -->
      <g transform="translate(72, 142)">
        <rect width="215" height="54" rx="10" fill="#141110" fill-opacity="0.86" stroke="${theme.accentMetallic}" stroke-width="1"/>
        <text x="14" y="22" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1">PRIMARY TEXTILE WEAVE</text>
        <text x="14" y="40" fill="#FAF7F2" font-family="serif" font-size="13" font-weight="bold">${escapeXml(fabricLabel)}</text>
      </g>

      <g transform="translate(295, 568)">
        <rect width="240" height="54" rx="10" fill="#141110" fill-opacity="0.86" stroke="${theme.accentMetallic}" stroke-width="1"/>
        <text x="14" y="22" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1">ARTISAN HANDWORK &amp; SEAM</text>
        <text x="14" y="40" fill="#FAF7F2" font-family="serif" font-size="12">${escapeXml(patternLabel)}</text>
      </g>
    `;
  } else if (gender === 'men') {
    // MEN'S BESPOKE SILHOUETTES (Front, Back, Side)
    const isLongCoat = silhouette === 'sherwani';
    const isTuxedo = silhouette === 'tuxedo';
    const isNehru = silhouette === 'nehru';
    const coatBottomY = isLongCoat ? 495 : 395;

    if (angle === 'side') {
      garmentArtwork = `
        <!-- Tailored Mannequin Neck & Posture Stand (Side Profile) -->
        <rect x="288" y="102" width="24" height="36" rx="8" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>
        <line x1="300" y1="490" x2="300" y2="650" stroke="#8C7A6B" stroke-width="4"/>

        <!-- Tailored Trousers / Churidar Side Profile -->
        <path d="M 262 ${coatBottomY - 15} L 336 ${coatBottomY - 15} L 326 620 L 274 620 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        <line x1="302" y1="${coatBottomY}" x2="302" y2="620" stroke="${theme.accentMetallic}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>

        <!-- Sculpted Side Profile Coat Body -->
        <path d="M 268 134 C 242 155 236 225 244 300 L 240 ${coatBottomY} L 352 ${coatBottomY} C 358 310 356 215 332 140 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>

        <!-- Mandarin or Peak Lapel Side Roll -->
        <path d="M 274 124 L 324 132 L 320 148 L 270 140 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="1.8"/>

        <!-- Side Tailored Sleeve with Natural Pitch -->
        <path d="M 282 158 C 258 215 256 295 268 365 L 308 362 C 306 290 310 215 304 162 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <!-- Cuff Buttons -->
        <circle cx="278" cy="352" r="3" fill="${theme.accentMetallic}"/>
        <circle cx="286" cy="352" r="3" fill="${theme.accentMetallic}"/>
        <circle cx="294" cy="352" r="3" fill="${theme.accentMetallic}"/>

        <!-- Side Vent & Posture Callout -->
        <line x1="335" y1="${coatBottomY - 55}" x2="335" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
        <text x="372" y="250" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold">HORSEHAIR CHEST CANVAS</text>
        <line x1="242" y1="246" x2="365" y2="246" stroke="${theme.accentMetallic}" stroke-width="1" stroke-dasharray="3 3"/>
      `;
    } else if (angle === 'back') {
      garmentArtwork = `
        <!-- Mannequin Neck Cap -->
        <rect x="282" y="102" width="36" height="32" rx="10" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>

        <!-- Trousers / Breeches Back View -->
        <path d="M 238 ${coatBottomY - 10} L 362 ${coatBottomY - 10} L 352 622 L 306 622 L 300 475 L 294 622 L 248 622 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>

        <!-- Sleeves Back View -->
        <path d="M 205 148 L 168 358 L 204 364 L 232 195 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <path d="M 395 148 L 432 358 L 396 364 L 368 195 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>

        <!-- Back Coat Silhouette with Suppressed Waist -->
        <path d="M 205 148 Q 300 132 395 148 L 368 275 L 382 ${coatBottomY} L 218 ${coatBottomY} L 232 275 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>

        <!-- Rear Collar Band Embroidery -->
        <path d="M 266 125 Q 300 118 334 125 L 338 142 Q 300 136 262 142 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="2"/>

        <!-- Center Back Seam & Twin Savile Row Side Vents -->
        <line x1="300" y1="140" x2="300" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="242" y1="${coatBottomY - 68}" x2="242" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
        <line x1="358" y1="${coatBottomY - 68}" x2="358" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="2.5"/>

        <text x="300" y="${coatBottomY + 26}" text-anchor="middle" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1.5">TWIN SIDE VENTS &amp; SCULPTED BACK SEAM</text>
      `;
    } else {
      // MEN'S FRONT VIEW
      garmentArtwork = `
        <!-- Mannequin Neck & Brass Finial -->
        <rect x="282" y="100" width="36" height="34" rx="10" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>

        <!-- Tailored Trousers / Jodhpur Breeches / Churidar -->
        <path d="M 236 ${coatBottomY - 10} L 364 ${coatBottomY - 10} L 352 622 L 306 622 L 300 470 L 294 622 L 248 622 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.4"/>

        <!-- Sleeves Front View -->
        ${isNehru ? `
          <!-- Kurta Full Sleeves under Sleeveless Nehru Jacket -->
          <path d="M 205 148 L 166 360 L 202 366 L 232 195 Z" fill="#F5EFE6" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
          <path d="M 395 148 L 434 360 L 398 366 L 368 195 Z" fill="#F5EFE6" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        ` : `
          <path d="M 205 148 L 166 360 L 202 366 L 232 195 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
          <path d="M 395 148 L 434 360 L 398 366 L 368 195 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
        `}

        <!-- Main Coat / Bandhgala / Sherwani / Tuxedo Torso -->
        <path d="M 205 148 Q 300 134 395 148 L 368 272 L 382 ${coatBottomY} L 302 ${coatBottomY} L 300 ${coatBottomY - 18} L 298 ${coatBottomY} L 218 ${coatBottomY} L 232 272 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>

        ${isTuxedo ? `
          <!-- Crisp White Pleated Tuxedo Shirt V-Bib & Bowtie -->
          <polygon points="266,136 334,136 300,265" fill="#FAF8F5" stroke="${theme.accentMetallic}" stroke-width="1"/>
          <!-- Black Satin Peak Lapels -->
          <polygon points="264,136 232,195 300,268" fill="#141316" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
          <polygon points="336,136 368,195 300,268" fill="#141316" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
          <!-- Silk Bowtie -->
          <polygon points="282,142 300,150 282,158" fill="#141316"/>
          <polygon points="318,142 300,150 318,158" fill="#141316"/>
          <circle cx="300" cy="150" r="4" fill="${theme.accentMetallic}"/>
        ` : `
          <!-- Mandarin Bandhgala / Sherwani Collar with Zardozi Gold Embroidery -->
          <path d="M 264 124 Q 300 134 336 124 L 340 145 Q 300 155 260 145 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <!-- Intricate Zardozi Collar & Shoulder Motifs -->
          <path d="M 248 158 Q 300 178 352 158" fill="none" stroke="${theme.accentMetallic}" stroke-width="2" stroke-dasharray="3 3"/>
        `}

        <!-- Center Placket & Lion-Crest / Bespoke Buttons -->
        <line x1="300" y1="${isTuxedo ? 265 : 148}" x2="300" y2="${coatBottomY - 12}" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        ${Array.from({ length: isLongCoat ? 7 : isTuxedo ? 2 : 5 }).map((_, i) => {
          const cy = (isTuxedo ? 285 : 172) + i * 38;
          return `<g>
            <circle cx="300" cy="${cy}" r="5.5" fill="${theme.accentMetallic}" stroke="#FFF" stroke-width="1"/>
            <circle cx="300" cy="${cy}" r="2" fill="${theme.deepShadow}"/>
          </g>`;
        }).join('')}

        <!-- Bespoke Silk Pocket Square & Polki Brooch -->
        <path d="M 326 208 L 358 208 L 350 192 L 336 198 Z" fill="${theme.embroidery}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        <rect x="324" y="208" width="36" height="6" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="1"/>

        ${isLongCoat ? `
          <!-- Royal Draped Silk Stole (Dupatta) & Zari Hem Border -->
          <path d="M 225 148 Q 245 310 232 520 L 262 520 Q 272 310 258 148 Z" fill="${theme.embroidery}" fill-opacity="0.22" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
          <rect x="218" y="${coatBottomY - 22}" width="164" height="22" fill="${theme.accentMetallic}" fill-opacity="0.28" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        ` : ''}
      `;
    }
  } else {
    // WOMEN'S COUTURE SILHOUETTES (Lehenga, Gown, Anarkali, Saree Gown, Corset)
    const isLehenga = silhouette === 'lehenga';
    const isSaree = silhouette === 'saree';
    const isAnarkali = silhouette === 'anarkali';

    if (angle === 'side') {
      garmentArtwork = `
        <!-- Couture Mannequin Neck (Side Profile) -->
        <rect x="288" y="102" width="22" height="34" rx="8" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>

        <!-- Side Bodice / Corset Profile -->
        <path d="M 272 136 C 250 162 248 205 266 258 L 326 258 C 334 210 330 165 314 136 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>

        <!-- Side Flared Skirt & Sweeping Train Profile -->
        <path d="M 266 258 C 232 360 195 495 162 615 L 455 615 C 412 505 365 375 326 258 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>

        <!-- Kali Architectural Pleat Lines in Side View -->
        <path d="M 280 258 L 222 615" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <path d="M 296 258 L 295 615" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <path d="M 312 258 L 378 615" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>

        <!-- Sheer Organza Dupatta / Cape Drape Flowing Behind -->
        <path d="M 305 152 C 365 230 415 380 468 585 L 385 605 C 345 420 322 260 292 165 Z" fill="${theme.highlight}" fill-opacity="0.28" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-dasharray="4 2"/>

        <!-- Heavy Zardozi Hem Border -->
        <path d="M 162 588 L 455 588 L 455 615 L 162 615 Z" fill="${theme.accentMetallic}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="2"/>
      `;
    } else if (angle === 'back') {
      garmentArtwork = `
        <!-- Couture Mannequin Neck -->
        <rect x="284" y="102" width="32" height="32" rx="10" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>

        <!-- Sleeves Back View -->
        <path d="M 225 148 L 188 265 L 214 272 L 242 182 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <path d="M 375 148 L 412 265 L 386 272 L 358 182 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>

        <!-- Back Bodice / Choli with Deep U & Latkan Dori Tassels -->
        <path d="M 225 148 L 265 142 C 268 205 332 205 335 142 L 375 148 L 346 254 L 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <!-- Back Dori Tie & Pearl Latkan Tassels -->
        <line x1="262" y1="162" x2="338" y2="162" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <line x1="300" y1="162" x2="290" y2="218" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <line x1="300" y1="162" x2="310" y2="218" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <polygon points="290,215 282,232 298,232" fill="${theme.accentMetallic}"/>
        <polygon points="310,215 302,232 318,232" fill="${theme.accentMetallic}"/>

        <!-- Back Flared Lehenga / Gown Skirt with Sweeping Train -->
        <path d="M 254 262 L 346 262 C 392 385 438 505 462 618 Q 300 642 138 618 C 162 505 208 385 254 262 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>

        <!-- Back Kali Panels -->
        <line x1="272" y1="262" x2="195" y2="622" stroke="${theme.accentMetallic}" stroke-width="1.1" opacity="0.6"/>
        <line x1="290" y1="262" x2="262" y2="628" stroke="${theme.accentMetallic}" stroke-width="1.1" opacity="0.6"/>
        <line x1="310" y1="262" x2="338" y2="628" stroke="${theme.accentMetallic}" stroke-width="1.1" opacity="0.6"/>
        <line x1="328" y1="262" x2="405" y2="622" stroke="${theme.accentMetallic}" stroke-width="1.1" opacity="0.6"/>

        <!-- Royal Zardozi Back Hem Border -->
        <path d="M 144 590 Q 300 614 456 590 L 462 618 Q 300 642 138 618 Z" fill="${theme.accentMetallic}" fill-opacity="0.35" stroke="${theme.accentMetallic}" stroke-width="2"/>
      `;
    } else {
      // WOMEN'S FRONT VIEW (Lehenga, Gown, Anarkali, Saree, Corset)
      const waistY = isLehenga ? 250 : 258;
      const skirtTopY = isLehenga ? 264 : 258;

      garmentArtwork = `
        <!-- Couture Mannequin Neck & Jewellery Choker -->
        <rect x="284" y="100" width="32" height="34" rx="10" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>
        <path d="M 278 126 Q 300 136 322 126" fill="none" stroke="${theme.accentMetallic}" stroke-width="4"/>

        <!-- Sleeves -->
        <path d="M 224 146 L 182 268 L 210 275 L 244 185 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
        <path d="M 376 146 L 418 268 L 390 275 L 356 185 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>

        <!-- Sculpted Choli / Bodice with Sweetheart / Regal Neckline -->
        <path d="M 224 146 L 265 142 Q 300 176 335 142 L 376 146 L 346 ${waistY} Q 300 ${waistY + 12} 254 ${waistY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>

        <!-- Bodice Pearl / Zardozi Constellation -->
        <circle cx="278" cy="188" r="3" fill="${theme.embroidery}"/>
        <circle cx="300" cy="196" r="4" fill="${theme.accentMetallic}"/>
        <circle cx="322" cy="188" r="3" fill="${theme.embroidery}"/>
        <circle cx="286" cy="216" r="2.5" fill="${theme.embroidery}"/>
        <circle cx="314" cy="216" r="2.5" fill="${theme.embroidery}"/>
        <path d="M 258 ${waistY - 6} Q 300 ${waistY + 6} 342 ${waistY - 6}" fill="none" stroke="${theme.accentMetallic}" stroke-width="3"/>

        <!-- 16-Kali Flared Lehenga / Couture Gown / Anarkali Skirt -->
        <path d="M 254 ${skirtTopY} L 346 ${skirtTopY} C 394 382 440 505 466 618 Q 300 638 134 618 C 160 505 206 382 254 ${skirtTopY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>

        <!-- Architectural Kali Panel Lines & Floral Motifs -->
        <line x1="270" y1="${skirtTopY}" x2="188" y2="620" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <line x1="285" y1="${skirtTopY}" x2="244" y2="625" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <line x1="300" y1="${skirtTopY}" x2="300" y2="628" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <line x1="315" y1="${skirtTopY}" x2="356" y2="625" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
        <line x1="330" y1="${skirtTopY}" x2="412" y2="620" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>

        <!-- Pearl & Zardozi Butti Motifs Across Skirt -->
        ${[
          [225, 420], [275, 435], [325, 435], [375, 420],
          [195, 515], [250, 530], [300, 535], [350, 530], [405, 515]
        ].map(([cx, cy]) => `
          <g transform="translate(${cx}, ${cy})">
            <circle r="7" fill="${theme.accentMetallic}" fill-opacity="0.3" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
            <circle r="2.5" fill="${theme.embroidery}"/>
          </g>
        `).join('')}

        ${(isLehenga || isSaree || isAnarkali) ? `
          <!-- Diagonal Sheer Organza / Saree Pallu Drape Across Bodice -->
          <path d="M 366 144 C 335 235 268 335 178 445 L 154 395 C 238 300 302 215 335 142 Z" fill="${theme.highlight}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="2"/>
        ` : ''}

        <!-- Broad Scalloped Temple Zari Hem Border -->
        <path d="M 140 584 Q 300 606 460 584 L 466 618 Q 300 638 134 618 Z" fill="${theme.accentMetallic}" fill-opacity="0.36" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
    <defs>
      <linearGradient id="studioBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${theme.studioBgTop}"/>
        <stop offset="100%" stop-color="${theme.studioBgBottom}"/>
      </linearGradient>
      <radialGradient id="spotlight" cx="50%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.28"/>
        <stop offset="60%" stop-color="${theme.accentMetallic}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="garmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.highlight}"/>
        <stop offset="35%" stop-color="${theme.primary}"/>
        <stop offset="78%" stop-color="${theme.secondary}"/>
        <stop offset="100%" stop-color="${theme.deepShadow}"/>
      </linearGradient>
      <linearGradient id="shadowFoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${theme.deepShadow}"/>
        <stop offset="50%" stop-color="${theme.secondary}"/>
        <stop offset="100%" stop-color="${theme.primary}"/>
      </linearGradient>
    </defs>

    <!-- Studio Backdrop -->
    <rect width="600" height="800" fill="url(#studioBg)"/>
    <rect width="600" height="800" fill="url(#spotlight)"/>

    <!-- Subtle Architectural Atelier Arch Frame -->
    <path d="M 36 690 L 36 190 A 264 150 0 0 1 564 190 L 564 690" fill="none" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.25"/>
    <line x1="36" y1="650" x2="564" y2="650" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.25"/>

    <!-- Top Atelier Header Pill -->
    <g transform="translate(36, 28)">
      <rect width="230" height="30" rx="15" fill="#141110" fill-opacity="0.8" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.5"/>
      <circle cx="18" cy="15" r="5" fill="${theme.primary}" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
      <text x="32" y="19" fill="#FAF7F2" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1.2">${escapeXml(angleTitleMap[angle])}</text>
    </g>

    <!-- Main Garment Render -->
    ${garmentArtwork}

    <!-- Bottom Atelier Specification Plate -->
    <g transform="translate(30, 675)">
      <rect width="540" height="96" rx="18" fill="#181413" fill-opacity="0.92" stroke="${theme.accentMetallic}" stroke-width="1.2" stroke-opacity="0.55"/>
      <!-- Live Fabric Color Swatch Circle -->
      <circle cx="46" cy="48" r="24" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
      <circle cx="46" cy="48" r="17" fill="none" stroke="${theme.embroidery}" stroke-width="1" stroke-dasharray="2 2"/>

      <text x="86" y="32" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1.5">PEARL PICK ATELIER • ${gender === 'men' ? "MEN'S BESPOKE" : "WOMEN'S COUTURE"}</text>
      <text x="86" y="54" fill="#FAF7F2" font-family="serif" font-size="18" font-weight="bold">${escapeXml(spec.color || theme.name)} — ${escapeXml(spec.dressType || label)}</text>
      <text x="86" y="76" fill="#C7BDB6" font-family="sans-serif" font-size="11">${escapeXml(fabricLabel)} • ${escapeXml(necklineLabel)} • ${escapeXml(sleeveLabel)}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateCohesiveCoutureAngles(spec: Omit<CoutureVisualSpec, 'angle'>): {
  front: string;
  back: string;
  side: string;
  detail: string;
} {
  return {
    front: generateCoutureSVGDataUri({ ...spec, angle: 'front' }),
    back: generateCoutureSVGDataUri({ ...spec, angle: 'back' }),
    side: generateCoutureSVGDataUri({ ...spec, angle: 'side' }),
    detail: generateCoutureSVGDataUri({ ...spec, angle: 'detail' })
  };
}
