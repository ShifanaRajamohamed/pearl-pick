export interface CustomColorHexPalette {
  name?: string;
  primary: string;
  secondary: string;
  highlight: string;
  deepShadow: string;
  accentMetallic: string;
  embroidery: string;
  studioBgTop?: string;
  studioBgBottom?: string;
}

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
  customPalette?: Partial<CustomColorHexPalette>;
  aiSilhouette?: string;
  aiNeckline?: string;
  aiSleeve?: string;
  aiPattern?: string;
}

export interface ColorPaletteTheme {
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
    name: 'Pearl Blush Pink',
    primary: '#E8C5CC',
    secondary: '#D4A5B0',
    highlight: '#F9ECEF',
    deepShadow: '#9E6B78',
    accentMetallic: '#D4AF37',
    embroidery: '#FFFDF9',
    studioBgTop: '#262022',
    studioBgBottom: '#171314'
  },
  baby_pink: {
    name: 'Pastel Rose Pink',
    primary: '#F4B8C8',
    secondary: '#DC8FA3',
    highlight: '#FDE4EC',
    deepShadow: '#9E5468',
    accentMetallic: '#E5C158',
    embroidery: '#FFFDF9',
    studioBgTop: '#261E21',
    studioBgBottom: '#161113'
  },
  rani_pink: {
    name: 'Rani Gulabi Pink',
    primary: '#D81B60',
    secondary: '#AD1457',
    highlight: '#F06292',
    deepShadow: '#6A0B33',
    accentMetallic: '#F3C65F',
    embroidery: '#FFE599',
    studioBgTop: '#281820',
    studioBgBottom: '#160D12'
  },
  sindoor_red: {
    name: 'Sindoor Crimson Red',
    primary: '#C62828',
    secondary: '#8E0000',
    highlight: '#EF5350',
    deepShadow: '#560000',
    accentMetallic: '#E5BD52',
    embroidery: '#F7DF94',
    studioBgTop: '#291719',
    studioBgBottom: '#170C0E'
  },
  bordeaux_wine: {
    name: 'Burgundy Wine Maroon',
    primary: '#6A1B29',
    secondary: '#4A101B',
    highlight: '#963547',
    deepShadow: '#2A070D',
    accentMetallic: '#D9B14E',
    embroidery: '#F0D58C',
    studioBgTop: '#24151B',
    studioBgBottom: '#130B0E'
  },
  haldi_yellow: {
    name: 'Haldi Sunshine Yellow',
    primary: '#FBC02D',
    secondary: '#F57F17',
    highlight: '#FFF176',
    deepShadow: '#B26A00',
    accentMetallic: '#D4AF37',
    embroidery: '#FFFDE7',
    studioBgTop: '#282315',
    studioBgBottom: '#16130B'
  },
  antique_gold: {
    name: 'Champagne & Antique Gold',
    primary: '#D4AF37',
    secondary: '#AA8219',
    highlight: '#F3D77D',
    deepShadow: '#6E5008',
    accentMetallic: '#FFF2C2',
    embroidery: '#FFF8E0',
    studioBgTop: '#262015',
    studioBgBottom: '#14110B'
  },
  sunset_orange: {
    name: 'Marigold Tangerine Orange',
    primary: '#EF6C00',
    secondary: '#BF360C',
    highlight: '#FFA726',
    deepShadow: '#7F1D00',
    accentMetallic: '#F3C65F',
    embroidery: '#FFF3E0',
    studioBgTop: '#291B14',
    studioBgBottom: '#170E0A'
  },
  coral_peach: {
    name: 'Coral Sunset Peach',
    primary: '#FF8A65',
    secondary: '#D85A3A',
    highlight: '#FFBB93',
    deepShadow: '#94351C',
    accentMetallic: '#E6C267',
    embroidery: '#FFF8F5',
    studioBgTop: '#281E1B',
    studioBgBottom: '#16100E'
  },
  ivory_gold: {
    name: 'Moonlight Ivory & White',
    primary: '#F5F0E6',
    secondary: '#D8CEBE',
    highlight: '#FFFFFF',
    deepShadow: '#9E9382',
    accentMetallic: '#C89D3C',
    embroidery: '#D4AF37',
    studioBgTop: '#26231E',
    studioBgBottom: '#151310'
  },
  silver_platinum: {
    name: 'Metallic Silver & Platinum',
    primary: '#CFD8DC',
    secondary: '#90A4AE',
    highlight: '#ECEFF1',
    deepShadow: '#546E7A',
    accentMetallic: '#E0E0E0',
    embroidery: '#FFFFFF',
    studioBgTop: '#1E2226',
    studioBgBottom: '#111316'
  },
  sky_blue: {
    name: 'Powder Ice Blue',
    primary: '#64B5F6',
    secondary: '#1E88E5',
    highlight: '#BBDEFB',
    deepShadow: '#0D47A1',
    accentMetallic: '#E0E0E0',
    embroidery: '#F5FAFF',
    studioBgTop: '#16222E',
    studioBgBottom: '#0C131A'
  },
  royal_blue: {
    name: 'Sapphire Royal Blue',
    primary: '#1565C0',
    secondary: '#0D47A1',
    highlight: '#42A5F5',
    deepShadow: '#062659',
    accentMetallic: '#E5C158',
    embroidery: '#E3F2FD',
    studioBgTop: '#141E30',
    studioBgBottom: '#0A101A'
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
    name: 'Morpankhi Peacock Teal',
    primary: '#00838F',
    secondary: '#005662',
    highlight: '#4FB3BF',
    deepShadow: '#002F36',
    accentMetallic: '#DFB957',
    embroidery: '#E0F7FA',
    studioBgTop: '#14232B',
    studioBgBottom: '#0B1318'
  },
  imperial_emerald: {
    name: 'Imperial Emerald Green',
    primary: '#1B7A4E',
    secondary: '#0F4D30',
    highlight: '#38A873',
    deepShadow: '#062918',
    accentMetallic: '#E2BA53',
    embroidery: '#F4DC92',
    studioBgTop: '#14241E',
    studioBgBottom: '#0A1310'
  },
  sage_green: {
    name: 'Sage Mehendi Green',
    primary: '#688E63',
    secondary: '#496645',
    highlight: '#98BD93',
    deepShadow: '#2B3E28',
    accentMetallic: '#D4AF37',
    embroidery: '#F0EAD6',
    studioBgTop: '#1E241D',
    studioBgBottom: '#111410'
  },
  mint_green: {
    name: 'Pistachio Mint Green',
    primary: '#80CBC4',
    secondary: '#4DB6AC',
    highlight: '#B2DFDB',
    deepShadow: '#00695C',
    accentMetallic: '#D4AF37',
    embroidery: '#E0F2F1',
    studioBgTop: '#172624',
    studioBgBottom: '#0D1514'
  },
  lavender_mist: {
    name: 'Lavender Lilac Mist',
    primary: '#AB87C9',
    secondary: '#7E57C2',
    highlight: '#D1C4E9',
    deepShadow: '#4527A0',
    accentMetallic: '#DFC57B',
    embroidery: '#FAF2FF',
    studioBgTop: '#221E26',
    studioBgBottom: '#131016'
  },
  royal_purple: {
    name: 'Regal Amethyst Purple',
    primary: '#6A1B9A',
    secondary: '#4A148C',
    highlight: '#9C4DCC',
    deepShadow: '#290654',
    accentMetallic: '#F3C65F',
    embroidery: '#F3E5F5',
    studioBgTop: '#21152B',
    studioBgBottom: '#120B17'
  },
  chocolate_brown: {
    name: 'Espresso Bronze Brown',
    primary: '#5D4037',
    secondary: '#3E2723',
    highlight: '#8D6E63',
    deepShadow: '#1B0F0D',
    accentMetallic: '#D4AF37',
    embroidery: '#EFEBE9',
    studioBgTop: '#241C19',
    studioBgBottom: '#130E0D'
  },
  midnight_obsidian: {
    name: 'Midnight Obsidian Black',
    primary: '#262429',
    secondary: '#161518',
    highlight: '#4A4652',
    deepShadow: '#09080A',
    accentMetallic: '#D4AF37',
    embroidery: '#E5C467',
    studioBgTop: '#211E1C',
    studioBgBottom: '#12100F'
  },
  charcoal_slate: {
    name: 'Charcoal Savile Grey',
    primary: '#454B54',
    secondary: '#2B2F36',
    highlight: '#6C7582',
    deepShadow: '#15171A',
    accentMetallic: '#C9A959',
    embroidery: '#E0D6C3',
    studioBgTop: '#1E2024',
    studioBgBottom: '#111214'
  }
};

export type GarmentSilhouette =
  | 'lehenga'
  | 'saree'
  | 'anarkali'
  | 'sharara'
  | 'kurti'
  | 'mermaid'
  | 'bodycon'
  | 'cocktail'
  | 'ballgown'
  | 'corset'
  | 'gown'
  | 'bandhgala'
  | 'tuxedo'
  | 'sherwani'
  | 'nehru'
  | 'blazer';

export type NecklineCut =
  | 'sweetheart'
  | 'v-neck'
  | 'off-shoulder'
  | 'one-shoulder'
  | 'halter'
  | 'high-neck'
  | 'square'
  | 'boat'
  | 'round';

export type SleeveCut =
  | 'sleeveless'
  | 'off-shoulder'
  | 'short'
  | 'puff'
  | 'bell'
  | 'cape'
  | 'three-quarter'
  | 'long';

export type PatternMotif =
  | 'zardozi'
  | 'floral'
  | 'mirror'
  | 'sequin'
  | 'pearl'
  | 'chikankari'
  | 'checks'
  | 'minimal';

// Clean bracketed metadata tags so raw customer prompt takes top priority
function stripInjectedBrackets(rawPrompt: string = ''): string {
  return rawPrompt.replace(/\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function matchColorFromText(text: string): ColorPaletteTheme | null {
  const s = text.toLowerCase();
  if (s.includes('rani') || s.includes('fuchsia') || s.includes('magenta') || s.includes('hot pink') || s.includes('berry')) {
    return COLOR_THEMES.rani_pink;
  }
  if (s.includes('red') || s.includes('sindoor') || s.includes('crimson') || s.includes('scarlet') || s.includes('ruby') || s.includes('vermilion') || s.includes('cherry')) {
    return COLOR_THEMES.sindoor_red;
  }
  if (s.includes('wine') || s.includes('burgundy') || s.includes('maroon') || s.includes('bordeaux') || s.includes('oxblood')) {
    return COLOR_THEMES.bordeaux_wine;
  }
  if (s.includes('yellow') || s.includes('haldi') || s.includes('mustard') || s.includes('sunflower') || s.includes('lemon') || s.includes('canary') || s.includes('turmeric')) {
    return COLOR_THEMES.haldi_yellow;
  }
  if (s.includes('orange') || s.includes('tangerine') || s.includes('marigold') || s.includes('rust') || s.includes('terracotta') || s.includes('burnt') || s.includes('saffron')) {
    return COLOR_THEMES.sunset_orange;
  }
  if (s.includes('coral') || s.includes('peach') || s.includes('salmon') || s.includes('apricot')) {
    return COLOR_THEMES.coral_peach;
  }
  if (s.includes('emerald') || s.includes('bottle green') || s.includes('forest green') || s.includes('dark green') || s.includes('jade')) {
    return COLOR_THEMES.imperial_emerald;
  }
  if (s.includes('mint') || s.includes('pistachio') || s.includes('seafoam') || s.includes('aqua')) {
    return COLOR_THEMES.mint_green;
  }
  if (s.includes('sage') || s.includes('mehendi') || s.includes('olive') || s.includes('moss') || s.includes('green') || s.includes('lime')) {
    return COLOR_THEMES.sage_green;
  }
  if (s.includes('peacock') || s.includes('morpankhi') || s.includes('teal') || s.includes('turquoise') || s.includes('cyan')) {
    return COLOR_THEMES.peacock_blue;
  }
  if (s.includes('sky blue') || s.includes('ice blue') || s.includes('powder blue') || s.includes('baby blue') || s.includes('light blue') || s.includes('pastel blue') || s.includes('cerulean')) {
    return COLOR_THEMES.sky_blue;
  }
  if (s.includes('royal blue') || s.includes('cobalt') || s.includes('sapphire') || s.includes('electric blue') || s.includes('blue')) {
    if (s.includes('navy') || s.includes('midnight')) return COLOR_THEMES.midnight_navy;
    return COLOR_THEMES.royal_blue;
  }
  if (s.includes('navy') || s.includes('midnight blue') || s.includes('indigo')) {
    return COLOR_THEMES.midnight_navy;
  }
  if (s.includes('lavender') || s.includes('lilac') || s.includes('mauve') || s.includes('periwinkle') || s.includes('orchid') || s.includes('pastel purple')) {
    return COLOR_THEMES.lavender_mist;
  }
  if (s.includes('purple') || s.includes('violet') || s.includes('plum') || s.includes('amethyst') || s.includes('eggplant') || s.includes('aubergine')) {
    return COLOR_THEMES.royal_purple;
  }
  if (s.includes('black') || s.includes('obsidian') || s.includes('kashi') || s.includes('onyx') || s.includes('jet') || s.includes('ebony')) {
    return COLOR_THEMES.midnight_obsidian;
  }
  if (s.includes('silver') || s.includes('platinum') || s.includes('chrome') || s.includes('gunmetal')) {
    return COLOR_THEMES.silver_platinum;
  }
  if (s.includes('charcoal') || s.includes('slate') || s.includes('grey') || s.includes('gray') || s.includes('ash')) {
    return COLOR_THEMES.charcoal_slate;
  }
  if (s.includes('brown') || s.includes('chocolate') || s.includes('coffee') || s.includes('espresso') || s.includes('bronze') || s.includes('copper') || s.includes('mocha') || s.includes('taupe')) {
    return COLOR_THEMES.chocolate_brown;
  }
  if (s.includes('ivory') || s.includes('white') || s.includes('cream') || s.includes('off-white') || s.includes('pearl white') || s.includes('alabaster') || s.includes('snow')) {
    return COLOR_THEMES.ivory_gold;
  }
  if (s.includes('gold') || s.includes('champagne') || s.includes('ochre') || s.includes('gilded') || s.includes('beige') || s.includes('nude') || s.includes('sand')) {
    return COLOR_THEMES.antique_gold;
  }
  if (s.includes('baby pink') || s.includes('rose') || s.includes('pastel pink') || s.includes('soft pink')) {
    return COLOR_THEMES.baby_pink;
  }
  if (s.includes('blush') || s.includes('pink') || s.includes('pearl')) {
    return COLOR_THEMES.pearl_blush;
  }
  return null;
}

export function resolveColorTheme(
  colorStr: string = '',
  promptStr: string = '',
  customPalette?: Partial<CustomColorHexPalette>
): ColorPaletteTheme {
  if (customPalette && customPalette.primary) {
    return {
      name: customPalette.name || colorStr || 'Custom Couture Shade',
      primary: customPalette.primary,
      secondary: customPalette.secondary || customPalette.primary,
      highlight: customPalette.highlight || '#FFFFFF',
      deepShadow: customPalette.deepShadow || '#1A1615',
      accentMetallic: customPalette.accentMetallic || '#D4AF37',
      embroidery: customPalette.embroidery || '#FFFDF9',
      studioBgTop: customPalette.studioBgTop || '#221E1D',
      studioBgBottom: customPalette.studioBgBottom || '#12100F'
    };
  }

  // First check the user's raw text prompt (stripped of auto-injected bracket tags) so prompt colors ALWAYS win!
  const cleanUserPrompt = stripInjectedBrackets(promptStr);
  const fromPrompt = matchColorFromText(cleanUserPrompt);
  if (fromPrompt) return fromPrompt;

  // Next check the explicit color parameter
  const fromColor = matchColorFromText(colorStr);
  if (fromColor) return fromColor;

  return COLOR_THEMES.pearl_blush;
}

export function resolveSilhouette(spec: CoutureVisualSpec): {
  gender: 'women' | 'men';
  silhouette: GarmentSilhouette;
  label: string;
} {
  const cleanPrompt = stripInjectedBrackets(spec.prompt || '');
  // Prioritize what the user wrote in their prompt first, then fallback to dressType
  const primaryText = cleanPrompt.toLowerCase();
  const secondaryText = (spec.aiSilhouette || spec.dressType || '').toLowerCase();

  const detectFromString = (s: string): { gender: 'women' | 'men'; silhouette: GarmentSilhouette; label: string } | null => {
    if (!s) return null;
    // Men's silhouettes
    if (s.includes('tuxedo') || s.includes('dinner jacket') || s.includes('black tie')) {
      return { gender: 'men', silhouette: 'tuxedo', label: 'Savile Row 3-Piece Tuxedo' };
    }
    if (s.includes('sherwani') || s.includes('achkan') || s.includes('angarkha')) {
      return { gender: 'men', silhouette: 'sherwani', label: 'Imperial Awadh Sherwani' };
    }
    if (s.includes('nehru') || s.includes('bundi') || s.includes('waistcoat')) {
      return { gender: 'men', silhouette: 'nehru', label: 'Bespoke Nehru Jacket & Kurta' };
    }
    if (s.includes('bandhgala') || s.includes('jodhpuri')) {
      return { gender: 'men', silhouette: 'bandhgala', label: 'Royal Jodhpuri Bandhgala' };
    }
    if (s.includes('blazer') || s.includes('double-breasted') || s.includes('safari') || s.includes('mens suit') || s.includes("men's suit")) {
      return { gender: 'men', silhouette: 'blazer', label: 'Italian Double-Breasted Suit' };
    }

    // Women's specific silhouettes
    if (s.includes('saree') || s.includes('sari') || s.includes('kanjeevaram') || s.includes('nauvari')) {
      return { gender: 'women', silhouette: 'saree', label: 'Sculpted Couture Saree & Blouse' };
    }
    if (s.includes('lehenga') || s.includes('choli') || s.includes('ghagra') || s.includes('chaniya')) {
      return { gender: 'women', silhouette: 'lehenga', label: 'Royal Bridal Lehenga & Choli' };
    }
    if (s.includes('sharara') || s.includes('gharara') || s.includes('palazzo') || s.includes('salwar') || s.includes('pant suit')) {
      return { gender: 'women', silhouette: 'sharara', label: 'Royal Sharara & Embroidered Kurti' };
    }
    if (s.includes('anarkali') || s.includes('kalidar') || s.includes('abaya') || s.includes('kaftan')) {
      return { gender: 'women', silhouette: 'anarkali', label: 'Floor-Length Kalidar Anarkali' };
    }
    if (s.includes('kurti') || s.includes('kurta') || s.includes('tunic')) {
      if (spec.gender === 'men' || s.includes('groom') || s.includes('mens') || s.includes('pajama')) {
        return { gender: 'men', silhouette: 'nehru', label: 'Bespoke Silk Kurta & Bundi' };
      }
      return { gender: 'women', silhouette: 'kurti', label: 'Bespoke Embroidered Kurta Ensemble' };
    }
    if (s.includes('mermaid') || s.includes('trumpet') || s.includes('fishtail')) {
      return { gender: 'women', silhouette: 'mermaid', label: 'Sculpted Mermaid Trumpet Gown' };
    }
    if (s.includes('bodycon') || s.includes('sheath') || s.includes('column') || s.includes('pencil') || s.includes('slip dress')) {
      return { gender: 'women', silhouette: 'bodycon', label: 'Architectural Column Sheath Dress' };
    }
    if (s.includes('short dress') || s.includes('mini') || s.includes('midi') || s.includes('cocktail') || s.includes('skater') || s.includes('tea-length') || s.includes('knee-length')) {
      return { gender: 'women', silhouette: 'cocktail', label: 'Couture Cocktail Midi Dress' };
    }
    if (s.includes('ball gown') || s.includes('ballgown') || s.includes('princess') || s.includes('cinderella') || s.includes('voluminous') || s.includes('victorian')) {
      return { gender: 'women', silhouette: 'ballgown', label: 'Grand Royal Ball Gown' };
    }
    if (s.includes('corset') || s.includes('bustier') || s.includes('basque')) {
      return { gender: 'women', silhouette: 'corset', label: 'Boned Basque Corset Couture' };
    }
    if (s.includes('gown') || s.includes('maxi') || s.includes('evening dress') || s.includes('prom') || s.includes('a-line') || s.includes('empire')) {
      return { gender: 'women', silhouette: 'gown', label: 'Haute Couture Evening Gown' };
    }
    return null;
  };

  const fromPrompt = detectFromString(primaryText);
  if (fromPrompt) return fromPrompt;

  const fromSecondary = detectFromString(secondaryText);
  if (fromSecondary) return fromSecondary;

  if (spec.gender === 'men') {
    return { gender: 'men', silhouette: 'bandhgala', label: 'Royal Jodhpuri Bandhgala' };
  }
  return { gender: 'women', silhouette: 'gown', label: 'Haute Couture Evening Gown' };
}

export function resolveNeckline(spec: CoutureVisualSpec): { cut: NecklineCut; label: string } {
  const cleanPrompt = stripInjectedBrackets(spec.prompt || '').toLowerCase();
  const fallback = `${spec.aiNeckline || ''} ${spec.neckline || ''}`.toLowerCase();

  const detect = (s: string): { cut: NecklineCut; label: string } | null => {
    if (s.includes('off-shoulder') || s.includes('off shoulder') || s.includes('bardot') || s.includes('strapless') || s.includes('tube')) {
      return { cut: 'off-shoulder', label: 'Off-Shoulder Bardot Neckline' };
    }
    if (s.includes('one-shoulder') || s.includes('one shoulder') || s.includes('asymmetric') || s.includes('single shoulder')) {
      return { cut: 'one-shoulder', label: 'Asymmetric One-Shoulder Neckline' };
    }
    if (s.includes('halter')) {
      return { cut: 'halter', label: 'Sculpted Halter Neckline' };
    }
    if (s.includes('high-neck') || s.includes('high neck') || s.includes('turtleneck') || s.includes('mandarin') || s.includes('collar') || s.includes('closed neck') || s.includes('illusion')) {
      return { cut: 'high-neck', label: 'High-Neck Regal Collar' };
    }
    if (s.includes('v-neck') || s.includes('v neck') || s.includes('plunging') || s.includes('deep v') || s.includes('surplice') || s.includes('wrap')) {
      return { cut: 'v-neck', label: 'Sculpted Plunging V-Neck' };
    }
    if (s.includes('square')) {
      return { cut: 'square', label: 'Architectural Square Neckline' };
    }
    if (s.includes('boat') || s.includes('bateau')) {
      return { cut: 'boat', label: 'Bateau Boat Neckline' };
    }
    if (s.includes('round') || s.includes('scoop') || s.includes('jewel') || s.includes('crew') || s.includes('u-neck')) {
      return { cut: 'round', label: 'Classic Scoop Round Neckline' };
    }
    if (s.includes('sweetheart') || s.includes('paan')) {
      return { cut: 'sweetheart', label: 'Sculpted Sweetheart Neckline' };
    }
    return null;
  };

  return detect(cleanPrompt) || detect(fallback) || { cut: 'sweetheart', label: spec.neckline || 'Sculpted Sweetheart' };
}

export function resolveSleeve(spec: CoutureVisualSpec): { cut: SleeveCut; label: string } {
  const cleanPrompt = stripInjectedBrackets(spec.prompt || '').toLowerCase();
  const fallback = `${spec.aiSleeve || ''} ${spec.sleeve || ''}`.toLowerCase();

  const detect = (s: string): { cut: SleeveCut; label: string } | null => {
    if (s.includes('sleeveless') || s.includes('strapless') || s.includes('spaghetti') || s.includes('strappy') || s.includes('no sleeve') || s.includes('halter') || s.includes('tank')) {
      return { cut: 'sleeveless', label: 'Sleeveless Couture Cut' };
    }
    if (s.includes('cape')) {
      return { cut: 'cape', label: 'Sheer Flowing Cape Sleeves' };
    }
    if (s.includes('off-shoulder') || s.includes('off shoulder') || s.includes('drop sleeve')) {
      return { cut: 'off-shoulder', label: 'Dropped Off-Shoulder Sleeves' };
    }
    if (s.includes('puff') || s.includes('balloon') || s.includes('bishop')) {
      return { cut: 'puff', label: 'Voluminous Puff Sleeves' };
    }
    if (s.includes('bell') || s.includes('flute') || s.includes('flared sleeve') || s.includes('kimono') || s.includes('butterfly')) {
      return { cut: 'bell', label: 'Flared Bell / Flute Sleeves' };
    }
    if (s.includes('short sleeve') || s.includes('cap sleeve') || s.includes('half sleeve') || s.includes('cap ')) {
      return { cut: 'short', label: 'Tailored Cap / Short Sleeves' };
    }
    if (s.includes('three-quarter') || s.includes('3/4') || s.includes('elbow')) {
      return { cut: 'three-quarter', label: 'Three-Quarter Elbow Sleeves' };
    }
    if (s.includes('long') || s.includes('full sleeve') || s.includes('churidar sleeve') || s.includes('cuff')) {
      return { cut: 'long', label: 'Full-Length Couture Sleeves' };
    }
    return null;
  };

  return detect(cleanPrompt) || detect(fallback) || { cut: 'three-quarter', label: spec.sleeve || 'Fitted Couture Sleeves' };
}

export function resolvePatternMotif(spec: CoutureVisualSpec): { motif: PatternMotif; label: string } {
  const combined = `${stripInjectedBrackets(spec.prompt || '')} ${spec.aiPattern || ''} ${spec.pattern || ''}`.toLowerCase();
  if (combined.includes('mirror') || combined.includes('abhla') || combined.includes('shisha')) {
    return { motif: 'mirror', label: 'Artisan Mirror (Abhla) & Kutchi Work' };
  }
  if (combined.includes('floral') || combined.includes('flower') || combined.includes('rose') || combined.includes('botanical') || combined.includes('vine')) {
    return { motif: 'floral', label: '3D Hand-Embroidered Floral Botanicals' };
  }
  if (combined.includes('sequin') || combined.includes('shimmer') || combined.includes('glitter') || combined.includes('crystal') || combined.includes('rhinestone') || combined.includes('swarovski') || combined.includes('sparkle')) {
    return { motif: 'sequin', label: 'Crystal & Micro-Sequin Constellation' };
  }
  if (combined.includes('chikankari') || combined.includes('lace') || combined.includes('shadow work') || combined.includes('threadwork') || combined.includes('resham')) {
    return { motif: 'chikankari', label: 'Lucknowi Chikankari & Resham Threadwork' };
  }
  if (combined.includes('check') || combined.includes('plaid') || combined.includes('geometric') || combined.includes('chevron')) {
    return { motif: 'checks', label: 'Geometric Zari & Brocade Grid' };
  }
  if (combined.includes('minimal') || combined.includes('plain') || combined.includes('solid') || combined.includes('clean') || combined.includes('unembellished')) {
    return { motif: 'minimal', label: 'Pure Minimalist Architectural Drape' };
  }
  if (combined.includes('pearl') || combined.includes('moti') || combined.includes('bead')) {
    return { motif: 'pearl', label: 'Hand-Strung Pearl & Bugle Beadwork' };
  }
  return { motif: 'zardozi', label: spec.pattern || '24K Gold Dabka Zardozi & Resham' };
}

export function resolveFabricFromPrompt(promptStr: string = '', fallbackFabric: string = 'Pure Silk'): string {
  const s = stripInjectedBrackets(promptStr).toLowerCase();
  if (s.includes('velvet')) return 'Dense Silk Velvet';
  if (s.includes('organza')) return 'Mulberry Silk Organza';
  if (s.includes('chiffon')) return 'Pure Silk Chiffon';
  if (s.includes('georgette')) return 'Pure Silk Georgette';
  if (s.includes('kanjeevaram') || s.includes('kanchipuram')) return 'Kanjeevaram Zari Silk';
  if (s.includes('banarasi') || s.includes('brocade')) return 'Pure Banarasi Brocade Silk';
  if (s.includes('chanderi') || s.includes('tissue')) return 'Chanderi Silk Tissue';
  if (s.includes('satin')) return 'Duchess Silk Satin';
  if (s.includes('crepe')) return 'Heavy Silk Crepe';
  if (s.includes('net') || s.includes('tulle') || s.includes('mesh')) return 'French Illusion Tulle & Net';
  if (s.includes('lace')) return 'French Chantilly Lace';
  if (s.includes('cotton') || s.includes('mulmul') || s.includes('khadi')) return 'Handloom Mulmul Cotton';
  if (s.includes('linen')) return 'Belgian Herringbone Linen';
  if (s.includes('wool') || s.includes('merino') || s.includes('cashmere')) return 'Italian Merino Wool';
  if (s.includes('raw silk') || s.includes('tussar')) return 'Pure Tussar Raw Silk';
  if (s.includes('silk')) return 'Pure Mulberry Silk';
  return fallbackFabric;
}

/**
 * Parses a customer's free-form text prompt into structured dress attributes
 * so that the live preview and generated design strictly reflect the customer's prompt.
 */
export function parseCustomerPromptToSpecs(
  promptText: string,
  defaults?: {
    gender?: 'women' | 'men';
    dressType?: string;
    color?: string;
    fabric?: string;
    neckline?: string;
    sleeve?: string;
    occasion?: string;
  }
) {
  const cleanPrompt = stripInjectedBrackets(promptText);
  const silInfo = resolveSilhouette({
    gender: defaults?.gender,
    dressType: defaults?.dressType,
    prompt: cleanPrompt
  });
  const theme = resolveColorTheme(defaults?.color || '', cleanPrompt);
  const neckInfo = resolveNeckline({ neckline: defaults?.neckline, prompt: cleanPrompt });
  const sleeveInfo = resolveSleeve({ sleeve: defaults?.sleeve, prompt: cleanPrompt });
  const patternInfo = resolvePatternMotif({ prompt: cleanPrompt });
  const fabricName = resolveFabricFromPrompt(cleanPrompt, defaults?.fabric || 'Pure Mulberry Silk');

  return {
    gender: silInfo.gender,
    silhouette: silInfo.silhouette,
    dressType: silInfo.label,
    color: theme.name,
    colorTheme: theme,
    fabric: fabricName,
    neckline: neckInfo.label,
    necklineCut: neckInfo.cut,
    sleeve: sleeveInfo.label,
    sleeveCut: sleeveInfo.cut,
    pattern: patternInfo.label,
    patternMotif: patternInfo.motif,
    cleanPrompt
  };
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
  const theme = resolveColorTheme(spec.color, spec.prompt, spec.customPalette);
  const neckInfo = resolveNeckline(spec);
  const sleeveInfo = resolveSleeve(spec);
  const patternInfo = resolvePatternMotif(spec);
  const angle = spec.angle || 'front';

  const fabricLabel = resolveFabricFromPrompt(
    spec.prompt || '',
    spec.fabric || (gender === 'men' ? 'Pure Banarasi Raw Silk' : 'Mulberry Silk Organza')
  );
  const cleanUserPrompt = stripInjectedBrackets(spec.prompt || '');
  const promptSnippet =
    cleanUserPrompt.length > 74 ? cleanUserPrompt.slice(0, 71) + '...' : cleanUserPrompt;

  const angleTitleMap = {
    front: '1. FRONT VIEW SILHOUETTE',
    back: '2. BACK VIEW & CLOSURE',
    side: '3. SIDE PROFILE & DRAPE',
    detail: '4. MACRO WEAVE & EMBROIDERY'
  };

  // Render pattern overlay helper for skirts/jackets
  const renderPatternOverlay = (motif: PatternMotif, minY: number, maxY: number, spreadWidth: number = 140) => {
    if (motif === 'minimal') return '';
    const coords = [
      [300, minY + (maxY - minY) * 0.25],
      [300 - spreadWidth * 0.38, minY + (maxY - minY) * 0.42],
      [300 + spreadWidth * 0.38, minY + (maxY - minY) * 0.42],
      [300 - spreadWidth * 0.22, minY + (maxY - minY) * 0.62],
      [300 + spreadWidth * 0.22, minY + (maxY - minY) * 0.62],
      [300 - spreadWidth * 0.52, minY + (maxY - minY) * 0.78],
      [300, minY + (maxY - minY) * 0.8],
      [300 + spreadWidth * 0.52, minY + (maxY - minY) * 0.78]
    ];

    if (motif === 'floral') {
      return coords
        .map(
          ([cx, cy]) => `
        <g transform="translate(${cx.toFixed(0)}, ${cy.toFixed(0)})">
          <circle cx="0" cy="-6" r="4.5" fill="${theme.embroidery}" fill-opacity="0.75"/>
          <circle cx="6" cy="0" r="4.5" fill="${theme.embroidery}" fill-opacity="0.75"/>
          <circle cx="0" cy="6" r="4.5" fill="${theme.embroidery}" fill-opacity="0.75"/>
          <circle cx="-6" cy="0" r="4.5" fill="${theme.embroidery}" fill-opacity="0.75"/>
          <circle cx="0" cy="0" r="3.5" fill="${theme.accentMetallic}"/>
        </g>`
        )
        .join('');
    }

    if (motif === 'mirror') {
      return coords
        .map(
          ([cx, cy]) => `
        <g transform="translate(${cx.toFixed(0)}, ${cy.toFixed(0)})">
          <polygon points="0,-9 9,0 0,9 -9,0" fill="#FFFFFF" fill-opacity="0.85" stroke="${theme.accentMetallic}" stroke-width="2"/>
          <polygon points="0,-4 4,0 0,4 -4,0" fill="#E0F7FA"/>
        </g>`
        )
        .join('');
    }

    if (motif === 'sequin') {
      return coords
        .map(
          ([cx, cy]) => `
        <g transform="translate(${cx.toFixed(0)}, ${cy.toFixed(0)})">
          <path d="M 0 -9 L 2.5 -2.5 L 9 0 L 2.5 2.5 L 0 9 L -2.5 2.5 L -9 0 L -2.5 -2.5 Z" fill="${theme.embroidery}" opacity="0.9"/>
          <circle r="2" fill="#FFFFFF"/>
        </g>`
        )
        .join('');
    }

    // Default Zardozi / Pearl / Chikankari medallion motifs
    return coords
      .map(
        ([cx, cy]) => `
      <g transform="translate(${cx.toFixed(0)}, ${cy.toFixed(0)})">
        <circle r="7" fill="${theme.accentMetallic}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <circle r="2.8" fill="${theme.embroidery}"/>
      </g>`
      )
      .join('');
  };

  // Render dynamic women's sleeves (Front & Back views)
  const renderWomenSleeves = (cut: SleeveCut) => {
    if (cut === 'sleeveless' || neckInfo.cut === 'halter' || neckInfo.cut === 'one-shoulder') {
      return `
        <!-- Bare Sculpted Mannequin Shoulders & Arms (Sleeveless) -->
        <path d="M 235 144 C 212 152 198 188 192 242 L 212 245 C 218 198 226 168 242 156 Z" fill="#D5C3B3" stroke="#9C8877" stroke-width="1"/>
        <path d="M 365 144 C 388 152 402 188 408 242 L 388 245 C 382 198 374 168 358 156 Z" fill="#D5C3B3" stroke="#9C8877" stroke-width="1"/>
      `;
    }
    if (cut === 'off-shoulder' || neckInfo.cut === 'off-shoulder') {
      return `
        <!-- Bare Upper Shoulders + Dropped Off-Shoulder Bardot Sleeves -->
        <path d="M 238 142 C 218 148 206 165 202 182 L 238 175 Z" fill="#D5C3B3" stroke="#9C8877" stroke-width="1"/>
        <path d="M 362 142 C 382 148 394 165 398 182 L 362 175 Z" fill="#D5C3B3" stroke="#9C8877" stroke-width="1"/>
        <path d="M 202 174 C 190 198 188 222 196 238 L 232 218 L 240 176 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <path d="M 398 174 C 410 198 412 222 404 238 L 368 218 L 360 176 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
      `;
    }
    if (cut === 'short') {
      return `
        <!-- Tailored Short / Cap Sleeves -->
        <path d="M 228 145 C 204 156 196 184 202 206 L 236 202 L 244 162 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
        <path d="M 372 145 C 396 156 404 184 398 206 L 364 202 L 356 162 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
      `;
    }
    if (cut === 'puff') {
      return `
        <!-- Romantic Voluminous Puff Sleeves -->
        <path d="M 232 142 C 182 135 172 195 202 218 L 236 204 L 244 162 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <path d="M 368 142 C 418 135 428 195 398 218 L 364 204 L 356 162 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
      `;
    }
    if (cut === 'bell') {
      return `
        <!-- Dramatic Flared Bell / Flute Sleeves -->
        <path d="M 225 146 L 154 315 Q 186 332 218 308 L 244 185 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <path d="M 375 146 L 446 315 Q 414 332 382 308 L 356 185 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
      `;
    }
    if (cut === 'cape') {
      return `
        <!-- Flowing Sheer Couture Cape Sleeves -->
        <path d="M 224 146 C 165 245 138 415 124 585 L 195 575 C 208 410 226 260 246 185 Z" fill="${theme.highlight}" fill-opacity="0.42" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <path d="M 376 146 C 435 245 462 415 476 585 L 405 575 C 392 410 374 260 354 185 Z" fill="${theme.highlight}" fill-opacity="0.42" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
      `;
    }
    if (cut === 'long') {
      return `
        <!-- Full-Length Fitted Couture Sleeves with Embroidered Cuffs -->
        <path d="M 224 146 L 166 348 L 192 355 L 244 188 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
        <path d="M 376 146 L 434 348 L 408 355 L 356 188 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
        <line x1="166" y1="342" x2="192" y2="349" stroke="${theme.accentMetallic}" stroke-width="3"/>
        <line x1="434" y1="342" x2="408" y2="349" stroke="${theme.accentMetallic}" stroke-width="3"/>
      `;
    }
    // Default Three-Quarter / Elbow Sleeves
    return `
      <path d="M 224 146 L 182 268 L 210 275 L 244 185 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
      <path d="M 376 146 L 418 268 L 390 275 L 356 185 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
      <line x1="184" y1="262" x2="211" y2="269" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
      <line x1="416" y1="262" x2="389" y2="269" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
    `;
  };

  // Render dynamic women's bodice with accurate neckline cut
  const renderWomenFrontBodice = (cut: NecklineCut, bottomY: number) => {
    // Base skin decolletage on mannequin
    const skinBase = `<path d="M 245 134 L 355 134 L 345 198 L 255 198 Z" fill="#D5C3B3"/>`;

    if (cut === 'v-neck') {
      return `
        ${skinBase}
        <path d="M 232 144 L 266 140 L 300 206 L 334 140 L 368 144 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        <path d="M 266 140 L 300 206 L 334 140" fill="none" stroke="${theme.embroidery}" stroke-width="2.5"/>
      `;
    }
    if (cut === 'off-shoulder') {
      return `
        <path d="M 235 134 L 365 134 L 362 176 L 238 176 Z" fill="#D5C3B3"/>
        <path d="M 232 172 Q 266 162 300 176 Q 334 162 368 172 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    if (cut === 'one-shoulder') {
      return `
        ${skinBase}
        <path d="M 236 140 L 274 138 L 362 178 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    if (cut === 'halter') {
      return `
        ${skinBase}
        <path d="M 278 130 L 322 130 L 348 182 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} L 252 182 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    if (cut === 'high-neck') {
      return `
        <path d="M 274 124 Q 300 132 326 124 L 332 144 L 372 148 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} L 228 148 L 268 144 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        <path d="M 272 126 Q 300 135 328 126 L 330 142 Q 300 150 270 142 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="2"/>
      `;
    }
    if (cut === 'square') {
      return `
        ${skinBase}
        <path d="M 230 144 L 264 142 L 264 184 L 336 184 L 336 142 L 370 144 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    if (cut === 'boat') {
      return `
        ${skinBase}
        <path d="M 226 146 Q 300 158 374 146 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    if (cut === 'round') {
      return `
        ${skinBase}
        <path d="M 228 144 L 264 142 C 268 184 332 184 336 142 L 372 144 L 346 ${bottomY} Q 300 ${bottomY + 10} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
      `;
    }
    // Default Sweetheart
    return `
      ${skinBase}
      <path d="M 226 146 L 262 142 Q 282 150 300 176 Q 318 150 338 142 L 374 146 L 346 ${bottomY} Q 300 ${bottomY + 12} 254 ${bottomY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
    `;
  };

  let garmentArtwork = '';

  if (angle === 'detail') {
    garmentArtwork = `
      <!-- Macro Fabric Drape Folds -->
      <rect x="45" y="105" width="510" height="525" rx="22" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-opacity="0.5"/>
      <path d="M 45 200 Q 190 160 310 210 T 555 190 L 555 630 L 45 630 Z" fill="url(#shadowFoldGrad)" opacity="0.55"/>
      <path d="M 45 340 Q 210 290 360 350 T 555 320 L 555 630 L 45 630 Z" fill="url(#garmentGrad)" opacity="0.8"/>

      <!-- Fine Silk Warp & Weft Micro-Grid -->
      <g stroke="${theme.highlight}" stroke-opacity="0.16" stroke-width="1">
        ${Array.from({ length: 17 }).map((_, i) => `<line x1="60" y1="${130 + i * 28}" x2="540" y2="${130 + i * 28}" />`).join('')}
        ${Array.from({ length: 16 }).map((_, i) => `<line x1="${75 + i * 30}" y1="120" x2="${75 + i * 30}" y2="615" />`).join('')}
      </g>

      <!-- Intricate Artisan Motif Medallion -->
      <g transform="translate(300, 340)">
        <circle r="130" fill="none" stroke="${theme.accentMetallic}" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>
        <circle r="98" fill="none" stroke="${theme.embroidery}" stroke-width="1.5" opacity="0.7"/>
        <circle r="64" fill="${theme.deepShadow}" fill-opacity="0.45" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
        ${Array.from({ length: 8 }).map((_, i) => {
          const deg = i * 45;
          return `<g transform="rotate(${deg})">
            <path d="M 0 -20 C 18 -44 18 -74 0 -94 C -18 -74 -18 -44 0 -20 Z" fill="${theme.accentMetallic}" fill-opacity="0.35" stroke="${theme.embroidery}" stroke-width="1.8"/>
            <circle cx="0" cy="-58" r="4.5" fill="${theme.embroidery}"/>
            <circle cx="0" cy="-110" r="5" fill="${theme.accentMetallic}"/>
          </g>`;
        }).join('')}
        <circle r="18" fill="${theme.accentMetallic}" stroke="${theme.embroidery}" stroke-width="3"/>
        <circle r="7" fill="${theme.embroidery}"/>
      </g>

      <!-- Scalloped Zari Border Along Bottom of Macro Swatch -->
      <path d="M 65 545 Q 105 520 145 545 T 225 545 T 305 545 T 385 545 T 465 545 T 535 545" fill="none" stroke="${theme.accentMetallic}" stroke-width="3.5"/>

      <!-- Technical Callout Loupe Tags -->
      <g transform="translate(68, 132)">
        <rect width="230" height="52" rx="10" fill="#141110" fill-opacity="0.88" stroke="${theme.accentMetallic}" stroke-width="1"/>
        <text x="14" y="21" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1">TEXTILE WEAVE &amp; SHADE</text>
        <text x="14" y="39" fill="#FAF7F2" font-family="serif" font-size="13" font-weight="bold">${escapeXml(theme.name)} • ${escapeXml(fabricLabel)}</text>
      </g>

      <g transform="translate(275, 558)">
        <rect width="260" height="52" rx="10" fill="#141110" fill-opacity="0.88" stroke="${theme.accentMetallic}" stroke-width="1"/>
        <text x="14" y="21" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1">SURFACE CRAFT &amp; MOTIF</text>
        <text x="14" y="39" fill="#FAF7F2" font-family="serif" font-size="12">${escapeXml(patternInfo.label)}</text>
      </g>
    `;
  } else if (gender === 'men') {
    const isLongCoat = silhouette === 'sherwani';
    const isTuxedo = silhouette === 'tuxedo';
    const isNehru = silhouette === 'nehru';
    const isBlazer = silhouette === 'blazer';
    const coatBottomY = isLongCoat ? 495 : 395;

    if (angle === 'side') {
      garmentArtwork = `
        <rect x="288" y="96" width="24" height="36" rx="8" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>
        <line x1="300" y1="490" x2="300" y2="635" stroke="#8C7A6B" stroke-width="4"/>
        <path d="M 262 ${coatBottomY - 15} L 336 ${coatBottomY - 15} L 326 615 L 274 615 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        <path d="M 268 130 C 242 152 236 225 244 300 L 240 ${coatBottomY} L 352 ${coatBottomY} C 358 310 356 215 332 136 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <path d="M 274 120 L 324 128 L 320 144 L 270 136 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <path d="M 282 154 C 258 212 256 292 268 360 L 308 358 C 306 285 310 212 304 158 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        <circle cx="278" cy="348" r="3" fill="${theme.accentMetallic}"/>
        <circle cx="286" cy="348" r="3" fill="${theme.accentMetallic}"/>
        <circle cx="294" cy="348" r="3" fill="${theme.accentMetallic}"/>
      `;
    } else if (angle === 'back') {
      garmentArtwork = `
        <rect x="282" y="96" width="36" height="32" rx="10" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>
        <path d="M 238 ${coatBottomY - 10} L 362 ${coatBottomY - 10} L 352 615 L 306 615 L 300 470 L 294 615 L 248 615 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        <path d="M 205 144 L 168 354 L 204 360 L 232 190 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <path d="M 395 144 L 432 354 L 396 360 L 368 190 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <path d="M 205 144 Q 300 128 395 144 L 368 270 L 382 ${coatBottomY} L 218 ${coatBottomY} L 232 270 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <path d="M 266 120 Q 300 114 334 120 L 338 138 Q 300 132 262 138 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <line x1="300" y1="136" x2="300" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="242" y1="${coatBottomY - 65}" x2="242" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
        <line x1="358" y1="${coatBottomY - 65}" x2="358" y2="${coatBottomY}" stroke="${theme.accentMetallic}" stroke-width="2.5"/>
      `;
    } else {
      garmentArtwork = `
        <rect x="282" y="96" width="36" height="34" rx="10" fill="#C8B7A6" stroke="#8C7A6B" stroke-width="1.5"/>
        <path d="M 236 ${coatBottomY - 10} L 364 ${coatBottomY - 10} L 352 615 L 306 615 L 300 465 L 294 615 L 248 615 Z" fill="${isLongCoat || isNehru ? '#F3ECE1' : theme.secondary}" stroke="${theme.accentMetallic}" stroke-width="1.4"/>
        ${
          isNehru
            ? `<path d="M 205 144 L 166 356 L 202 362 L 232 190 Z" fill="#F5EFE6" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
               <path d="M 395 144 L 434 356 L 398 362 L 368 190 Z" fill="#F5EFE6" stroke="${theme.accentMetallic}" stroke-width="1.2"/>`
            : `<path d="M 205 144 L 166 356 L 202 362 L 232 190 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
               <path d="M 395 144 L 434 356 L 398 362 L 368 190 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="1.6"/>`
        }
        <path d="M 205 144 Q 300 130 395 144 L 368 268 L 382 ${coatBottomY} L 302 ${coatBottomY} L 300 ${coatBottomY - 18} L 298 ${coatBottomY} L 218 ${coatBottomY} L 232 268 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        ${
          isTuxedo || isBlazer
            ? `<polygon points="266,132 334,132 300,260" fill="#FAF8F5" stroke="${theme.accentMetallic}" stroke-width="1"/>
               <polygon points="264,132 232,190 300,264" fill="${isTuxedo ? '#141316' : theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
               <polygon points="336,132 368,190 300,264" fill="${isTuxedo ? '#141316' : theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="1.5"/>`
            : `<path d="M 264 120 Q 300 130 336 120 L 340 142 Q 300 152 260 142 Z" fill="${theme.deepShadow}" stroke="${theme.accentMetallic}" stroke-width="2.2"/>`
        }
        <line x1="300" y1="${isTuxedo || isBlazer ? 260 : 144}" x2="300" y2="${coatBottomY - 12}" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
        ${Array.from({ length: isLongCoat ? 7 : isTuxedo || isBlazer ? 2 : 5 })
          .map((_, i) => {
            const cy = (isTuxedo || isBlazer ? 280 : 168) + i * 38;
            return `<circle cx="300" cy="${cy}" r="5" fill="${theme.accentMetallic}" stroke="#FFF" stroke-width="1"/>`;
          })
          .join('')}
        <path d="M 326 204 L 358 204 L 350 188 L 336 194 Z" fill="${theme.embroidery}" stroke="${theme.accentMetallic}" stroke-width="1.2"/>
        ${renderPatternOverlay(patternInfo.motif, 220, coatBottomY - 25, 95)}
      `;
    }
  } else {
    // WOMEN'S DISTINCT COUTURE SILHOUETTES (Front, Back, Side)
    if (angle === 'side') {
      const isShort = silhouette === 'cocktail';
      const isMermaid = silhouette === 'mermaid';
      const isBodycon = silhouette === 'bodycon';
      const hemY = isShort ? 470 : 608;

      const sideSkirtPath = isMermaid
        ? `M 268 252 C 254 320 258 395 272 448 C 242 515 190 575 162 608 L 448 608 C 405 560 356 500 326 448 C 336 390 338 320 324 252 Z`
        : isBodycon
        ? `M 268 252 C 256 340 264 475 268 608 L 334 608 C 338 475 342 340 324 252 Z`
        : `M 266 252 C 232 350 195 475 ${isShort ? 215 : 162} ${hemY} L ${isShort ? 395 : 455} ${hemY} C 412 485 365 365 326 252 Z`;

      garmentArtwork = `
        <rect x="288" y="96" width="22" height="34" rx="8" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>
        ${isShort ? `<line x1="300" y1="470" x2="300" y2="625" stroke="#8C7A6B" stroke-width="4"/>` : ''}
        <path d="M 272 132 C 250 158 248 202 266 252 L 326 252 C 334 205 330 160 314 132 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <path d="${sideSkirtPath}" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        ${
          silhouette === 'lehenga' || silhouette === 'saree' || silhouette === 'anarkali' || sleeveInfo.cut === 'cape'
            ? `<path d="M 305 148 C 365 225 415 375 468 578 L 385 598 C 345 415 322 255 292 160 Z" fill="${theme.highlight}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="1.5" stroke-dasharray="4 2"/>`
            : ''
        }
        <path d="M ${isShort ? 215 : isBodycon ? 268 : 162} ${hemY - 22} L ${isShort ? 395 : isBodycon ? 334 : 455} ${hemY - 22} L ${isShort ? 395 : isBodycon ? 334 : 455} ${hemY} L ${isShort ? 215 : isBodycon ? 268 : 162} ${hemY} Z" fill="${theme.accentMetallic}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="2"/>
      `;
    } else if (angle === 'back') {
      const isShort = silhouette === 'cocktail';
      const isMermaid = silhouette === 'mermaid';
      const isBodycon = silhouette === 'bodycon';
      const isSharara = silhouette === 'sharara' || silhouette === 'kurti';
      const hemY = isShort ? 470 : 610;

      const backLowerArtwork = isSharara
        ? `
          <path d="M 244 252 L 356 252 L 372 435 L 228 435 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
          <path d="M 235 435 L 365 435 L 392 610 L 310 610 L 300 485 L 290 610 L 208 610 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        `
        : isMermaid
        ? `
          <path d="M 254 254 L 346 254 C 362 325 352 405 336 452 C 378 518 426 575 452 610 Q 300 632 148 610 C 174 575 222 518 264 452 C 248 405 238 325 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        `
        : isBodycon
        ? `
          <path d="M 254 254 L 346 254 C 358 345 348 485 342 610 L 258 610 C 252 485 242 345 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        `
        : `
          <path d="M 254 258 L 346 258 C 392 375 438 495 ${isShort ? 410 : 462} ${hemY} Q 300 ${hemY + 22} ${isShort ? 190 : 138} ${hemY} C 162 495 208 375 254 258 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
        `;

      garmentArtwork = `
        <rect x="284" y="96" width="32" height="32" rx="10" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>
        ${isShort ? `<line x1="300" y1="470" x2="300" y2="625" stroke="#8C7A6B" stroke-width="4"/>` : ''}
        ${renderWomenSleeves(sleeveInfo.cut)}
        <path d="M 228 144 L 265 138 C 268 202 332 202 335 138 L 372 144 L 346 248 L 254 248 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
        ${
          silhouette === 'lehenga' || silhouette === 'saree'
            ? `<rect x="256" y="244" width="88" height="16" fill="#D5C3B3"/>`
            : ''
        }
        <line x1="262" y1="158" x2="338" y2="158" stroke="${theme.accentMetallic}" stroke-width="2"/>
        <line x1="300" y1="158" x2="290" y2="212" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <line x1="300" y1="158" x2="310" y2="212" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
        <polygon points="290,210 282,226 298,226" fill="${theme.accentMetallic}"/>
        <polygon points="310,210 302,226 318,226" fill="${theme.accentMetallic}"/>
        ${backLowerArtwork}
        ${renderPatternOverlay(patternInfo.motif, 290, hemY - 25, isBodycon ? 40 : 120)}
      `;
    } else {
      // WOMEN'S FRONT VIEW — DISTINCT BY SILHOUETTE!
      const isLehenga = silhouette === 'lehenga';
      const isSaree = silhouette === 'saree';
      const isMermaid = silhouette === 'mermaid';
      const isBodycon = silhouette === 'bodycon';
      const isShort = silhouette === 'cocktail';
      const isBallgown = silhouette === 'ballgown';
      const isSharara = silhouette === 'sharara';
      const isKurti = silhouette === 'kurti';
      const isCorset = silhouette === 'corset';

      const bodiceBottomY = isLehenga || isSaree ? 236 : 254;
      const skirtTopY = isLehenga || isSaree ? 256 : 254;

      let lowerSilhouetteSvg = '';

      if (isSaree) {
        lowerSilhouetteSvg = `
          <!-- Exposed Midriff Waist for Saree Choli -->
          <rect x="256" y="236" width="88" height="20" fill="#D5C3B3"/>
          <!-- Fitted Pleated Saree Skirt with Vertical Front Patli Pleats -->
          <path d="M 252 256 L 348 256 C 364 375 372 495 378 610 Q 300 624 222 610 C 228 495 236 375 252 256 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <!-- Center Saree Nivi Pleats -->
          <line x1="286" y1="256" x2="278" y2="614" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
          <line x1="296" y1="256" x2="294" y2="616" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
          <line x1="306" y1="256" x2="308" y2="616" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
          <line x1="316" y1="256" x2="322" y2="614" stroke="${theme.accentMetallic}" stroke-width="1.6"/>
          <!-- Diagonal Sculpted Saree Pallu Draped from Waist to Left Shoulder & Cascading Side -->
          <path d="M 248 265 L 342 140 L 382 146 L 425 465 L 368 485 L 342 265 Z" fill="url(#shadowFoldGrad)" fill-opacity="0.92" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <path d="M 252 262 L 348 142" stroke="${theme.accentMetallic}" stroke-width="4"/>
          <!-- Broad Kanjeevaram / Banarasi Zari Hem Border -->
          <rect x="222" y="576" width="156" height="34" fill="${theme.accentMetallic}" fill-opacity="0.4" stroke="${theme.accentMetallic}" stroke-width="2"/>
          ${renderPatternOverlay(patternInfo.motif, 290, 565, 55)}
        `;
      } else if (isMermaid) {
        lowerSilhouetteSvg = `
          <!-- Sculpted Hourglass Mermaid / Trumpet Skirt (Fitted Hips, Dramatic Knee Flare) -->
          <path d="M 254 254 L 346 254 C 366 325 352 405 334 452 C 382 515 436 575 464 612 Q 300 636 136 612 C 164 575 218 515 266 452 C 248 405 234 325 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <!-- Mermaid Flare Seam & Godet Fan Lines -->
          <path d="M 266 452 Q 300 466 334 452" fill="none" stroke="${theme.accentMetallic}" stroke-width="2" stroke-dasharray="4 3"/>
          <line x1="276" y1="455" x2="188" y2="615" stroke="${theme.accentMetallic}" stroke-width="1.4" opacity="0.7"/>
          <line x1="300" y1="458" x2="300" y2="622" stroke="${theme.accentMetallic}" stroke-width="1.4" opacity="0.7"/>
          <line x1="324" y1="455" x2="412" y2="615" stroke="${theme.accentMetallic}" stroke-width="1.4" opacity="0.7"/>
          ${renderPatternOverlay(patternInfo.motif, 275, 585, 65)}
        `;
      } else if (isBodycon) {
        lowerSilhouetteSvg = `
          <!-- Sleek Figure-Hugging Bodycon / Column Sheath Skirt -->
          <path d="M 254 254 L 346 254 C 362 340 350 485 342 610 L 315 610 L 308 495 L 298 610 L 258 610 C 250 485 238 340 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          ${renderPatternOverlay(patternInfo.motif, 275, 575, 42)}
        `;
      } else if (isShort) {
        lowerSilhouetteSvg = `
          <!-- Couture Cocktail / Midi Flared Dress & Mannequin Stand -->
          <line x1="300" y1="460" x2="300" y2="625" stroke="#8C7A6B" stroke-width="4"/>
          <ellipse cx="300" cy="625" rx="48" ry="10" fill="#8C7A6B" opacity="0.5"/>
          <path d="M 254 254 L 346 254 C 384 335 412 405 424 468 Q 300 488 176 468 C 188 405 216 335 254 254 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <path d="M 180 446 Q 300 466 420 446 L 424 468 Q 300 488 176 468 Z" fill="${theme.accentMetallic}" fill-opacity="0.35" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
          ${renderPatternOverlay(patternInfo.motif, 275, 440, 95)}
        `;
      } else if (isSharara || isKurti) {
        lowerSilhouetteSvg = `
          <!-- Embroidered Kurta / Kurti Tunic -->
          <path d="M 252 250 L 348 250 L 368 ${isKurti ? 455 : 415} L 232 ${isKurti ? 455 : 415} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <rect x="232" y="${isKurti ? 435 : 395}" width="136" height="20" fill="${theme.accentMetallic}" fill-opacity="0.35" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
          <!-- Wide-Legged Flared Sharara / Tailored Palazzo Trousers -->
          <path d="M 238 ${isKurti ? 455 : 415} L 362 ${isKurti ? 455 : 415} L ${isKurti ? 356 : 412} 612 L 308 612 L 300 485 L 292 612 L ${isKurti ? 244 : 188} 612 Z" fill="url(#shadowFoldGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
          ${renderPatternOverlay(patternInfo.motif, 265, 405, 55)}
        `;
      } else if (isBallgown) {
        lowerSilhouetteSvg = `
          <!-- Basque V-Waist Corset Seam & Grand Voluminous Dome Ballgown Skirt -->
          <path d="M 252 250 Q 300 284 348 250 C 435 320 485 465 496 612 Q 300 642 104 612 C 115 465 165 320 252 250 Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.4"/>
          <path d="M 142 455 Q 300 485 458 455" fill="none" stroke="${theme.accentMetallic}" stroke-width="1.8" stroke-dasharray="5 3"/>
          <path d="M 118 545 Q 300 578 482 545" fill="none" stroke="${theme.accentMetallic}" stroke-width="2"/>
          <path d="M 108 582 Q 300 612 492 582 L 496 612 Q 300 642 104 612 Z" fill="${theme.accentMetallic}" fill-opacity="0.36" stroke="${theme.accentMetallic}" stroke-width="2"/>
          ${renderPatternOverlay(patternInfo.motif, 290, 575, 165)}
        `;
      } else {
        // Lehenga, Anarkali, Corset, or A-Line Couture Gown
        lowerSilhouetteSvg = `
          ${isLehenga ? `<rect x="256" y="236" width="88" height="20" fill="#D5C3B3"/>` : ''}
          ${
            isCorset
              ? `<!-- Visible Spiral Boning Channels on Corset -->
                 <line x1="274" y1="168" x2="270" y2="254" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
                 <line x1="300" y1="172" x2="300" y2="258" stroke="${theme.accentMetallic}" stroke-width="1.8"/>
                 <line x1="326" y1="168" x2="330" y2="254" stroke="${theme.accentMetallic}" stroke-width="1.5"/>`
              : ''
          }
          <path d="M 254 ${skirtTopY} L 346 ${skirtTopY} C 394 378 440 498 466 610 Q 300 632 134 610 C 160 498 206 378 254 ${skirtTopY} Z" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          <!-- Kali Panel Lines -->
          <line x1="270" y1="${skirtTopY}" x2="188" y2="612" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
          <line x1="285" y1="${skirtTopY}" x2="244" y2="617" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
          <line x1="300" y1="${skirtTopY}" x2="300" y2="620" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
          <line x1="315" y1="${skirtTopY}" x2="356" y2="617" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
          <line x1="330" y1="${skirtTopY}" x2="412" y2="612" stroke="${theme.accentMetallic}" stroke-width="1.2" opacity="0.65"/>
          ${
            isLehenga || silhouette === 'anarkali'
              ? `<path d="M 366 144 C 335 235 268 335 178 445 L 154 395 C 238 300 302 215 335 142 Z" fill="${theme.highlight}" fill-opacity="0.32" stroke="${theme.accentMetallic}" stroke-width="2"/>`
              : ''
          }
          <path d="M 140 578 Q 300 600 460 578 L 466 610 Q 300 632 134 610 Z" fill="${theme.accentMetallic}" fill-opacity="0.36" stroke="${theme.accentMetallic}" stroke-width="2.2"/>
          ${renderPatternOverlay(patternInfo.motif, 290, 565, 135)}
        `;
      }

      garmentArtwork = `
        <!-- Couture Mannequin Neck & Jewellery Choker -->
        <rect x="284" y="96" width="32" height="34" rx="10" fill="#D5C3B3" stroke="#8C7A6B" stroke-width="1.5"/>
        <path d="M 278 122 Q 300 132 322 122" fill="none" stroke="${theme.accentMetallic}" stroke-width="3.5"/>

        <!-- Dynamic Sleeves Matching Customer Prompt -->
        ${renderWomenSleeves(sleeveInfo.cut)}

        <!-- Dynamic Bodice & Neckline Matching Customer Prompt -->
        ${renderWomenFrontBodice(neckInfo.cut, bodiceBottomY)}

        <!-- Bodice Embroidery Accents -->
        <circle cx="280" cy="196" r="3" fill="${theme.embroidery}"/>
        <circle cx="300" cy="204" r="4" fill="${theme.accentMetallic}"/>
        <circle cx="320" cy="196" r="3" fill="${theme.embroidery}"/>
        <path d="M 256 ${bodiceBottomY - 4} Q 300 ${bodiceBottomY + 6} 344 ${bodiceBottomY - 4}" fill="none" stroke="${theme.accentMetallic}" stroke-width="3"/>

        <!-- Dynamic Lower Silhouette Matching Customer Prompt -->
        ${lowerSilhouetteSvg}
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
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.32"/>
        <stop offset="60%" stop-color="${theme.accentMetallic}" stop-opacity="0.1"/>
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
    <path d="M 36 665 L 36 185 A 264 145 0 0 1 564 185 L 564 665" fill="none" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.25"/>
    <line x1="36" y1="635" x2="564" y2="635" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.25"/>

    <!-- Top Atelier View Header -->
    <g transform="translate(36, 24)">
      <rect width="245" height="30" rx="8" fill="#141110" fill-opacity="0.85" stroke="${theme.accentMetallic}" stroke-width="1" stroke-opacity="0.55"/>
      <circle cx="18" cy="15" r="5" fill="${theme.primary}" stroke="${theme.accentMetallic}" stroke-width="1.5"/>
      <text x="32" y="19" fill="#FAF7F2" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1.2">${escapeXml(angleTitleMap[angle])}</text>
    </g>

    <!-- Main Garment Render -->
    ${garmentArtwork}

    <!-- Bottom Atelier Specification Plate Reflecting Exact Customer Prompt -->
    <g transform="translate(26, 655)">
      <rect width="548" height="118" rx="16" fill="#181413" fill-opacity="0.94" stroke="${theme.accentMetallic}" stroke-width="1.2" stroke-opacity="0.6"/>
      <!-- Live Fabric Color Swatch Circle -->
      <circle cx="44" cy="59" r="24" fill="url(#garmentGrad)" stroke="${theme.accentMetallic}" stroke-width="2"/>
      <circle cx="44" cy="59" r="17" fill="none" stroke="${theme.embroidery}" stroke-width="1" stroke-dasharray="2 2"/>

      <text x="82" y="28" fill="${theme.accentMetallic}" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing="1.4">AI PROMPT-SYNTHESIZED COUTURE • ${escapeXml(theme.name.toUpperCase())}</text>
      <text x="82" y="50" fill="#FAF7F2" font-family="serif" font-size="17" font-weight="bold">${escapeXml(label)}</text>
      <text x="82" y="70" fill="#D5CBC3" font-family="sans-serif" font-size="11">${escapeXml(fabricLabel)} • ${escapeXml(neckInfo.label)} • ${escapeXml(sleeveInfo.label)}</text>
      ${
        promptSnippet
          ? `<text x="82" y="94" fill="${theme.embroidery}" font-family="sans-serif" font-size="10.5" font-style="italic">&quot;${escapeXml(promptSnippet)}&quot;</text>`
          : `<text x="82" y="94" fill="${theme.embroidery}" font-family="sans-serif" font-size="10.5">${escapeXml(patternInfo.label)}</text>`
      }
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
