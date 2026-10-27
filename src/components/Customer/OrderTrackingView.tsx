import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, 
  MessageCircle, 
  Package, 
  Star, 
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Camera,
  Upload,
  Plus,
  X,
  Printer,
  Maximize2,
  Play,
  Pause,
  Layers,
  Clock,
  Scissors,
  Image as ImageIcon,
  Check,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import * as d3 from 'd3';
import { Order, Review, MilestoneProgressPhoto, MilestoneRating } from '../../types';
import { PrintableOrderSummary } from './PrintableOrderSummary';
import { fireCelebrationConfetti, SuccessCelebrationOverlay } from '../Common/SuccessCelebrationOverlay';

interface OrderTrackingViewProps {
  orders: Order[];
  onOpenChat: (tailorId: string, tailorName: string) => void;
  onSubmitReview: (orderId: string, tailorId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  onConfirmDelivery?: (orderId: string) => void;
  onUploadMilestonePhoto?: (
    orderId: string,
    milestoneId: string,
    photo: Omit<MilestoneProgressPhoto, 'id' | 'uploadedAt'>,
    markStatus?: 'IN_PROGRESS' | 'COMPLETED'
  ) => void;
  onRateMilestone?: (
    orderId: string,
    milestoneId: string,
    rating: MilestoneRating
  ) => void;
  onOpenFabricLibrary?: () => void;
}

const ACTIONABLE_IMPROVEMENT_TAGS = [
  'Maintain 2.5" Seam Margin',
  'More Daylight Macro Photos',
  'Tighter Zardozi & Stitch Tension',
  'Faster Stage Turnaround',
  'Proactive Schedule Updates',
  'Exact Bust & Waist Contour',
  'Immaculate Weave & Drape'
];

const ATELIER_CRAFT_PRESETS = [
  {
    label: 'Raw Silk Bolt Inspection',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: 'Pure 360 GSM mulberry silk bolt inspected under natural atelier daylight for weave tension.'
  },
  {
    label: 'Chalk & Paper Pattern Draft',
    url: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: '16-panel architectural kali paper pattern drafted with 2.5-inch inner seam margin.'
  },
  {
    label: 'Mannequin Baste Fitting',
    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: 'First baste toile fitting mounted on calibrated dress form to verify bust and waist contour.'
  },
  {
    label: 'Zardozi Adda Handwork',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: 'Master karigars hand-couching 24K gold dabka bullion and kundan motifs on the wooden adda frame.'
  },
  {
    label: 'Tuxedo / Bandhgala Canvas',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: 'Floating horsehair chest canvas hand-padded with silk thread for structured lapel roll.'
  },
  {
    label: 'Couture Steam & Packaging',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=85',
    defaultCaption: 'Final quality inspection passed; steam-finished and packed in velvet heritage keepsake box.'
  }
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onOpenChat,
  onSubmitReview,
  onConfirmDelivery,
  onUploadMilestonePhoto,
  onRateMilestone,
  onOpenFabricLibrary,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showDeliveryCelebration, setShowDeliveryCelebration] = useState<boolean>(false);

  // Carousel States
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState<string>('ALL');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<(MilestoneProgressPhoto & { milestoneTitle: string; milestoneIndex: number }) | null>(null);
  const [selectedTimelineStageIdx, setSelectedTimelineStageIdx] = useState<number | null>(null);

  // Tailor Milestone Upload Modal States
  const [uploadingMilestone, setUploadingMilestone] = useState<{
    id: string;
    title: string;
    index: number;
  } | null>(null);
  const [uploadPhotoUrl, setUploadPhotoUrl] = useState<string>(ATELIER_CRAFT_PRESETS[0].url);
  const [uploadCaption, setUploadCaption] = useState<string>(ATELIER_CRAFT_PRESETS[0].defaultCaption);
  const [uploadStatusUpdate, setUploadStatusUpdate] = useState<'KEEP' | 'IN_PROGRESS' | 'COMPLETED'>('COMPLETED');
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Individual Milestone Quality & Timeliness Rating States
  const [localMilestoneRatings, setLocalMilestoneRatings] = useState<Record<string, MilestoneRating>>({});
  const [ratingModalMilestone, setRatingModalMilestone] = useState<{
    id: string;
    title: string;
    index: number;
    status: string;
  } | null>(null);
  const [msQualityScore, setMsQualityScore] = useState<number>(5);
  const [msTimelinessScore, setMsTimelinessScore] = useState<number>(5);
  const [msImprovementTags, setMsImprovementTags] = useState<string[]>([
    'Maintain 2.5" Seam Margin',
    'More Daylight Macro Photos'
  ]);
  const [msCustomerComment, setMsCustomerComment] = useState<string>('');
  const [milestoneRatingBanner, setMilestoneRatingBanner] = useState<string | null>(null);

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

  // Build unified list of all milestone progress photos for the Craft Journey Carousel
  const allJourneyPhotos: (MilestoneProgressPhoto & {
    milestoneId: string;
    milestoneTitle: string;
    milestoneIndex: number;
    milestoneStatus: string;
  })[] = React.useMemo(() => {
    if (!currentOrder) return [];
    const list: (MilestoneProgressPhoto & {
      milestoneId: string;
      milestoneTitle: string;
      milestoneIndex: number;
      milestoneStatus: string;
    })[] = [];

    currentOrder.milestones.forEach((m, idx) => {
      const mId = m.id || m.stage || `ms-${idx}`;
      const mTitle = m.title || m.label || m.stage || `Stage ${idx + 1}`;
      const mStatus = m.status || (m.completed ? 'COMPLETED' : 'PENDING');

      if (m.progressPhotos && m.progressPhotos.length > 0) {
        m.progressPhotos.forEach((p) => {
          list.push({
            ...p,
            milestoneId: mId,
            milestoneTitle: mTitle,
            milestoneIndex: idx + 1,
            milestoneStatus: mStatus
          });
        });
      } else if (m.photoProof || m.photoUrl || m.photoProofUrl) {
        const legacyUrl = m.photoProof || m.photoUrl || m.photoProofUrl || '';
        list.push({
          id: `legacy-${mId}`,
          url: legacyUrl,
          caption: m.tailorNote || m.description,
          uploadedAt: m.completedAt || currentOrder.createdAt || new Date().toISOString(),
          uploadedBy: currentOrder.tailorName,
          stageLabel: mTitle,
          milestoneId: mId,
          milestoneTitle: mTitle,
          milestoneIndex: idx + 1,
          milestoneStatus: mStatus
        });
      }
    });

    return list;
  }, [currentOrder]);

  const filteredCarouselPhotos = selectedMilestoneFilter === 'ALL'
    ? allJourneyPhotos
    : allJourneyPhotos.filter((p) => p.milestoneId === selectedMilestoneFilter);

  const safeSlideIndex = filteredCarouselPhotos.length > 0
    ? Math.min(activeSlideIndex, filteredCarouselPhotos.length - 1)
    : 0;

  const currentCarouselPhoto = filteredCarouselPhotos[safeSlideIndex] || null;

  // Build D3.js & Recharts Visual Delivery Timeline Data
  const timelineAnalytics = useMemo(() => {
    if (!currentOrder || !currentOrder.milestones || currentOrder.milestones.length === 0) {
      return null;
    }

    const totalStages = currentOrder.milestones.length;
    const orderStartMs = new Date(currentOrder.orderDate || currentOrder.createdAt || Date.now() - 10 * 86400000).getTime();
    const estDeliveryStr = currentOrder.estimatedDelivery || currentOrder.estimatedDeliveryDate;
    const estDeliveryMs = estDeliveryStr
      ? new Date(estDeliveryStr).getTime()
      : orderStartMs + 18 * 86400000;

    const firstPendingIdx = currentOrder.milestones.findIndex(
      (m) => !m.completed && m.status !== 'COMPLETED'
    );

    let completedCount = 0;
    let inProgressCount = 0;

    const chartData = currentOrder.milestones.map((m, idx) => {
      const isCompleted = m.status === 'COMPLETED' || Boolean(m.completed);
      const isInProgress =
        m.status === 'IN_PROGRESS' || (!isCompleted && idx === firstPendingIdx);

      if (isCompleted) completedCount += 1;
      else if (isInProgress) inProgressCount += 1;

      const mId = m.id || m.stage || `ms-${idx}`;
      const title = m.title || m.label || m.stage || `Stage ${idx + 1}`;
      const shortStage = `S${idx + 1}: ${title.split(' ')[0]}`;
      const targetProgressPct = Math.round(((idx + 1) / totalStages) * 100);

      // Actual cumulative craft progress percentage at this stage
      const actualProgressPct = isCompleted
        ? targetProgressPct
        : isInProgress
        ? Math.round(((idx + 0.55) / totalStages) * 100)
        : null;

      // Estimated schedule date for this stage using d3.interpolateNumber
      const stageTargetMs = d3.interpolateNumber(
        orderStartMs,
        estDeliveryMs
      )((idx + 1) / totalStages);

      const formattedTargetDate = new Date(stageTargetMs).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      const formattedCompletedDate = m.completedAt
        ? new Date(m.completedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        : null;

      const stagePhotosCount = allJourneyPhotos.filter((p) => p.milestoneId === mId).length;

      return {
        index: idx,
        stageNumber: idx + 1,
        id: mId,
        title,
        shortStage,
        description: m.description || 'Bespoke atelier craftsmanship stage.',
        status: isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'PENDING',
        targetProgressPct,
        actualProgressPct,
        displayProgressPct: actualProgressPct !== null ? actualProgressPct : 0,
        formattedTargetDate,
        formattedCompletedDate,
        dateLabel: formattedCompletedDate || `Est. ${formattedTargetDate}`,
        photoCount: stagePhotosCount
      };
    });

    const overallProgressPct = Math.min(
      100,
      Math.round(((completedCount + inProgressCount * 0.5) / totalStages) * 100)
    );

    // D3 SVG Horizontal Node Coordinate & Smooth Curve Generator (ViewBox 600 x 96)
    const svgWidth = 600;
    const svgHeight = 96;
    const padX = 46;
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, totalStages - 1)])
      .range([padX, svgWidth - padX]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([66, 24]);

    const d3Nodes = chartData.map((d, i) => ({
      ...d,
      cx: xScale(i),
      cy: yScale(d.targetProgressPct)
    }));

    const lineGenerator = d3
      .line<(typeof d3Nodes)[0]>()
      .x((d) => d.cx)
      .y((d) => d.cy)
      .curve(d3.curveMonotoneX);

    const fullTrackPath = lineGenerator(d3Nodes) || '';
    const activeNodes = d3Nodes.filter(
      (n) => n.status === 'COMPLETED' || n.status === 'IN_PROGRESS'
    );
    const activeTrackPath = activeNodes.length > 1 ? lineGenerator(activeNodes) || '' : '';

    const defaultInspectIdx =
      selectedTimelineStageIdx !== null && selectedTimelineStageIdx < chartData.length
        ? selectedTimelineStageIdx
        : firstPendingIdx >= 0
        ? firstPendingIdx
        : chartData.length - 1;

    const daysRemaining = Math.max(
      0,
      Math.ceil((estDeliveryMs - Date.now()) / 86400000)
    );

    return {
      chartData,
      d3Nodes,
      fullTrackPath,
      activeTrackPath,
      svgWidth,
      svgHeight,
      overallProgressPct,
      completedCount,
      totalStages,
      daysRemaining,
      estDeliveryFormatted: new Date(estDeliveryMs).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      inspectedStage: chartData[defaultInspectIdx] || chartData[0]
    };
  }, [currentOrder, allJourneyPhotos, selectedTimelineStageIdx]);

  // Auto-play timer for the Craft Journey Carousel
  useEffect(() => {
    if (!isAutoPlaying || filteredCarouselPhotos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % filteredCarouselPhotos.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlaying, filteredCarouselPhotos.length]);

  const handlePrevSlide = () => {
    if (filteredCarouselPhotos.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + filteredCarouselPhotos.length) % filteredCarouselPhotos.length);
  };

  const handleNextSlide = () => {
    if (filteredCarouselPhotos.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % filteredCarouselPhotos.length);
  };

  const handleOpenUploadModal = (milestoneId: string, milestoneTitle: string, index: number) => {
    const preset = ATELIER_CRAFT_PRESETS[index % ATELIER_CRAFT_PRESETS.length];
    setUploadingMilestone({ id: milestoneId, title: milestoneTitle, index });
    setUploadPhotoUrl(preset.url);
    setUploadCaption(`${milestoneTitle}: ${preset.defaultCaption}`);
    setUploadStatusUpdate('COMPLETED');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !uploadingMilestone || !uploadPhotoUrl.trim()) return;

    if (onUploadMilestonePhoto) {
      onUploadMilestonePhoto(
        currentOrder.id,
        uploadingMilestone.id,
        {
          url: uploadPhotoUrl.trim(),
          caption: uploadCaption.trim() || `Atelier progress update for ${uploadingMilestone.title}`,
          uploadedBy: currentOrder.tailorName,
          stageLabel: uploadingMilestone.title
        },
        uploadStatusUpdate === 'KEEP' ? undefined : uploadStatusUpdate
      );
    }

    setSelectedMilestoneFilter('ALL');
    // Jump carousel to latest uploaded photo
    setTimeout(() => {
      setActiveSlideIndex(allJourneyPhotos.length);
    }, 50);

    setUploadSuccessBanner(`New progress photo published to "${uploadingMilestone.title}" in the live Craft Journey Carousel!`);
    setUploadingMilestone(null);
    setTimeout(() => setUploadSuccessBanner(null), 4500);
  };

  const handleConfirmDeliveryClick = () => {
    if (!currentOrder) return;
    if (onConfirmDelivery) {
      onConfirmDelivery(currentOrder.id);
    }
    setShowDeliveryCelebration(true);
    fireCelebrationConfetti();
  };

  // Resolve effective rating for a milestone (customer-submitted or seeded initial Stage 1 rating)
  const getEffectiveMilestoneRating = React.useCallback(
    (orderId: string, milestoneId: string, explicitRating?: MilestoneRating, idx?: number): MilestoneRating | null => {
      const localKey = `${orderId}::${milestoneId}`;
      if (localMilestoneRatings[localKey]) {
        return localMilestoneRatings[localKey];
      }
      if (explicitRating) {
        return explicitRating;
      }
      // Seed Stage 1 with an initial baseline rating so the Tailor Improvement Analytics card has immediate data, leaving Stage 2+ unrated to prompt the customer
      if (idx === 0) {
        return {
          qualityRating: 5,
          timelinessRating: 4,
          improvementTags: ['Immaculate Weave & Drape', 'More Daylight Macro Photos'],
          customerComment: 'Silk weave quality is exceptional; would love slightly earlier daylight swatch photos on the next stage.',
          ratedAt: currentOrder?.createdAt || new Date().toISOString()
        };
      }
      return null;
    },
    [localMilestoneRatings, currentOrder?.createdAt]
  );

  // Aggregate milestone quality & timeliness metrics + actionable tailor improvement directives
  const milestoneRatingAnalytics = useMemo(() => {
    if (!currentOrder || !currentOrder.milestones) return null;

    const ratedStages: {
      id: string;
      title: string;
      index: number;
      rating: MilestoneRating;
    }[] = [];

    const unratedPromptStages: {
      id: string;
      title: string;
      index: number;
      status: string;
    }[] = [];

    currentOrder.milestones.forEach((m, idx) => {
      const mId = m.id || m.stage || `ms-${idx}`;
      const mTitle = m.title || m.label || m.stage || `Stage ${idx + 1}`;
      const isCompleted = m.status === 'COMPLETED' || Boolean(m.completed);
      const isInProgress =
        m.status === 'IN_PROGRESS' ||
        (!isCompleted &&
          idx === currentOrder.milestones.findIndex((x) => !x.completed && x.status !== 'COMPLETED'));
      const statusLabel = isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'PENDING';

      const rating = getEffectiveMilestoneRating(currentOrder.id, mId, m.customerRating, idx);
      if (rating) {
        ratedStages.push({ id: mId, title: mTitle, index: idx, rating });
      } else if (isCompleted || isInProgress) {
        unratedPromptStages.push({ id: mId, title: mTitle, index: idx, status: statusLabel });
      }
    });

    const avgQuality =
      ratedStages.length > 0
        ? Number(
            (
              ratedStages.reduce((acc, s) => acc + s.rating.qualityRating, 0) /
              ratedStages.length
            ).toFixed(1)
          )
        : 0;

    const avgTimeliness =
      ratedStages.length > 0
        ? Number(
            (
              ratedStages.reduce((acc, s) => acc + s.rating.timelinessRating, 0) /
              ratedStages.length
            ).toFixed(1)
          )
        : 0;

    // Collect tag frequency for actionable tailor improvement insights
    const tagCounts: Record<string, number> = {};
    ratedStages.forEach((s) => {
      (s.rating.improvementTags || []).forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    // Build concrete, actionable directives for the tailor based on scores and tags
    const actionableDirectives: { category: 'QUALITY' | 'TIMELINESS' | 'PROCESS'; text: string }[] = [];

    if (avgTimeliness > 0 && avgTimeliness < 4.5) {
      actionableDirectives.push({
        category: 'TIMELINESS',
        text: `Schedule Velocity (${avgTimeliness}/5): Allocate extra karigar hours on upcoming fitting stage to recover buffer before target delivery.`
      });
    } else {
      actionableDirectives.push({
        category: 'TIMELINESS',
        text: `Schedule Velocity (${avgTimeliness || 5.0}/5): Maintain current stage cadence and share 24h advance fitting notice.`
      });
    }

    if (avgQuality > 0 && avgQuality < 4.5) {
      actionableDirectives.push({
        category: 'QUALITY',
        text: `Craft Calibration (${avgQuality}/5): Double-check seam tension, zardozi density, and 2.5" inner alteration allowance before next sign-off.`
      });
    } else {
      actionableDirectives.push({
        category: 'QUALITY',
        text: `Craft Calibration (${avgQuality || 5.0}/5): Customer validated stitch & textile finish; preserve exact thread tension on final panels.`
      });
    }

    if (topTags.length > 0) {
      actionableDirectives.push({
        category: 'PROCESS',
        text: `Customer Priority Focus: ${topTags.slice(0, 3).join(' • ')}.`
      });
    }

    return {
      ratedStages,
      unratedPromptStages,
      avgQuality,
      avgTimeliness,
      topTags,
      actionableDirectives
    };
  }, [currentOrder, getEffectiveMilestoneRating]);

  const handleOpenMilestoneRatingModal = (
    milestoneId: string,
    milestoneTitle: string,
    index: number,
    status: string,
    existingRating?: MilestoneRating | null
  ) => {
    setRatingModalMilestone({ id: milestoneId, title: milestoneTitle, index, status });
    if (existingRating) {
      setMsQualityScore(existingRating.qualityRating);
      setMsTimelinessScore(existingRating.timelinessRating);
      setMsImprovementTags(existingRating.improvementTags || []);
      setMsCustomerComment(existingRating.customerComment || '');
    } else {
      setMsQualityScore(5);
      setMsTimelinessScore(5);
      setMsImprovementTags(['Maintain 2.5" Seam Margin', 'More Daylight Macro Photos']);
      setMsCustomerComment(
        `Stage ${index + 1} (${milestoneTitle}) craftsmanship looks promising — please ensure 2.5" inner seam allowance and share close-up daylight photos.`
      );
    }
  };

  const toggleMsImprovementTag = (tag: string) => {
    setMsImprovementTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleMilestoneRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !ratingModalMilestone) return;

    const newRating: MilestoneRating = {
      qualityRating: msQualityScore,
      timelinessRating: msTimelinessScore,
      improvementTags: msImprovementTags,
      customerComment: msCustomerComment.trim(),
      ratedAt: new Date().toISOString()
    };

    const key = `${currentOrder.id}::${ratingModalMilestone.id}`;
    setLocalMilestoneRatings((prev) => ({
      ...prev,
      [key]: newRating
    }));

    if (onRateMilestone) {
      onRateMilestone(currentOrder.id, ratingModalMilestone.id, newRating);
    }

    setMilestoneRatingBanner(
      `Rated "${ratingModalMilestone.title}" (Quality: ${msQualityScore}/5 ★, Timeliness: ${msTimelinessScore}/5 ⏱) — Actionable insights sent to ${currentOrder.tailorName}!`
    );
    setRatingModalMilestone(null);
    setTimeout(() => setMilestoneRatingBanner(null), 5000);
  };

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
    setShowDeliveryCelebration(true);
    fireCelebrationConfetti();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] tracking-tight">
            My Orders & Craft Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#7D726A] mt-0.5 font-light">
            Track live atelier milestone photos, craftsmanship updates, and doorstep delivery.
          </p>
        </div>

        {onOpenFabricLibrary && (
          <button
            id="order-tracking-open-fabric-library-btn"
            onClick={onOpenFabricLibrary}
            className="self-start sm:self-auto px-3.5 py-2 rounded-full bg-[#2D2825] hover:bg-[#1A1816] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Fabric Library & Swatches</span>
          </button>
        )}
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
              onClick={() => {
                setSelectedOrderId(o.id);
                setActiveSlideIndex(0);
                setSelectedMilestoneFilter('ALL');
              }}
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

      {/* Live Upload Confirmation Banner */}
      {uploadSuccessBanner && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-900 text-white text-xs flex items-center justify-between gap-2 shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-medium">{uploadSuccessBanner}</span>
          </div>
          <button
            onClick={() => setUploadSuccessBanner(null)}
            className="text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Order Card */}
      {currentOrder && (
        <div className="space-y-5">
          
          {/* Main Order Card */}
          <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
            
            {/* Header: Order ID, Status & Print Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFEA] gap-2.5">
              <div>
                <span className="text-[11px] font-mono font-medium text-[#8E847D] block">
                  Order #{currentOrder.id}
                </span>
                <span className="text-xs text-[#7D726A]">
                  Placed on {new Date(currentOrder.orderDate || currentOrder.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="print-order-summary-header-btn"
                  onClick={() => setShowPrintModal(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#2D2825] border border-[#ECE6DE] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Generate Printable PDF Summary"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8D2434]" />
                  <span>Print Order Summary</span>
                </button>

                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                  currentOrder.status === 'DELIVERED' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-[#FBECEF] text-[#8D2434] border-[#F2D1D7]'
                }`}>
                  {currentOrder.status === 'DELIVERED' 
                    ? '✓ Delivered' 
                    : currentOrder.status === 'IN_PRODUCTION' 
                    ? 'In Production' 
                    : 'Active Tailoring'}
                </span>
              </div>
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
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F4EFEA]">
              <button
                onClick={() => onOpenChat(currentOrder.tailorId, currentOrder.tailorName)}
                className="flex-1 py-2.5 px-3 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] hover:bg-[#F4EFEA] text-xs font-semibold text-[#2D2825] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-w-[120px]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                <span>Message Tailor</span>
              </button>

              {onOpenFabricLibrary && (
                <button
                  onClick={onOpenFabricLibrary}
                  className="py-2.5 px-3.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] hover:border-[#8D2434] text-xs font-semibold text-[#2D2825] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#8D2434]" />
                  <span>Request Swatch</span>
                </button>
              )}

              {currentOrder.status === 'DELIVERED' ? (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="py-2.5 px-4 rounded-full bg-[#8D2434] text-white text-xs font-semibold hover:bg-[#781E2C] transition-colors cursor-pointer"
                >
                  Write Review
                </button>
              ) : (
                <button
                  onClick={handleConfirmDeliveryClick}
                  className="py-2.5 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Delivery & Fit</span>
                </button>
              )}
            </div>

          </div>

          {/* ===================================================================== */}
          {/* INTERACTIVE VISUAL DELIVERY & MILESTONE TIMELINE (D3.js + Recharts)   */}
          {/* ===================================================================== */}
          {timelineAnalytics && (
            <div
              id="visual-delivery-timeline-card"
              className="bg-white rounded-[22px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4"
            >
              {/* Timeline Header & Overall Completion KPIs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F4EFEA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center text-[#8D2434] shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-[#2D2825]">
                        Delivery Milestone Velocity & Craft Timeline
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#FBECEF] text-[#8D2434] border border-[#F2D1D7] text-[10px] font-mono font-bold">
                        {timelineAnalytics.overallProgressPct}% Complete
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D726A] font-light">
                      Interactive D3.js & Recharts progression towards target delivery ({timelineAnalytics.estDeliveryFormatted})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#8E847D] font-bold block">
                      Target Delivery
                    </span>
                    <span className="text-xs font-semibold text-[#2D2825] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8D2434]" />
                      { currentOrder.status === 'DELIVERED'
                        ? 'Delivered'
                        : `${timelineAnalytics.estDeliveryFormatted} (${timelineAnalytics.daysRemaining}d left)` }
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Linear Progress Bar with Milestone Tick Marks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2D2825] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>
                      {timelineAnalytics.completedCount} of {timelineAnalytics.totalStages} Milestones Completed
                    </span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[#8D2434]">
                    Stage {timelineAnalytics.inspectedStage.stageNumber}: {timelineAnalytics.inspectedStage.title}
                  </span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-[#FAF7F2] border border-[#ECE6DE] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2D2825] via-[#8D2434] to-[#D4AF37] transition-all duration-700"
                    style={{ width: `${timelineAnalytics.overallProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Part 1: D3.js Interactive SVG Milestone Trajectory Curve */}
              <div className="bg-[#FAF7F2]/80 rounded-2xl border border-[#ECE6DE] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#7D726A]">
                  <span className="font-bold uppercase tracking-wider text-[#2D2825]">
                    D3.js Milestone Horizon — Click Any Node to Inspect Stage
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2D2825]" /> Completed
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#8D2434]" /> In Progress
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#D6CEC2]" /> Pending
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto no-scrollbar">
                  <svg
                    viewBox={`0 0 ${timelineAnalytics.svgWidth} ${timelineAnalytics.svgHeight}`}
                    className="w-full min-w-[460px] h-24 select-none overflow-visible"
                  >
                    <defs>
                      <linearGradient id="d3ActiveCoutureLine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2D2825" />
                        <stop offset="65%" stopColor="#8D2434" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </linearGradient>
                    </defs>

                    {/* Planned Full Trajectory Track (Dashed Couture Stitch Line) */}
                    <path
                      d={timelineAnalytics.fullTrackPath}
                      fill="none"
                      stroke="#DCD3C8"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />

                    {/* Completed & Active Trajectory Curve */}
                    {timelineAnalytics.activeTrackPath && (
                      <path
                        d={timelineAnalytics.activeTrackPath}
                        fill="none"
                        stroke="url(#d3ActiveCoutureLine)"
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Milestone Nodes */}
                    {timelineAnalytics.d3Nodes.map((node) => {
                      const isSelected = timelineAnalytics.inspectedStage.id === node.id;
                      const isCompleted = node.status === 'COMPLETED';
                      const isInProgress = node.status === 'IN_PROGRESS';

                      return (
                        <g
                          key={node.id}
                          onClick={() => {
                            setSelectedTimelineStageIdx(node.index);
                            if (node.photoCount > 0) {
                              setSelectedMilestoneFilter(node.id);
                              setActiveSlideIndex(0);
                            }
                          }}
                          className="cursor-pointer group"
                        >
                          {/* Outer selection or active pulse halo */}
                          {(isSelected || isInProgress) && (
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={isSelected ? 16 : 13}
                              fill={isInProgress ? '#8D2434' : '#2D2825'}
                              fillOpacity={isSelected ? 0.16 : 0.1}
                            />
                          )}

                          {/* Main Node Circle */}
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={isSelected ? 11 : 9.5}
                            fill={
                              isCompleted
                                ? '#2D2825'
                                : isInProgress
                                ? '#8D2434'
                                : '#FAF7F2'
                            }
                            stroke={
                              isSelected
                                ? '#D4AF37'
                                : isCompleted
                                ? '#2D2825'
                                : isInProgress
                                ? '#8D2434'
                                : '#C9BFB3'
                            }
                            strokeWidth={isSelected ? 2.5 : 2}
                          />

                          {/* Stage Number or Check inside Node */}
                          <text
                            x={node.cx}
                            y={node.cy + 3.5}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill={isCompleted || isInProgress ? '#FFFFFF' : '#7D726A'}
                          >
                            {isCompleted ? '✓' : node.stageNumber}
                          </text>

                          {/* Top Percentage / Photo Badge */}
                          <text
                            x={node.cx}
                            y={node.cy - 14}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="600"
                            fill={isInProgress ? '#8D2434' : '#7D726A'}
                          >
                            {node.dateLabel}
                          </text>

                          {/* Bottom Stage Label */}
                          <text
                            x={node.cx}
                            y={node.cy + 23}
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight={isSelected || isInProgress ? '700' : '500'}
                            fill={isSelected || isInProgress ? '#2D2825' : '#7D726A'}
                          >
                            {node.shortStage}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Part 2: Recharts Delivery Velocity & Cumulative Progress Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-semibold text-[#2D2825]">
                    Cumulative Craft Completion (%) vs. Planned Delivery Curve
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-[#7D726A]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#8D2434] inline-block" />
                      Actual Craft Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-[#D4AF37] inline-block" />
                      Target Schedule
                    </span>
                  </div>
                </div>

                <div className="h-52 w-full bg-[#FAF7F2]/50 rounded-2xl border border-[#ECE6DE] p-2.5 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={timelineAnalytics.chartData}
                      margin={{ top: 8, right: 16, left: -18, bottom: 4 }}
                      onClick={(state) => {
                        if (state && typeof state.activeTooltipIndex === 'number') {
                          setSelectedTimelineStageIdx(state.activeTooltipIndex);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="craftVelocityFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8D2434" stopOpacity={0.34} />
                          <stop offset="95%" stopColor="#8D2434" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DE" vertical={false} />
                      <XAxis
                        dataKey="shortStage"
                        tick={{ fontSize: 10, fill: '#7D726A', fontWeight: 600 }}
                        axisLine={{ stroke: '#ECE6DE' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 10, fill: '#8E847D' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const item = payload[0].payload as (typeof timelineAnalytics.chartData)[0];
                          return (
                            <div className="bg-[#2D2825] text-[#FAF7F2] p-3 rounded-xl border border-[#D4AF37]/40 shadow-xl text-xs max-w-[230px] space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                                  Stage {item.stageNumber} • {item.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-[#FAF7F2]/75">{item.dateLabel}</span>
                              </div>
                              <p className="font-serif font-bold text-sm text-white">{item.title}</p>
                              <p className="text-[11px] text-[#FAF7F2]/80 leading-snug line-clamp-2">
                                {item.description}
                              </p>
                              <div className="pt-1.5 mt-1 border-t border-white/15 flex items-center justify-between text-[10px]">
                                <span>
                                  Progress:{' '}
                                  <strong className="text-[#D4AF37]">
                                    {item.actualProgressPct !== null
                                      ? `${item.actualProgressPct}%`
                                      : 'Pending'}
                                  </strong>{' '}
                                  / {item.targetProgressPct}% Target
                                </span>
                                <span>{item.photoCount} Photos</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine
                        y={100}
                        stroke="#D4AF37"
                        strokeDasharray="2 2"
                        strokeOpacity={0.5}
                      />
                      {/* Planned Delivery Trajectory Line */}
                      <Line
                        type="monotone"
                        dataKey="targetProgressPct"
                        name="Target Schedule"
                        stroke="#D4AF37"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3.5, fill: '#FAF7F2', stroke: '#D4AF37', strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: '#D4AF37', stroke: '#2D2825', strokeWidth: 2 }}
                      />
                      {/* Actual Craft Completion Area */}
                      <Area
                        type="monotone"
                        dataKey="actualProgressPct"
                        name="Actual Progress"
                        stroke="#8D2434"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#craftVelocityFill)"
                        connectNulls={false}
                        dot={{ r: 5, fill: '#8D2434', stroke: '#FFFFFF', strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: '#2D2825', stroke: '#D4AF37', strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Interactive Selected Stage Inspector Footer */}
              <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#ECE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#2D2825] text-white text-[10px] font-mono font-bold">
                      Stage {timelineAnalytics.inspectedStage.stageNumber}
                    </span>
                    <span className="text-xs font-bold text-[#2D2825]">
                      {timelineAnalytics.inspectedStage.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        timelineAnalytics.inspectedStage.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : timelineAnalytics.inspectedStage.status === 'IN_PROGRESS'
                          ? 'bg-[#FBECEF] text-[#8D2434]'
                          : 'bg-[#ECE6DE] text-[#7D726A]'
                      }`}
                    >
                      {timelineAnalytics.inspectedStage.status === 'COMPLETED'
                        ? '✓ Completed'
                        : timelineAnalytics.inspectedStage.status === 'IN_PROGRESS'
                        ? 'In Progress'
                        : 'Scheduled'}
                    </span>
                    <span className="text-[10px] text-[#8E847D] font-mono">
                      • {timelineAnalytics.inspectedStage.dateLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7D726A] font-light">
                    {timelineAnalytics.inspectedStage.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {timelineAnalytics.inspectedStage.photoCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMilestoneFilter(timelineAnalytics.inspectedStage.id);
                        setActiveSlideIndex(0);
                        document
                          .getElementById('craft-journey-carousel-card')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#ECE6DE] text-[#2D2825] border border-[#ECE6DE] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3 text-[#8D2434]" />
                      <span>View {timelineAnalytics.inspectedStage.photoCount} Photos</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenUploadModal(
                        timelineAnalytics.inspectedStage.id,
                        timelineAnalytics.inspectedStage.title,
                        timelineAnalytics.inspectedStage.index
                      )
                    }
                    className="px-3 py-1.5 rounded-full bg-[#8D2434] hover:bg-[#741C2A] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3 h-3" />
                    <span>+ Log Stage Progress</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* REAL-TIME CRAFT JOURNEY CAROUSEL (Customer Live Visual Tracking)     */}
          {/* ===================================================================== */}
          <div
            id="craft-journey-carousel-card"
            className="bg-white rounded-[22px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4"
          >
            {/* Carousel Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F4EFEA]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FBECEF] border border-[#F2D1D7] flex items-center justify-center text-[#8D2434]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-[#2D2825]">
                      Real-Time Craft Journey Carousel
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Live Atelier Feed
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7D726A] font-light">
                    {allJourneyPhotos.length} progress photos uploaded by {currentOrder.tailorName} across {currentOrder.milestones.length} milestones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {filteredCarouselPhotos.length > 1 && (
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                      isAutoPlaying
                        ? 'bg-[#8D2434] text-white border-[#8D2434]'
                        : 'bg-[#FAF7F2] text-[#2D2825] border-[#ECE6DE] hover:border-[#8D2434]'
                    }`}
                  >
                    {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isAutoPlaying ? 'Pause' : 'Auto-Play'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const activeMsIndex = currentOrder.milestones.findIndex(
                      (m) => m.status === 'IN_PROGRESS' || (!m.completed && m.status !== 'COMPLETED')
                    );
                    const targetIdx = activeMsIndex >= 0 ? activeMsIndex : 0;
                    const targetMs = currentOrder.milestones[targetIdx];
                    handleOpenUploadModal(
                      targetMs.id || targetMs.stage || `ms-${targetIdx}`,
                      targetMs.title || targetMs.label || `Stage ${targetIdx + 1}`,
                      targetIdx
                    );
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#2D2825] hover:bg-[#1A1816] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-[#D4AF37]" />
                  <span>+ Upload Milestone Photo</span>
                </button>
              </div>
            </div>

            {/* Milestone Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedMilestoneFilter('ALL');
                  setActiveSlideIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  selectedMilestoneFilter === 'ALL'
                    ? 'bg-[#2D2825] text-white border-[#2D2825]'
                    : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#2D2825]'
                }`}
              >
                All Stages ({allJourneyPhotos.length})
              </button>
              {currentOrder.milestones.map((m, idx) => {
                const mId = m.id || m.stage || `ms-${idx}`;
                const count = allJourneyPhotos.filter((p) => p.milestoneId === mId).length;
                if (count === 0) return null;
                const shortLabel = m.label || m.title || `Stage ${idx + 1}`;
                return (
                  <button
                    key={mId}
                    onClick={() => {
                      setSelectedMilestoneFilter(mId);
                      setActiveSlideIndex(0);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                      selectedMilestoneFilter === mId
                        ? 'bg-[#8D2434] text-white border-[#8D2434]'
                        : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#8D2434]'
                    }`}
                  >
                    Stage {idx + 1}: {shortLabel} ({count})
                  </button>
                );
              })}
            </div>

            {/* Main Carousel Viewport */}
            {currentCarouselPhoto ? (
              <div className="space-y-3">
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden border border-[#ECE6DE] bg-[#1E1B19] group">
                  <img
                    src={currentCarouselPhoto.url}
                    alt={currentCarouselPhoto.caption || currentCarouselPhoto.milestoneTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30" />

                  {/* Top Stage Badge & Counter */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/15 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>
                        Stage {currentCarouselPhoto.milestoneIndex} • {currentCarouselPhoto.milestoneTitle}
                      </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono border border-white/15">
                        {safeSlideIndex + 1} / {filteredCarouselPhotos.length}
                      </span>
                      <button
                        onClick={() => setLightboxPhoto(currentCarouselPhoto)}
                        className="w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/15 cursor-pointer"
                        title="Fullscreen Zoom"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Left / Right Carousel Arrows */}
                  {filteredCarouselPhotos.length > 1 && (
                    <>
                      <button
                        id="carousel-prev-btn"
                        onClick={handlePrevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
                        title="Previous Progress Photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        id="carousel-next-btn"
                        onClick={handleNextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
                        title="Next Progress Photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Bottom Caption & Tailor Attribution */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-snug drop-shadow-xs">
                      "{currentCarouselPhoto.caption}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-white/80 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-[#D4AF37]" />
                        Uploaded by {currentCarouselPhoto.uploadedBy || currentOrder.tailorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(currentCarouselPhoto.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carousel Thumbnail Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {filteredCarouselPhotos.map((photo, pIdx) => {
                    const isCurrent = pIdx === safeSlideIndex;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => setActiveSlideIndex(pIdx)}
                        className={`relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#8D2434] ring-2 ring-[#8D2434]/25 scale-105'
                            : 'border-[#ECE6DE] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.milestoneTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/75 text-white text-[8px] font-mono">
                          S{photo.milestoneIndex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-[#ECE6DE] space-y-2">
                <Camera className="w-6 h-6 text-[#8E847D] mx-auto" />
                <p className="text-xs font-semibold text-[#2D2825]">No Progress Photos for This Stage Yet</p>
                <p className="text-[11px] text-[#7D726A] font-light">
                  Use the "+ Upload Milestone Photo" button on any stage below to share live atelier progress.
                </p>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* CRAFTSMANSHIP & PRODUCTION MILESTONES TIMELINE WITH PHOTO & RATINGS   */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
              <h4 className="font-serif text-sm font-bold text-[#2D2825] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8D2434]" />
                <span>Tailoring Milestones, Ratings & Photo Proofs</span>
              </h4>
              <span className="text-[11px] text-[#8E847D]">
                {currentOrder.milestones.filter(m => m.status === 'COMPLETED' || m.completed).length} of {currentOrder.milestones.length} Completed
              </span>
            </div>

            {/* Confirmation Toast Banner when customer rates a milestone */}
            {milestoneRatingBanner && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{milestoneRatingBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMilestoneRatingBanner(null)}
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* PROACTIVE CUSTOMER PROMPT: Rate Completed / Active Milestones for Quality & Timeliness */}
            {milestoneRatingAnalytics && milestoneRatingAnalytics.unratedPromptStages.length > 0 && (
              <div
                data-testid="milestone-rating-prompt-card"
                className="rounded-2xl bg-gradient-to-r from-[#FBECEF] via-[#FAF7F2] to-[#F5EFEA] border border-[#8D2434]/30 p-3.5 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#8D2434] text-white flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D2825]">
                          Rate Milestone Quality & Timeliness
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#8D2434]/15 text-[#8D2434] text-[9px] font-bold uppercase">
                          {milestoneRatingAnalytics.unratedPromptStages.length} Pending Feedback
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7D726A] leading-snug">
                        Your stage-by-stage rating gives <span className="font-semibold text-[#2D2825]">{currentOrder.tailorName}</span> real-time actionable data before advancing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {milestoneRatingAnalytics.unratedPromptStages.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        handleOpenMilestoneRatingModal(st.id, st.title, st.index, st.status, null)
                      }
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#8D2434]/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Star className="w-3.5 h-3.5 text-[#8D2434] fill-[#8D2434]" />
                      <span>Rate Stage {st.index + 1}: {st.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAILOR ACTIONABLE IMPROVEMENT INSIGHTS DASHBOARD */}
            {milestoneRatingAnalytics && milestoneRatingAnalytics.ratedStages.length > 0 && (
              <div
                data-testid="tailor-actionable-insights-card"
                className="rounded-2xl bg-[#FAF7F2] border border-[#ECE6DE] p-3.5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#8D2434] block">
                      Actionable Tailor Telemetry • {milestoneRatingAnalytics.ratedStages.length} of {currentOrder.milestones.length} Milestones Rated
                    </span>
                    <h5 className="font-serif text-xs sm:text-sm font-bold text-[#2D2825]">
                      Stage Quality & Timeliness Improvement Insights
                    </h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-xl bg-white border border-[#ECE6DE] text-center">
                      <span className="text-[9px] uppercase font-bold text-[#7D726A] block">Craft Quality</span>
                      <span className="text-xs font-bold text-[#2D2825] flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 text-[#8D2434] fill-[#8D2434]" />
                        {milestoneRatingAnalytics.avgQuality} / 5
                      </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-white border border-[#ECE6DE] text-center">
                      <span className="text-[9px] uppercase font-bold text-[#7D726A] block">Timeliness</span>
                      <span className="text-xs font-bold text-[#2D2825] flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3 text-[#8D2434]" />
                        {milestoneRatingAnalytics.avgTimeliness} / 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Synthesized Actionable Directives for the Tailor */}
                <div className="space-y-1.5">
                  {milestoneRatingAnalytics.actionableDirectives.map((dir, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-2 rounded-xl bg-white border border-[#ECE6DE] text-[11px] text-[#2D2825] flex items-start gap-2"
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                          dir.category === 'QUALITY'
                            ? 'bg-[#FBECEF] text-[#8D2434]'
                            : dir.category === 'TIMELINESS'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#2D2825] text-white'
                        }`}
                      >
                        {dir.category}
                      </span>
                      <span className="text-[#5C534B] leading-snug">{dir.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#7D726A]">
                    Shared live with {currentOrder.tailorShopName || currentOrder.tailorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenChat(currentOrder.tailorId, currentOrder.tailorName)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#2D2825] text-[#8D2434] hover:text-white border border-[#ECE6DE] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Discuss Milestone Feedback</span>
                  </button>
                </div>
              </div>
            )}

            {/* Visual Progress Timeline */}
            <div className="space-y-5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECE6DE]">
              {currentOrder.milestones.map((m, idx) => {
                const isCompleted = m.status === 'COMPLETED' || m.completed;
                const isInProgress = m.status === 'IN_PROGRESS' || (!isCompleted && idx === currentOrder.milestones.findIndex(x => !x.completed && x.status !== 'COMPLETED'));
                const milestoneId = m.id || m.stage || `ms-${idx}`;
                const title = m.title || m.label || m.stage || `Stage ${idx + 1}`;
                const stagePhotos = allJourneyPhotos.filter((p) => p.milestoneId === milestoneId);
                const stageRating = getEffectiveMilestoneRating(currentOrder.id, milestoneId, m.customerRating, idx);
                const statusStr = isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'PENDING';

                return (
                  <div key={milestoneId} className="relative flex items-start gap-3.5 pl-1">
                    
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

                    {/* Milestone Details, Photo Upload & Quality/Timeliness Rating Controls */}
                    <div className="flex-1 text-xs bg-[#FAF7F2]/60 rounded-2xl p-3 border border-[#ECE6DE]/80 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCompleted ? 'text-[#2D2825]' : isInProgress ? 'text-[#8D2434]' : 'text-[#8E847D]'}`}>
                            {title}
                          </span>
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-[9px] font-bold uppercase tracking-wider">
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {m.completedAt && (
                            <span className="text-[10px] text-[#8E847D]">
                              {new Date(m.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          <button
                            id={`rate-milestone-btn-${milestoneId}`}
                            type="button"
                            onClick={() =>
                              handleOpenMilestoneRatingModal(milestoneId, title, idx, statusStr, stageRating)
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs border ${
                              stageRating
                                ? 'bg-[#FBECEF] text-[#8D2434] border-[#8D2434]/30 hover:bg-[#8D2434] hover:text-white'
                                : 'bg-white text-[#2D2825] border-[#ECE6DE] hover:border-[#8D2434] hover:text-[#8D2434]'
                            }`}
                          >
                            <Star className="w-3 h-3 text-[#8D2434] fill-[#8D2434]" />
                            <span>{stageRating ? 'Edit Rating' : 'Rate Quality & Timeliness'}</span>
                          </button>
                          <button
                            id={`upload-photo-btn-${milestoneId}`}
                            onClick={() => handleOpenUploadModal(milestoneId, title, idx)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#ECE6DE] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Camera className="w-3 h-3 text-[#8D2434] group-hover:text-white" />
                            <span>+ Upload Photo</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[#7D726A] font-light leading-relaxed">
                        {m.description}
                      </p>

                      {/* Customer Quality & Timeliness Rating Display Box */}
                      {stageRating && (
                        <div className="p-2.5 rounded-xl bg-white border border-[#ECE6DE] space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D726A]">
                              Customer Milestone Evaluation
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-semibold">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825]">
                                <Star className="w-3 h-3 text-[#8D2434] fill-[#8D2434]" />
                                Quality: {stageRating.qualityRating}/5
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825]">
                                <Clock className="w-3 h-3 text-[#8D2434]" />
                                Timeliness: {stageRating.timelinessRating}/5
                              </span>
                            </div>
                          </div>

                          {stageRating.improvementTags && stageRating.improvementTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {stageRating.improvementTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#ECE6DE] text-[9px] font-semibold text-[#5C534B]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {stageRating.customerComment && (
                            <p className="text-[11px] text-[#5C534B] italic leading-snug">
                              "{stageRating.customerComment}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Milestone Progress Photos Mini Strip */}
                      {stagePhotos.length > 0 && (
                        <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                          {stagePhotos.map((sp) => (
                            <div
                              key={sp.id}
                              onClick={() => {
                                setSelectedMilestoneFilter('ALL');
                                const globalIdx = allJourneyPhotos.findIndex((gp) => gp.id === sp.id);
                                if (globalIdx >= 0) setActiveSlideIndex(globalIdx);
                                document.getElementById('craft-journey-carousel-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }}
                              className="group/thumb relative flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white border border-[#ECE6DE] hover:border-[#8D2434] cursor-pointer transition-all shadow-2xs"
                              title="Click to view in Craft Journey Carousel"
                            >
                              <img
                                src={sp.url}
                                alt={sp.caption || 'Milestone photo proof'}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-lg object-cover border border-[#ECE6DE]"
                              />
                              <div className="max-w-[160px]">
                                <span className="text-[10px] font-semibold text-[#2D2825] block truncate">
                                  {sp.caption || 'Atelier progress proof'}
                                </span>
                                <span className="text-[9px] text-[#8D2434] font-medium flex items-center gap-0.5">
                                  <span>View in Carousel</span>
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          ))}
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

      {/* ===================================================================== */}
      {/* TAILOR MILESTONE PROGRESS PHOTO UPLOAD MODAL                          */}
      {/* ===================================================================== */}
      {uploadingMilestone && currentOrder && (
        <div
          id="milestone-photo-upload-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUploadingMilestone(null);
          }}
        >
          <div className="bg-white rounded-[26px] max-w-md w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FBECEF] text-[#8D2434] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8D2434] block">
                    Tailor Studio • Stage {uploadingMilestone.index + 1}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#2D2825]">
                    {uploadingMilestone.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setUploadingMilestone(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Live Photo Preview */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-[#ECE6DE] bg-[#FAF7F2]">
                <img
                  src={uploadPhotoUrl}
                  alt="Upload preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-xs cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Upload from Device</span>
                  </button>
                </div>
              </div>

              {/* Quick Atelier Camera Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#7D726A] block">
                  Or Choose Atelier Camera Capture Preset
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ATELIER_CRAFT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadPhotoUrl(preset.url);
                        setUploadCaption(`${uploadingMilestone.title}: ${preset.defaultCaption}`);
                      }}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                        uploadPhotoUrl === preset.url
                          ? 'border-[#8D2434] bg-[#FBECEF]/40 font-semibold text-[#2D2825]'
                          : 'border-[#ECE6DE] bg-[#FAF7F2] text-[#7D726A] hover:border-[#2D2825]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-md object-cover shrink-0"
                      />
                      <span className="text-[10px] leading-tight line-clamp-2">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Craft Progress Caption */}
              <div>
                <label className="text-xs font-semibold text-[#2D2825] block mb-1">
                  Tailor Craft Note & Photo Caption
                </label>
                <textarea
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-xs text-[#2D2825] focus:outline-none focus:border-[#8D2434] resize-none"
                  placeholder="Describe the seam allowance, embroidery detail, or fitting check..."
                  required
                />
              </div>

              {/* Milestone Status Transition */}
              <div className="flex items-center justify-between bg-[#FAF7F2] p-3 rounded-xl border border-[#ECE6DE]">
                <span className="text-[11px] font-semibold text-[#2D2825]">Milestone Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['COMPLETED', 'IN_PROGRESS', 'KEEP'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUploadStatusUpdate(st)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                        uploadStatusUpdate === st
                          ? 'bg-[#2D2825] text-white'
                          : 'bg-white text-[#7D726A] border border-[#ECE6DE]'
                      }`}
                    >
                      {st === 'COMPLETED' ? 'Mark Complete' : st === 'IN_PROGRESS' ? 'In Progress' : 'Keep Current'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="publish-milestone-photo-submit-btn"
                type="submit"
                className="w-full py-3 rounded-full bg-[#8D2434] hover:bg-[#741C2A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Publish Photo to Customer Carousel</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox for Carousel Photo */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="max-w-3xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  Stage {lightboxPhoto.milestoneIndex} • {lightboxPhoto.milestoneTitle}
                </span>
                <p className="text-sm font-medium mt-0.5">{lightboxPhoto.caption}</p>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/20 bg-black">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                referrerPolicy="no-referrer"
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
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

      {/* ===================================================================== */}
      {/* INDIVIDUAL MILESTONE QUALITY & TIMELINESS RATING MODAL                */}
      {/* ===================================================================== */}
      {ratingModalMilestone && currentOrder && (
        <div
          id="milestone-rating-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRatingModalMilestone(null);
          }}
        >
          <div className="bg-white rounded-[26px] max-w-md w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FBECEF] text-[#8D2434] flex items-center justify-center">
                  <Star className="w-4 h-4 fill-[#8D2434]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#8D2434] block">
                    Milestone Feedback • Stage {ratingModalMilestone.index + 1}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#2D2825]">
                    {ratingModalMilestone.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalMilestone(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMilestoneRatingSubmit} className="space-y-4 text-xs">
              {/* Quality & Timeliness Star Selectors */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE6DE] space-y-3.5">
                {/* 1. Craft & Material Quality */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2825]">1. Milestone Craft Quality</span>
                    <span className="text-[10px] font-semibold text-[#8D2434]">
                      {msQualityScore === 5
                        ? '5/5 • Immaculate Atelier Standard'
                        : msQualityScore === 4
                        ? '4/5 • Strong Craftsmanship'
                        : msQualityScore === 3
                        ? '3/5 • Minor Adjustments Needed'
                        : `${msQualityScore}/5 • Needs Re-Calibration`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMsQualityScore(star)}
                        className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          star <= msQualityScore
                            ? 'bg-[#8D2434] text-white border-[#8D2434] shadow-2xs'
                            : 'bg-white text-[#7D726A] border-[#ECE6DE]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${star <= msQualityScore ? 'fill-white text-white' : 'text-[#CFC3B4]'}`} />
                        <span>{star}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Schedule & Timeliness */}
                <div className="space-y-1 pt-2 border-t border-[#ECE6DE]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D2825]">2. Stage Timeliness & Velocity</span>
                    <span className="text-[10px] font-semibold text-[#8D2434]">
                      {msTimelinessScore === 5
                        ? '5/5 • On / Ahead of Schedule'
                        : msTimelinessScore === 4
                        ? '4/5 • Prompt Turnaround'
                        : msTimelinessScore === 3
                        ? '3/5 • Slight Schedule Drift'
                        : `${msTimelinessScore}/5 • Behind Target Date`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setMsTimelinessScore(star)}
                        className={`flex-1 py-2 rounded-xl border font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          star <= msTimelinessScore
                            ? 'bg-[#2D2825] text-white border-[#2D2825] shadow-2xs'
                            : 'bg-white text-[#7D726A] border-[#ECE6DE]'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${star <= msTimelinessScore ? 'text-[#D4AF37]' : 'text-[#CFC3B4]'}`} />
                        <span>{star}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Tailor Improvement Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#7D726A] block">
                  Select Actionable Improvement & Calibration Focus for Tailor
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIONABLE_IMPROVEMENT_TAGS.map((tag) => {
                    const active = msImprovementTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMsImprovementTag(tag)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                          active
                            ? 'bg-[#FBECEF] text-[#8D2434] border-[#8D2434]'
                            : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#2D2825]'
                        }`}
                      >
                        <span>{tag}</span>
                        {active && <Check className="w-3 h-3 text-[#8D2434]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Notes for Next Stage */}
              <div>
                <label className="text-xs font-semibold text-[#2D2825] block mb-1">
                  Actionable Guidance for {currentOrder.tailorName}
                </label>
                <textarea
                  value={msCustomerComment}
                  onChange={(e) => setMsCustomerComment(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-xs text-[#2D2825] focus:outline-none focus:border-[#8D2434] resize-none"
                  placeholder="Share specific feedback on stitch tension, fitting allowance, or photo updates..."
                />
              </div>

              <button
                id="submit-milestone-rating-btn"
                type="submit"
                className="w-full py-3 rounded-full bg-[#8D2434] hover:bg-[#741C2A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Submit Milestone Quality & Timeliness Rating</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Order Summary PDF Modal */}
      {currentOrder && (
        <PrintableOrderSummary
          order={currentOrder}
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Delivery Success Celebration Overlay with Confetti */}
      {currentOrder && (
        <SuccessCelebrationOverlay
          isOpen={showDeliveryCelebration}
          type="DELIVERED"
          orderId={currentOrder.id}
          garmentTitle={activeVariation?.name || 'Bespoke Haute Couture Dress'}
          tailorName={currentOrder.tailorName}
          amount={Number(currentOrder.totalAmount || 38000)}
          onClose={() => setShowDeliveryCelebration(false)}
          onPrimaryAction={() => {
            setShowDeliveryCelebration(false);
            setShowReviewModal(true);
          }}
          primaryActionLabel="Write Tailor Review"
          onSecondaryAction={() => {
            setShowDeliveryCelebration(false);
            setShowPrintModal(true);
          }}
          secondaryActionLabel="Print Order Summary (PDF)"
        />
      )}

    </div>
  );
};
