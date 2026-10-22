import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Star, 
  DollarSign, 
  ArrowRight, 
  Sparkles,
  MessageCircle,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuotationRequest, TailorQuotation } from '../../types';

interface QuotationComparisonProps {
  quotationRequests: QuotationRequest[];
  onAcceptQuotation: (request: QuotationRequest, quotation: TailorQuotation) => void;
  onOpenChat: (tailorId: string, tailorName: string) => void;
  onNavigateToStudio: () => void;
}

export const QuotationComparison: React.FC<QuotationComparisonProps> = ({
  quotationRequests,
  onAcceptQuotation,
  onOpenChat,
  onNavigateToStudio,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    quotationRequests[0]?.id || ''
  );

  const activeRequest = quotationRequests.find((r) => r.id === selectedRequestId) || quotationRequests[0];

  const handleAccept = (quote: TailorQuotation) => {
    if (!activeRequest) return;
    onAcceptQuotation(activeRequest, quote);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (quotationRequests.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white/80 backdrop-blur-md rounded-[36px] border border-[#4A3728]/10 space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#F5F2ED] text-[#4A3728] flex items-center justify-center mx-auto shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#4A3728]">No Active Quotation Requests</h2>
        <p className="text-xs text-[#6B584C] max-w-md mx-auto leading-relaxed font-light">
          You haven't requested quotations from master tailors yet. Design a dress in the AI Studio and broadcast your request to receive bids.
        </p>
        <button
          onClick={onNavigateToStudio}
          className="px-8 py-3.5 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-widest hover:scale-95 transition-all shadow-md cursor-pointer"
        >
          Open AI Dress Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Bespoke Bidding</span>
        <h1 className="font-serif text-3xl font-bold text-[#4A3728]">Tailor Quotation Comparison</h1>
        <p className="text-xs text-[#6B584C] mt-1 font-light">Review itemized quotations from master artisans and select the best atelier for your garment.</p>
      </div>

      {/* Request Switcher Pills if multiple requests */}
      {quotationRequests.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {quotationRequests.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedRequestId(req.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                selectedRequestId === req.id
                  ? 'bg-[#4A3728] text-[#FBD7D1] border-[#4A3728] shadow-xs'
                  : 'bg-white text-[#6B584C] border-[#4A3728]/10 hover:bg-[#F5F2ED]'
              }`}
            >
              <span>{req.variation?.name || 'Custom Garment'}</span>
              <span className="ml-2 text-[10px] opacity-75">({req.quotations?.length || 0} quotes)</span>
            </button>
          ))}
        </div>
      )}

      {/* Target Dress Summary Card */}
      {activeRequest && (
        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-[#4A3728]/10 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <img
            src={activeRequest.variation?.frontImageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'}
            alt={activeRequest.variation?.name || 'Design'}
            referrerPolicy="no-referrer"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-[#4A3728]/10 shadow-xs"
          />
          <div className="flex-1 space-y-1 text-xs">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F5F2ED] text-[#4A3728] font-bold text-[10px] uppercase tracking-wider border border-[#4A3728]/10">
              <span>Request ID: {activeRequest.id}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#4A3728]">{activeRequest.variation?.name || 'Bespoke Design'}</h3>
            <p className="text-[#6B584C] font-light">{activeRequest.variation?.specs?.dressType || 'Gown'} • {activeRequest.variation?.specs?.fabric || 'Luxury Fabric'} ({activeRequest.variation?.specs?.color || 'Color'})</p>
            <p className="text-[#8C7A6B] italic pt-1 font-light">"{activeRequest.specificInstructions}"</p>
          </div>
          <div className="text-right border-t md:border-t-0 md:border-l border-[#4A3728]/10 pt-3 md:pt-0 md:pl-6 text-xs shrink-0">
            <span className="text-[#8C7A6B] text-[9px] uppercase font-bold tracking-wider">Target Budget</span>
            <p className="text-base font-bold text-[#4A3728]">₹{activeRequest.targetBudget.toLocaleString('en-IN')}</p>
            <span className="text-[#8C7A6B] text-[9px] uppercase font-bold tracking-wider block mt-1">Needed By</span>
            <p className="font-bold text-[#4A3728]">{activeRequest.neededByDate}</p>
          </div>
        </div>
      )}

      {/* Quotation Comparison Matrix (Cards Side-by-Side) */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#4A3728]">
          Received Tailor Bids ({activeRequest?.quotations.length || 0})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeRequest?.quotations.map((quote) => (
            <div
              key={quote.id}
              className={`bg-white/80 backdrop-blur-md rounded-[32px] border p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6 transition-all ${
                quote.status === 'ACCEPTED'
                  ? 'border-[#4A3728] ring-2 ring-[#4A3728]/20'
                  : 'border-[#4A3728]/10 hover:shadow-xl hover:shadow-[#4A3728]/5'
              }`}
            >
              <div>
                
                {/* Tailor Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#4A3728]/10">
                  <div className="flex items-center space-x-3">
                    <img
                      src={quote.tailorAvatar}
                      alt={quote.tailorName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#4A3728]/20 shadow-xs"
                    />
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#4A3728]">{quote.tailorName}</h3>
                      <p className="text-xs text-[#8C7A6B]">{quote.tailorShopName}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-[#D4A373] font-bold mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{quote.tailorRating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider">Total Bid</span>
                    <p className="font-serif text-2xl font-bold text-[#C72C48]">₹{quote.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Tailor Message */}
                <div className="my-4 p-4 rounded-[20px] bg-[#F5F2ED]/60 border border-[#4A3728]/10 text-xs text-[#4A3728] italic leading-relaxed font-light">
                  "{quote.tailorMessage}"
                </div>

                {/* Itemized Price Breakdown */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#4A3728] uppercase text-[10px] tracking-wider">Itemized Cost Breakdown</h4>
                  <div className="space-y-1.5 bg-[#F5F2ED]/40 p-3.5 rounded-[20px] border border-[#4A3728]/10">
                    {quote.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs py-0.5">
                        <span className="text-[#6B584C]">{item.description}</span>
                        <span className="font-bold text-[#4A3728]">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestone Schedule */}
                <div className="mt-4 space-y-2 text-xs">
                  <h4 className="font-bold text-[#4A3728] uppercase text-[10px] tracking-wider">Escrow Milestone Schedule</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {quote.milestones.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 text-center shadow-xs">
                        <span className="font-bold text-[#4A3728] text-xs block">{m.percentage}%</span>
                        <span className="text-[10px] text-[#8C7A6B] line-clamp-1">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline & Delivery */}
                <div className="mt-4 pt-4 border-t border-[#4A3728]/10 flex items-center justify-between text-xs text-[#6B584C]">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-[#8C6547]" />
                    <span>Est. Turnaround: <strong>{quote.estimatedDeliveryDays} Days</strong></span>
                  </div>
                  <span>Delivery: <strong>{quote.proposedDeliveryDate}</strong></span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#4A3728]/10 flex items-center space-x-2">
                <button
                  onClick={() => onOpenChat(quote.tailorId, quote.tailorName)}
                  className="px-4 py-3.5 rounded-full bg-white text-[#4A3728] border border-[#4A3728]/10 text-xs font-bold uppercase tracking-wider hover:bg-[#F5F2ED] transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Ask questions before accepting"
                >
                  <MessageCircle className="w-4 h-4 text-[#8C6547]" />
                  <span>Discuss Fit</span>
                </button>

                {quote.status === 'ACCEPTED' ? (
                  <div className="flex-1 py-3.5 rounded-full bg-[#4A3728] text-[#FBD7D1] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accepted & In Production</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAccept(quote)}
                    className="flex-1 py-3.5 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-widest hover:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FBD7D1]" />
                    <span>Accept Quote & Lock Escrow</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
