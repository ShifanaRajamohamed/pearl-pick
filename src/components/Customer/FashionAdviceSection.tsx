import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  RotateCw, 
  ExternalLink, 
  Lightbulb, 
  Scissors, 
  Layers, 
  ArrowRight, 
  Palette, 
  ShieldCheck,
  Compass
} from 'lucide-react';

export interface FashionTip {
  id: string;
  category: string;
  title: string;
  advice: string;
  actionableTip: string;
  tag: string;
  fabricRecommendation?: string;
  searchQuery?: string;
}

interface FashionAdviceSectionProps {
  onApplyTipToGenerator: (prompt: string, category?: string) => void;
}

export const FashionAdviceSection: React.FC<FashionAdviceSectionProps> = ({
  onApplyTipToGenerator
}) => {
  const [tips, setTips] = useState<FashionTip[]>([]);
  const [groundingQueries, setGroundingQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [isGrounded, setIsGrounded] = useState<boolean>(false);
  const [sourceLabel, setSourceLabel] = useState<string>('Google Search Grounding');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);

  const fetchAdvice = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Check client-side session cache if not forcing refresh
      if (!forceRefresh) {
        const cached = sessionStorage.getItem('pearl_pick_fashion_advice');
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            if (parsedCache && Array.isArray(parsedCache.tips) && parsedCache.tips.length > 0) {
              setTips(parsedCache.tips);
              setGroundingQueries(parsedCache.groundingQueries || []);
              setSources(parsedCache.sources || []);
              setIsGrounded(Boolean(parsedCache.isGrounded));
              setSourceLabel(parsedCache.source || (parsedCache.isGrounded ? 'Google Search Grounding' : 'Curated Atelier Knowledge Base'));
              setIsLoading(false);
              return;
            }
          } catch {
            // Ignore corrupted session storage
          }
        }
      }

      const endpoint = forceRefresh ? '/api/fashion-advice?refresh=true' : '/api/fashion-advice';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTips(data.tips || []);
      setGroundingQueries(data.groundingQueries || []);
      setSources(data.sources || []);
      setIsGrounded(Boolean(data.isGrounded));
      setSourceLabel(data.source || (data.isGrounded ? 'Google Search Grounding' : 'Curated Atelier Knowledge Base'));

      try {
        sessionStorage.setItem('pearl_pick_fashion_advice', JSON.stringify(data));
      } catch {
        // Ignore session quota errors
      }
    } catch (err) {
      console.warn('Failed to load fashion advice, using fallback', err);
      // High-fashion fallback
      setTips([
        {
          id: 'fb-1',
          category: 'Silhouette & Cut',
          title: 'Sculpted Basque Waistlines for Modern Gowns',
          advice: 'Basque corsetry dropping softly below the natural waistline creates an elongated, architectural silhouette that flatters both contemporary evening gowns and Indo-Western bridal lehengas.',
          actionableTip: 'Sculpted basque waist gown in pearl blush organza with fluid train and delicate waist stay',
          tag: 'Runway Trend 2026',
          fabricRecommendation: 'Silk Mikado or Organza (120 GSM) with 12-bone internal casing',
          searchQuery: 'basque waistline couture runway trend 2026'
        },
        {
          id: 'fb-2',
          category: 'Fabric & Draping',
          title: 'Bias-Cut Hand Pleating in Mulberry Silk Organza',
          advice: 'When commissioning floor-sweeping anarkalis or drape sarees, bias-cut hand pleating in 120 GSM organza catches ambient light on every fold without adding unwanted bulk at the waist.',
          actionableTip: 'Bias-cut pleating anarkali with sheer illusion neckline and antique gold zari border',
          tag: 'Artisan Technique',
          fabricRecommendation: 'Mulberry Silk Organza or Tissue Silk with Mulmul Lining',
          searchQuery: 'hand pleating techniques bespoke atelier draping'
        },
        {
          id: 'fb-3',
          category: 'Color Harmony',
          title: 'Rosewater & Antique Champagne Metallic Zari',
          advice: 'Soft pastel rosewater paired with antique champagne zari is dominating 2026 wedding runways. It offers sublime tonal warmth that photographs flawlessly under both natural day and evening chandeliers.',
          actionableTip: 'Rosewater pastel bridal lehenga with champagne silver zardozi embroidery and crystal accents',
          tag: 'Seasonal Palette',
          fabricRecommendation: 'Banarasi Kincob Brocade or Tussar Raw Silk',
          searchQuery: '2026 bridal color trends pastel metallic zari'
        },
        {
          id: 'fb-4',
          category: 'Master Tailoring Secrets',
          title: 'Internal Grosgrain Waist Stays for Heavy Heirlooms',
          advice: 'Request your master darzi to anchor heavy embroidered skirts with a 1.25-inch hidden grosgrain waist stay. This transfers the entire garment weight safely to your pelvic bones, preserving shoulder posture and neck comfort.',
          actionableTip: 'Heirloom bridal lehenga with hidden grosgrain waist stay and reinforced French seams',
          tag: 'Bespoke Fit Rule',
          fabricRecommendation: 'Pure Silk Velvet or Heavy Brocade with cotton canvas fusing',
          searchQuery: 'couture waist stay engineering bespoke garments'
        }
      ]);
      setGroundingQueries([
        '2026 haute couture runway trends',
        'bespoke tailoring techniques and waist stays',
        'luxury bridal pastel metallic color harmonies'
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('silhouette')) return Scissors;
    if (category.toLowerCase().includes('fabric')) return Layers;
    if (category.toLowerCase().includes('color')) return Palette;
    return ShieldCheck;
  };

  return (
    <div id="fashion-advice-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
              Daily Fashion Advice
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF7F2] text-[#8D2434] border border-[#F2D1D7]">
              <Search className="w-3 h-3 text-[#8D2434]" />
              <span>Google Search Grounded</span>
            </span>
          </div>
          <p className="text-xs text-[#7D726A] font-light mt-0.5">
            Real-time runway intelligence, textile draping science & atelier secrets.
          </p>
        </div>

        <button
          onClick={() => fetchAdvice(true)}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white border border-[#ECE6DE] hover:border-[#8D2434] text-xs font-semibold text-[#2D2825] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          title="Refresh Style Advice with Google Search"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#8D2434] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Searching Trends...' : 'Refresh Advice'}</span>
        </button>
      </div>

      {/* Grounding Intelligence Bar / Search Query Chips */}
      {groundingQueries.length > 0 && (
        <div className="p-3 bg-[#FAF7F2] rounded-[16px] border border-[#ECE6DE] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] text-[#7D726A]">
            <span className="font-bold tracking-wider uppercase flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              Live Google Search Grounding Queries
            </span>
            <span className="font-mono text-[#8D2434]">
              {isGrounded ? 'Active Web Grounding' : 'Atelier Archive'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {groundingQueries.map((query, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-white border border-[#ECE6DE] text-[#2D2825] shadow-2xs"
              >
                <Search className="w-2.5 h-2.5 text-[#8D2434]" />
                <span className="font-light truncate max-w-[240px]">{query}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[20px] border border-[#ECE6DE] p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-[#FAF7F2] rounded-full" />
                <div className="w-16 h-4 bg-[#FAF7F2] rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-[#FAF7F2] rounded" />
              <div className="w-full h-12 bg-[#FAF7F2] rounded" />
              <div className="w-full h-8 bg-[#FAF7F2] rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {tips.map((tip) => {
            const Icon = getCategoryIcon(tip.category);
            const isSelected = selectedTipId === tip.id;

            return (
              <div
                key={tip.id}
                className={`group bg-white rounded-[20px] border p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5 ${
                  isSelected ? 'border-[#8D2434] ring-1 ring-[#8D2434]/30' : 'border-[#ECE6DE]'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Category Pill & Tag */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF7F2] text-[#8D2434] border border-[#ECE6DE]">
                      <Icon className="w-3 h-3" />
                      <span>{tip.category}</span>
                    </span>

                    <span className="text-[10px] font-mono text-[#7D726A] bg-[#FAF7F2] px-2 py-0.5 rounded-full">
                      {tip.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D2825] leading-snug">
                    {tip.title}
                  </h3>

                  {/* Advice description */}
                  <p className="text-xs text-[#7D726A] font-light leading-relaxed">
                    {tip.advice}
                  </p>

                  {/* Fabric Recommendation */}
                  {tip.fabricRecommendation && (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-[11px] text-[#2D2825] flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#8D2434] shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-[#8D2434]">Recommended Textile: </span>
                        <span className="font-light">{tip.fabricRecommendation}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action to Launch in AI Studio */}
                <button
                  onClick={() => onApplyTipToGenerator(tip.actionableTip, tip.category)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] group-hover:bg-[#8D2434] text-[#2D2825] group-hover:text-white border border-[#ECE6DE] group-hover:border-[#8D2434] text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="truncate pr-2">Try this style in AI Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sources & Grounding Attribution */}
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#7D726A]">
          <span className="font-medium">Trend Sources:</span>
          {sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 hover:text-[#8D2434] underline"
            >
              <span>{s.title}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
