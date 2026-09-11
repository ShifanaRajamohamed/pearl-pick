import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MessageCircle, 
  Package, 
  Star, 
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Camera,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, Review } from '../../types';

interface OrderTrackingViewProps {
  orders: Order[];
  onOpenChat: (tailorId: string, tailorName: string) => void;
  onSubmitReview: (orderId: string, tailorId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onOpenChat,
  onSubmitReview,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  
  // Review form states
  const [ratingFit, setRatingFit] = useState<number>(5);
  const [ratingCraft, setRatingCraft] = useState<number>(5);
  const [ratingOverall, setRatingOverall] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>(
    'The fit is immaculate and the hand-finished seams are extraordinary.'
  );

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED');
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const displayedOrders = filterTab === 'ACTIVE' 
    ? (activeOrders.length > 0 ? activeOrders : orders)
    : completedOrders;

  const currentOrder = displayedOrders.find((o) => o.id === selectedOrderId) || displayedOrders[0] || orders[0];
  const activeVariation = currentOrder?.variation || currentOrder?.design;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;
    
    onSubmitReview(currentOrder.id, currentOrder.tailorId, {
      customerId: currentOrder.customerId,
      customerName: currentOrder.customerName,
      customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      ratingFit,
      ratingCraft,
      ratingPunctuality: 5,
      ratingOverall,
      comment: reviewComment,
      dressTitle: activeVariation?.name || 'Bespoke Garment',
      photos: [activeVariation?.frontImageUrl || '']
    });

    setShowReviewModal(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#8D2434', '#D4AF37', '#2D2825']
    });
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[#8E847D] flex items-center justify-center mx-auto shadow-2xs">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2D2825]">No Orders Yet</h2>
        <p className="text-sm text-[#7D726A] font-light leading-relaxed">
          When you commission a design with a master tailor, you can track its handcrafted progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 pt-2 px-1">
      
      {/* Editorial Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-[#7D726A] mt-1 font-light">
          Track tailoring craftsmanship, milestones, and doorstep delivery.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ECE6DE] pb-2">
        <button
          onClick={() => {
            setFilterTab('ACTIVE');
            if (activeOrders[0]) setSelectedOrderId(activeOrders[0].id);
          }}
          className={`text-xs font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
            filterTab === 'ACTIVE'
              ? 'border-[#2D2825] text-[#2D2825]'
              : 'border-transparent text-[#8E847D] hover:text-[#2D2825]'
          }`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => {
            setFilterTab('COMPLETED');
            if (completedOrders[0]) setSelectedOrderId(completedOrders[0].id);
          }}
          className={`text-xs font-semibold pb-2 border-b-2 transition-all cursor-pointer ml-4 ${
            filterTab === 'COMPLETED'
              ? 'border-[#2D2825] text-[#2D2825]'
              : 'border-transparent text-[#8E847D] hover:text-[#2D2825]'
          }`}
        >
          Past Orders ({completedOrders.length})
        </button>
      </div>

      {/* Multiple Orders Selector (if more than 1 order) */}
      {displayedOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {displayedOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                (currentOrder?.id === o.id)
                  ? 'bg-[#2D2825] text-[#FAF7F2] border-[#2D2825]'
                  : 'bg-white text-[#7D726A] border-[#ECE6DE] hover:border-[#2D2825]'
              }`}
            >
              #{o.id} • {o.variation?.name?.slice(0, 16) || 'Bespoke Dress'}
            </button>
          ))}
        </div>
      )}

      {/* Active Order Card */}
      {currentOrder && (
        <div className="space-y-4">
          
          {/* Main Order Card */}
          <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
            
            {/* Header: Order ID & Status */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F4EFEA]">
              <div>
                <span className="text-[11px] font-mono font-medium text-[#8E847D] block">
                  Order #{currentOrder.id}
                </span>
                <span className="text-xs text-[#7D726A]">
                  Placed on {new Date(currentOrder.orderDate || currentOrder.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FBECEF] text-[#8D2434] border border-[#F2D1D7]">
                {currentOrder.status === 'DELIVERED' 
                  ? 'Delivered' 
                  : currentOrder.status === 'IN_PRODUCTION' 
                  ? 'In Production' 
                  : 'Active Tailoring'}
              </span>
            </div>

            {/* Garment Preview Details */}
            <div className="flex items-start gap-4">
              <img
                src={activeVariation?.frontImageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'}
                alt={activeVariation?.name || 'Garment preview'}
                referrerPolicy="no-referrer"
                className="w-20 h-24 rounded-xl object-cover border border-[#ECE6DE] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-base font-bold text-[#2D2825] truncate">
                  {activeVariation?.name || 'Bespoke Haute Couture Dress'}
                </h3>
                <p className="text-xs text-[#7D726A] mt-0.5">
                  {activeVariation?.specs?.fabric || 'Pure Mulberry Silk'} • {activeVariation?.specs?.color || 'Pearl Blush'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={currentOrder.tailorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                    alt={currentOrder.tailorName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-[#ECE6DE]"
                  />
                  <span className="text-xs font-medium text-[#2D2825]">
                    {currentOrder.tailorName}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#2D2825] mt-2">
                  ₹{Number(currentOrder.totalAmount || 38000).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#F4EFEA]">
              <button
                onClick={() => onOpenChat(currentOrder.tailorId, currentOrder.tailorName)}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2D2825] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                <span>Message Tailor</span>
              </button>

              {currentOrder.status === 'DELIVERED' ? (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="py-2.5 px-4 rounded-full bg-[#8D2434] text-white text-xs font-semibold hover:bg-[#781E2C] transition-colors cursor-pointer"
                >
                  Write Review
                </button>
              ) : (
                <div className="px-3 py-1.5 text-right">
                  <span className="text-[10px] text-[#8E847D] block">Est. Delivery</span>
                  <span className="text-xs font-bold text-[#2D2825]">
                    {currentOrder.estimatedDeliveryDate || 'Sep 22, 2026'}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Craftsmanship & Production Milestones Card */}
          <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
              <h4 className="font-serif text-sm font-bold text-[#2D2825] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8D2434]" />
                <span>Tailoring Progress</span>
              </h4>
              <span className="text-[11px] text-[#8E847D]">
                Step {currentOrder.milestones.filter(m => m.status === 'COMPLETED' || m.completed).length + 1} of {currentOrder.milestones.length}
              </span>
            </div>

            {/* Visual Progress Timeline */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECE6DE]">
              {currentOrder.milestones.map((m, idx) => {
                const isCompleted = m.status === 'COMPLETED' || m.completed;
                const isInProgress = m.status === 'IN_PROGRESS' || (!isCompleted && idx === currentOrder.milestones.findIndex(x => !x.completed && x.status !== 'COMPLETED'));
                const title = m.title || m.label || m.stage || `Stage ${idx + 1}`;
                const proof = m.photoProof || m.photoUrl;

                return (
                  <div key={m.id || idx} className="relative flex items-start gap-3.5 pl-1">
                    
                    {/* Status Dot */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shrink-0 mt-0.5 transition-all ${
                        isCompleted
                          ? 'bg-[#2D2825] text-white ring-4 ring-white'
                          : isInProgress
                          ? 'bg-[#8D2434] text-white ring-4 ring-[#FBECEF]'
                          : 'bg-[#FAF7F2] text-[#8E847D] border border-[#ECE6DE]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    {/* Milestone Details */}
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isCompleted ? 'text-[#2D2825]' : isInProgress ? 'text-[#8D2434]' : 'text-[#8E847D]'}`}>
                          {title}
                        </span>
                        {m.completedAt && (
                          <span className="text-[10px] text-[#8E847D]">
                            {new Date(m.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[#7D726A] font-light mt-0.5 leading-relaxed">
                        {m.description}
                      </p>

                      {/* Tailor photo proof attachment */}
                      {proof && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={proof}
                            alt="Milestone photo proof"
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover border border-[#ECE6DE]"
                          />
                          <span className="text-[10px] text-[#8E847D]">
                            Atelier progress photo
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Escrow Trust Note */}
          <div className="bg-[#FAF7F2] rounded-[16px] border border-[#ECE6DE] p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#8D2434] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-[#2D2825] block">
                Bharat Escrow Buyer Protection
              </span>
              <span className="text-[#7D726A] font-light">
                Funds are disbursed to the tailor only after you receive and approve the bespoke fit.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Review & Feedback Modal */}
      {showReviewModal && currentOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-xl space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                  Rate Your Experience
                </h3>
                <p className="text-xs text-[#7D726A]">
                  {currentOrder.tailorName} • {activeVariation?.name || 'Bespoke Dress'}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              
              {/* Rating metrics */}
              <div className="space-y-3 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#ECE6DE]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2D2825]">Precision Fit</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setRatingFit(s)}
                        className={`w-4 h-4 cursor-pointer transition-colors ${
                          s <= ratingFit ? 'text-[#8D2434] fill-[#8D2434]' : 'text-[#ECE6DE]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2D2825]">Craftsmanship</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setRatingCraft(s)}
                        className={`w-4 h-4 cursor-pointer transition-colors ${
                          s <= ratingCraft ? 'text-[#8D2434] fill-[#8D2434]' : 'text-[#ECE6DE]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2D2825]">Overall Quality</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setRatingOverall(s)}
                        className={`w-4 h-4 cursor-pointer transition-colors ${
                          s <= ratingOverall ? 'text-[#8D2434] fill-[#8D2434]' : 'text-[#ECE6DE]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2D2825] block mb-1">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-[#ECE6DE] text-xs text-[#2D2825] focus:outline-none focus:border-[#2D2825] resize-none"
                  placeholder="Share details about the fabric, seams, and fit..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
