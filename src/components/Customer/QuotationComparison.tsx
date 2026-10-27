import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  MessageCircle,
  Handshake,
  Send,
  ArrowRightLeft,
  Sparkles,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuotationRequest, TailorQuotation, NegotiationOffer } from '../../types';

interface QuotationComparisonProps {
  quotationRequests: QuotationRequest[];
  onAcceptQuotation: (request: QuotationRequest, quotation: TailorQuotation) => void;
  onSendCounterOffer?: (
    requestId: string,
    quotationId: string,
    amount: number,
    message: string,
    senderRole: 'customer' | 'tailor',
    isFinalOffer?: boolean
  ) => void;
  onAgreeToPrice?: (
    requestId: string,
    quotationId: string,
    party: 'customer' | 'tailor'
  ) => void;
  onOpenChat: (tailorId: string, tailorName: string) => void;
  onNavigateToStudio: () => void;
}

export const QuotationComparison: React.FC<QuotationComparisonProps> = ({
  quotationRequests,
  onAcceptQuotation,
  onSendCounterOffer,
  onAgreeToPrice,
  onOpenChat,
  onNavigateToStudio
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    quotationRequests[0]?.id || ''
  );
  const [counterAmounts, setCounterAmounts] = useState<Record<string, string>>({});
  const [counterNotes, setCounterNotes] = useState<Record<string, string>>({});

  const activeRequest =
    quotationRequests.find((r) => r.id === selectedRequestId) || quotationRequests[0];

  const handleProceedToPayment = (quote: TailorQuotation) => {
    if (!activeRequest) return;
    onAcceptQuotation(activeRequest, quote);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getDefaultHistory = (req: QuotationRequest, quote: TailorQuotation): NegotiationOffer[] => {
    if (quote.negotiationHistory && quote.negotiationHistory.length > 0) {
      return quote.negotiationHistory;
    }
    return [
      {
        id: `neg-init-budget-${quote.id}`,
        quotationId: quote.id,
        senderRole: 'customer',
        senderName: req.customerName || 'Customer',
        amount: req.targetBudget || 4000,
        message: 'Initial customer preferred budget submitted with 3-view AI design.',
        status: 'COUNTERED',
        timestamp: '10:15 AM'
      },
      {
        id: `neg-init-quote-${quote.id}`,
        quotationId: quote.id,
        senderRole: 'tailor',
        senderName: quote.tailorName,
        amount: quote.initialQuoteAmount || quote.totalAmount,
        message: quote.tailorMessage || 'Initial atelier quotation including pure fabric & hand embroidery.',
        status: 'PROPOSED',
        timestamp: '10:42 AM'
      }
    ];
  };

  const handleCustomerCounterSubmit = (quote: TailorQuotation) => {
    if (!activeRequest || !onSendCounterOffer) return;
    const rawVal = Number(counterAmounts[quote.id]);
    if (!rawVal || rawVal <= 0) return;

    const note =
      counterNotes[quote.id]?.trim() ||
      `Customer counteroffer: Can we finalize at ₹${rawVal.toLocaleString('en-IN')}?`;

    onSendCounterOffer(activeRequest.id, quote.id, rawVal, note, 'customer', false);
    setCounterAmounts((prev) => ({ ...prev, [quote.id]: '' }));
    setCounterNotes((prev) => ({ ...prev, [quote.id]: '' }));
  };

  if (quotationRequests.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-3xl border border-[#E4D9D1] space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#2D2825] flex items-center justify-center mx-auto border border-[#E4D9D1]">
          <FileText className="w-7 h-7 text-[#8D2434]" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2D2825]">No Custom Dress Quotation Requests</h2>
        <p className="text-xs text-[#7D726A] max-w-md mx-auto leading-relaxed">
          Generate a 3-view custom dress in the AI Studio and submit it to a verified designer to start price negotiation and custom ordering.
        </p>
        <button
          onClick={onNavigateToStudio}
          className="px-8 py-3.5 rounded-full bg-[#8D2434] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#6E1B28] transition-all shadow-md cursor-pointer"
        >
          Open AI Dress Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-2 sm:px-4">
      {/* Header */}
      <div className="border-b border-[#E4D9D1] pb-5">
        <span className="text-[10px] uppercase tracking-widest text-[#8D2434] font-bold block mb-1">
          BESPOKE QUOTATIONS & LIVE BARGAINING
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#2D2825]">
          Custom Dress Quotations & Price Negotiation
        </h1>
        <p className="text-xs sm:text-sm text-[#7D726A] mt-1 font-light">
          Review itemized quotations, negotiate counteroffers in real time, and lock mutual agreement before proceeding to escrow payment.
        </p>
      </div>

      {/* Request Switcher Pills if multiple requests */}
      {quotationRequests.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {quotationRequests.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedRequestId(req.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                activeRequest?.id === req.id
                  ? 'bg-[#2D2825] text-white border-[#2D2825] shadow-xs'
                  : 'bg-white text-[#7D726A] border-[#E4D9D1] hover:border-[#2D2825]'
              }`}
            >
              <span>{req.variation?.name || 'Custom Garment'}</span>
              <span className="ml-2 text-[10px] opacity-75">
                ({req.quotations?.length || 0} quote{req.quotations?.length === 1 ? '' : 's'})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Target Dress Summary Card with 3 Coordinated Views */}
      {activeRequest && (
        <div className="bg-white rounded-3xl p-6 border border-[#E4D9D1] shadow-xs flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={activeRequest.variation?.frontImageUrl}
                alt="Front"
                referrerPolicy="no-referrer"
                className="w-20 h-26 rounded-xl object-cover object-top border border-[#E4D9D1]"
                title="Front View"
              />
              {activeRequest.variation?.backImageUrl && (
                <img
                  src={activeRequest.variation.backImageUrl}
                  alt="Back"
                  referrerPolicy="no-referrer"
                  className="w-20 h-26 rounded-xl object-cover object-top border border-[#E4D9D1] hidden sm:block"
                  title="Back View"
                />
              )}
              {activeRequest.variation?.sideImageUrl && (
                <img
                  src={activeRequest.variation.sideImageUrl}
                  alt="Side"
                  referrerPolicy="no-referrer"
                  className="w-20 h-26 rounded-xl object-cover object-top border border-[#E4D9D1] hidden sm:block"
                  title="Side View"
                />
              )}
            </div>

            <div className="space-y-1 text-xs pl-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#FAF7F2] text-[#8D2434] font-bold text-[10px] uppercase tracking-wider border border-[#E4D9D1]">
                Request #{activeRequest.id} • 3-View Coordinated Spec
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
                {activeRequest.variation?.name || 'Bespoke Design'}
              </h3>
              <p className="text-[#7D726A]">
                {activeRequest.variation?.specs?.dressType} • {activeRequest.variation?.specs?.fabric} ({activeRequest.variation?.specs?.color})
              </p>
              <p className="text-[#5A4638] italic pt-1 line-clamp-2">
                "{activeRequest.specificInstructions}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-[#E4D9D1] pt-4 lg:pt-0 lg:pl-6 text-xs w-full lg:w-auto justify-between lg:justify-end shrink-0">
            <div>
              <span className="text-[#7D726A] text-[10px] uppercase font-bold tracking-wider block">
                Your Initial Budget
              </span>
              <p className="font-serif text-xl font-bold text-[#2D2825] tabular-nums">
                ₹{activeRequest.targetBudget.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-[#7D726A] text-[10px] uppercase font-bold tracking-wider block">
                Needed By
              </span>
              <p className="font-bold text-[#2D2825] tabular-nums">{activeRequest.neededByDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quotations & Live Bargaining Cards */}
      <div className="space-y-6">
        {activeRequest?.quotations.map((quote) => {
          const history = getDefaultHistory(activeRequest, quote);
          const latestOffer = history[history.length - 1];
          const isBothAgreed = Boolean(quote.customerAgreed && quote.designerAgreed);
          const finalPrice = quote.finalAgreedAmount || quote.totalAmount;

          return (
            <div
              key={quote.id}
              className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-xs space-y-6 transition-all ${
                isBothAgreed
                  ? 'border-emerald-600/50 ring-2 ring-emerald-500/15'
                  : 'border-[#E4D9D1]'
              }`}
            >
              {/* Top Row: Designer Info & Current Price Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4D9D1]">
                <div className="flex items-center gap-3.5">
                  <img
                    src={quote.tailorAvatar}
                    alt={quote.tailorName}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#E4D9D1]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                        {quote.tailorName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E4D9D1] text-[10px] font-bold text-[#2D2825] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                        {quote.tailorRating}
                      </span>
                    </div>
                    <p className="text-xs text-[#7D726A]">{quote.tailorShopName}</p>
                    <p className="text-[11px] text-[#5A4638] mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8D2434]" />
                      <span>Estimated Turnaround: <strong>{quote.estimatedDeliveryDays} Days</strong> ({quote.proposedDeliveryDate})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 bg-[#FAF7F2] px-5 py-3 rounded-2xl border border-[#E4D9D1]">
                  <div>
                    <span className="text-[10px] text-[#7D726A] uppercase font-bold tracking-wider block">
                      Customer Budget
                    </span>
                    <span className="font-mono text-sm font-bold text-[#7D726A] tabular-nums">
                      ₹{activeRequest.targetBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ArrowRightLeft className="w-4 h-4 text-[#7D726A]" />
                  <div>
                    <span className="text-[10px] text-[#8D2434] uppercase font-bold tracking-wider block">
                      {isBothAgreed ? 'Final Agreed Price' : 'Current Active Offer'}
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#8D2434] tabular-nums">
                      ₹{finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Grid: Left = Itemized Breakdown, Right = Interactive Price Negotiation History */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 cols: Itemized Breakdown & Milestones */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-[#2D2825] uppercase text-[10px] tracking-wider">
                      Itemized Atelier Cost Breakdown
                    </h4>
                    <div className="space-y-2 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E4D9D1]">
                      {quote.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs py-0.5">
                          <span className="text-[#5A4638]">{item.description}</span>
                          <span className="font-bold text-[#2D2825] tabular-nums">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[#E4D9D1] flex justify-between font-bold text-[#2D2825]">
                        <span>Current Total</span>
                        <span className="text-[#8D2434] tabular-nums">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Production Milestones */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-[#2D2825] uppercase text-[10px] tracking-wider">
                      Escrow Release Milestones
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {quote.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] text-center"
                        >
                          <span className="font-bold text-[#2D2825] text-xs block tabular-nums">
                            {m.percentage}%
                          </span>
                          <span className="text-[10px] text-[#7D726A] line-clamp-1">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 7 cols: Multi-Round Price Negotiation Console */}
                <div className="lg:col-span-7 bg-[#FAF7F2] rounded-2xl border border-[#E4D9D1] p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E4D9D1] pb-3">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-[#8D2434]" />
                      <h4 className="font-serif text-base font-bold text-[#2D2825]">
                        Price Negotiation & Bargaining Timeline
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isBothAgreed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isBothAgreed ? 'Mutual Agreement Locked' : 'Negotiation Open'}
                      </span>
                    </div>
                  </div>

                  {/* Timestamped Negotiation History */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {history.map((offer, idx) => {
                      const isCustomer = offer.senderRole === 'customer';
                      return (
                        <div
                          key={offer.id || idx}
                          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                            isCustomer
                              ? 'bg-white border-[#E4D9D1]'
                              : 'bg-[#FBECEF]/60 border-[#8D2434]/25'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2D2825]">
                                {isCustomer ? `Customer (${offer.senderName})` : `Designer (${offer.senderName})`}
                              </span>
                              {offer.isFinalOffer && (
                                <span className="px-2 py-0.2 rounded bg-[#8D2434] text-white text-[9px] font-bold uppercase">
                                  Final Offer
                                </span>
                              )}
                              <span className="text-[10px] text-[#7D726A] tabular-nums">
                                • {offer.timestamp}
                              </span>
                            </div>
                            <p className="text-[#5A4638] text-[11px]">{offer.message}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-serif text-base font-bold text-[#2D2825] tabular-nums block">
                              ₹{offer.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-[#7D726A]">
                              {offer.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Agreement Status Pills */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        quote.customerAgreed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-white border-[#E4D9D1] text-[#7D726A]'
                      }`}
                    >
                      <span className="font-semibold">Customer Agreement:</span>
                      <span className="font-bold">
                        {quote.customerAgreed ? '✓ Agreed' : 'Pending'}
                      </span>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        quote.designerAgreed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-white border-[#E4D9D1] text-[#7D726A]'
                      }`}
                    >
                      <span className="font-semibold">Designer Agreement:</span>
                      <span className="font-bold">
                        {quote.designerAgreed ? '✓ Agreed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Counteroffer Input Controls (when not yet mutually locked) */}
                  {!isBothAgreed && quote.status !== 'ACCEPTED' && (
                    <div className="pt-2 border-t border-[#E4D9D1] space-y-2.5">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative sm:w-40 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7D726A]">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={counterAmounts[quote.id] || ''}
                            onChange={(e) =>
                              setCounterAmounts((prev) => ({ ...prev, [quote.id]: e.target.value }))
                            }
                            placeholder="e.g. 4500"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs font-bold text-[#2D2825] tabular-nums"
                          />
                        </div>
                        <input
                          type="text"
                          value={counterNotes[quote.id] || ''}
                          onChange={(e) =>
                            setCounterNotes((prev) => ({ ...prev, [quote.id]: e.target.value }))
                          }
                          placeholder="Add note to designer (e.g. Can we close at ₹4,500?)"
                          className="flex-1 px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs text-[#2D2825]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCustomerCounterSubmit(quote)}
                          className="px-4 py-2 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Counteroffer</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7D726A]">
                        <span>
                          Latest offer by <strong>{latestOffer?.senderRole === 'tailor' ? quote.tailorName : 'You'}</strong>:{' '}
                          <strong className="text-[#2D2825]">₹{finalPrice.toLocaleString('en-IN')}</strong>
                        </span>
                        {onAgreeToPrice && (
                          <button
                            type="button"
                            onClick={() => onAgreeToPrice(activeRequest.id, quote.id, 'customer')}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept ₹{finalPrice.toLocaleString('en-IN')} & Lock Agreement</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-4 border-t border-[#E4D9D1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={() => onOpenChat(quote.tailorId, quote.tailorName)}
                  className="px-5 py-3 rounded-xl bg-[#FAF7F2] text-[#2D2825] border border-[#E4D9D1] text-xs font-bold uppercase tracking-wider hover:bg-[#EFE9E2] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#8D2434]" />
                  <span>Message Designer ({quote.tailorName})</span>
                </button>

                {quote.status === 'ACCEPTED' ? (
                  <div className="px-6 py-3.5 rounded-xl bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Complete • Order In Production</span>
                  </div>
                ) : isBothAgreed ? (
                  <button
                    onClick={() => handleProceedToPayment(quote)}
                    className="px-8 py-3.5 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      Both Parties Agreed — Pay ₹{finalPrice.toLocaleString('en-IN')} in Escrow
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onAgreeToPrice) {
                        onAgreeToPrice(activeRequest.id, quote.id, 'customer');
                      } else {
                        handleProceedToPayment(quote);
                      }
                    }}
                    className="px-6 py-3.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      Agree to ₹{finalPrice.toLocaleString('en-IN')} & Proceed to Payment
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
