import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Community, OrderPool, PoolItem, QuickCommercePlatform, FeedbackComment, DeliveryStatus, ChatMessage } from './types';
import { INITIAL_COMMUNITIES, INITIAL_POOLS, INITIAL_COMMENTS, PLATFORMS } from './data/mockData';
import { Header } from './components/Header';
import { OrderPoolCard } from './components/OrderPoolCard';
import { SavingsCalculator } from './components/SavingsCalculator';
import { CreatePoolModal } from './components/CreatePoolModal';
import { PoolDetailModal } from './components/PoolDetailModal';
import { CommunityFeedback } from './components/CommunityFeedback';
import { VisionSection } from './components/VisionSection';
import { CommunitySelectorModal } from './components/CommunitySelectorModal';
import { SupportSection } from './components/SupportSection';
import { AboutSection } from './components/AboutSection';
import { NotificationToast } from './components/NotificationToast';
import { useUserLocation } from './hooks/useUserLocation';
import { formatDistance, calculateDistanceInKm } from './utils/location';
import * as api from './services/api';
import {
  Search,
  Plus,
  Filter,
  ShoppingBag,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  ArrowRight,
  Calculator,
  MessageSquare,
  Navigation,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const ROTATING_WORDS = ['pooling.', 'savings.', 'that.'];

export default function App() {
  // Ref to Section 1 for scroll-triggered animation
  const section1Ref = useRef<HTMLDivElement>(null);
  const isSection1InView = useInView(section1Ref, { once: true, margin: '-80px' });

  // Rotating Brand Text Index
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    if (!isSection1InView) return;

    const timer = setInterval(() => {
      setRotatingIndex((prev) => {
        if (prev >= ROTATING_WORDS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isSection1InView]);

  // Location Hook for Geofencing & Security
  const {
    locationState,
    requestLocation,
    getDistanceToCommunity,
    isCommunityInGeofence,
  } = useUserLocation();

  // State
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [activeCommunity, setActiveCommunity] = useState<Community>(INITIAL_COMMUNITIES[0]);
  const [pools, setPools] = useState<OrderPool[]>(INITIAL_POOLS);
  const [comments, setComments] = useState<FeedbackComment[]>(INITIAL_COMMENTS);

  // Backend state
  const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal & Filter state
  const [selectedPoolForDetail, setSelectedPoolForDetail] = useState<OrderPool | null>(null);
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState<boolean>(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);

  const [selectedPlatform, setSelectedPlatform] = useState<QuickCommercePlatform | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch nearby pools from backend API
  const loadNearbyPools = useCallback(async () => {
    setIsLoadingNearby(true);
    setApiError(null);
    const lat = locationState.coords?.lat || activeCommunity.lat;
    const lng = locationState.coords?.lng || activeCommunity.lng;
    const radius = activeCommunity.radiusKm || 2;

    try {
      const res = await api.getNearbyPools(lat, lng, radius);
      if (res.data) {
        const mapped = res.data.map((bPool) =>
          api.mapBackendPoolToOrderPool(bPool, activeCommunity.name)
        );
        setPools(mapped);
      }
    } catch (err: any) {
      console.warn('Backend API note:', err.message);
      setApiError(err.message);
    } finally {
      setIsLoadingNearby(false);
    }
  }, [locationState.coords, activeCommunity.lat, activeCommunity.lng, activeCommunity.radiusKm, activeCommunity.name]);

  useEffect(() => {
    loadNearbyPools();
  }, [loadNearbyPools]);

  // Navigation
  const [activeTab, setActiveTab] = useState<'pools' | 'calculator' | 'feedback' | 'vision'>('pools');

  // Calculated global savings
  const totalSavedGlobal = pools.reduce((sum, p) => {
    const platform = PLATFORMS.find((pl) => pl.id === p.platform) || PLATFORMS[0];
    return sum + (p.items.length > 1 ? platform.defaultDeliveryFee * p.items.length : 0);
  }, 12850);

  const activeDistance = getDistanceToCommunity(activeCommunity);
  const activeInGeofence = isCommunityInGeofence(activeCommunity);

  // Auto-anchor community hub to user's granted GPS coordinates
  useEffect(() => {
    if (locationState.status === 'granted' && locationState.coords) {
      const { lat, lng } = locationState.coords;

      setActiveCommunity((prev) => ({
        ...prev,
        lat,
        lng,
        location: 'Current Physical Location',
      }));

      setCommunities((prevList) =>
        prevList.map((c) =>
          c.id === 'comm-my-location'
            ? {
                ...c,
                lat,
                lng,
                location: 'Current Physical Location',
              }
            : c
        )
      );
    }
  }, [locationState.status, locationState.coords]);

  // Handlers
  const handleCreatePool = (newPool: OrderPool) => {
    setPools((prev) => [newPool, ...prev]);
    setToastMessage(`🎉 1Form Pool started for ${newPool.platform} at ${newPool.pickupLocation}!`);
  };

const handleRefreshPoolDetails = async (poolId: string) => {
  try {
    const res = await api.getPoolDetails(poolId);

    if (!res.data) {
      return;
    }

    // Find the existing pool
    const existingPool = pools.find(
      (pool) => pool.id === poolId
    );

    // Convert backend data to frontend pool format
    const updatedPool = api.mapBackendPoolToOrderPool(
      res.data,
      activeCommunity.name,
      existingPool
    );

    // Update pools list
    setPools((prevPools) =>
      prevPools.map((pool) =>
        pool.id === poolId ? updatedPool : pool
      )
    );

    // IMPORTANT:
    // Update the pool currently displayed in the modal
    if (selectedPoolForDetail?.id === poolId) {
      setSelectedPoolForDetail(updatedPool);
    }

  } catch (err: any) {
    console.warn(
      'Failed to refresh pool details:',
      err.message
    );
  }
};

  const handleJoinPoolBackend = async (poolId: string, name: string, phone: string, itemName: string, price: number) => {
    const res = await api.joinPool(poolId, {
      name,
      phone,
      items: [{ itemName, price, quantity: 1 }],
    });

    if (res.data) {
      const existing = pools.find((p) => p.id === poolId);
      const updated = api.mapBackendPoolToOrderPool(res.data, activeCommunity.name, existing);
      setPools((prev) => prev.map((p) => (p.id === poolId ? updated : p)));
      if (selectedPoolForDetail?.id === poolId) {
        setSelectedPoolForDetail(updated);
      }
      setToastMessage(`✨ Joined pool! Cart total updated to ₹${updated.currentAmount}`);
    }
  };

  const handleLeavePoolBackend = async (poolId: string, phone: string) => {
    const res = await api.leavePool(poolId, phone);
    if (res.data) {
      const existing = pools.find((p) => p.id === poolId);
      const updated = api.mapBackendPoolToOrderPool(res.data, activeCommunity.name, existing);
      setPools((prev) => prev.map((p) => (p.id === poolId ? updated : p)));
      if (selectedPoolForDetail?.id === poolId) {
        setSelectedPoolForDetail(updated);
      }
      setToastMessage('Left pool successfully');
    }
  };

  const handleCancelPoolBackend = async (poolId: string, phone: string) => {
    const res = await api.cancelPool(poolId, phone);
    if (res.data) {
      const existing = pools.find((p) => p.id === poolId);
      const updated = api.mapBackendPoolToOrderPool(res.data, activeCommunity.name, existing);
      setPools((prev) => prev.map((p) => (p.id === poolId ? updated : p)));
      if (selectedPoolForDetail?.id === poolId) {
        setSelectedPoolForDetail(updated);
      }
      setToastMessage('Order pool cancelled');
    }
  };

  const handlePlaceOrderBackend = async (poolId: string, phone: string) => {
    const res = await api.placeOrder(poolId, phone);
    if (res.data) {
      const existing = pools.find((p) => p.id === poolId);
      const updated = api.mapBackendPoolToOrderPool(res.data, activeCommunity.name, existing);
      setPools((prev) => prev.map((p) => (p.id === poolId ? updated : p)));
      if (selectedPoolForDetail?.id === poolId) {
        setSelectedPoolForDetail(updated);
      }
      setToastMessage('🎉 Order placed successfully on quick-commerce app!');
    }
  };

  const handleAddItemToPool = (poolId: string, newItem: Omit<PoolItem, 'id'>) => {
    const fullItem: PoolItem = {
      ...newItem,
      id: `item-${Date.now()}`,
    };

    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          const updatedItems = [...pool.items, fullItem];
          const newCurrentAmount = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const isMet = newCurrentAmount >= pool.targetThreshold;

          const updatedPool: OrderPool = {
            ...pool,
            items: updatedItems,
            currentAmount: newCurrentAmount,
            status: isMet ? 'threshold_met' : pool.status,
          };

          if (selectedPoolForDetail?.id === poolId) {
            setSelectedPoolForDetail(updatedPool);
          }

          return updatedPool;
        }
        return pool;
      })
    );

    setToastMessage(`✨ Added "${newItem.itemName}" to the pool! You saved ~₹49 delivery fee.`);
  };

  const handleRemoveItemFromPool = (poolId: string, itemId: string) => {
    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          const updatedItems = pool.items.filter((i) => i.id !== itemId);
          const newCurrentAmount = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

          const updatedPool: OrderPool = {
            ...pool,
            items: updatedItems,
            currentAmount: newCurrentAmount,
            status: newCurrentAmount >= pool.targetThreshold ? 'threshold_met' : 'active',
          };

          if (selectedPoolForDetail?.id === poolId) {
            setSelectedPoolForDetail(updatedPool);
          }

          return updatedPool;
        }
        return pool;
      })
    );
  };

const handleUpdateDeliveryStatus = async (
  poolId: string,
  deliveryStatus: DeliveryStatus
) => {
  const pool = pools.find((p) => p.id === poolId);

  if (!pool) {
    setToastMessage('Pool not found');
    return;
  }

  try {
    console.log('🚨 DELIVERY STATUS REQUEST:', {
      poolId,
      hostPhone: pool.hostPhone,
      deliveryStatus,
    });

    // Update backend first
    const res = await api.updateDeliveryStatus(
      poolId,
      pool.hostPhone,
      deliveryStatus
    );

    console.log('✅ DELIVERY STATUS RESPONSE:', res);

    if (res.data) {
      const existing = pools.find((p) => p.id === poolId);

      // Convert backend response into frontend pool format
      const updatedPool = api.mapBackendPoolToOrderPool(
        res.data,
        activeCommunity.name,
        existing
      );

      console.log('🔄 UPDATED POOL FOR UI:', updatedPool);

      // Update pools list
      setPools((prevPools) =>
        prevPools.map((p) =>
          p.id === poolId ? updatedPool : p
        )
      );

      // Update currently open modal
      setSelectedPoolForDetail((prev) => {
        if (prev?.id === poolId) {
          return updatedPool;
        }

        return prev;
      });

      setToastMessage(
        `🛵 Order delivery status updated to: ${deliveryStatus}`
      );
    }
  } catch (error: any) {
    console.error(
      '❌ Delivery status update failed:',
      error
    );

    setToastMessage(
      error.message || 'Failed to update delivery status'
    );
  }
};
  const handleToggleItemPaid = (poolId: string, itemId: string) => {
    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          const updatedItems = pool.items.map((item) =>
            item.id === itemId ? { ...item, hasPaid: !item.hasPaid } : item
          );
          const updatedPool: OrderPool = {
            ...pool,
            items: updatedItems,
          };
          if (selectedPoolForDetail?.id === poolId) {
            setSelectedPoolForDetail(updatedPool);
          }
          return updatedPool;
        }
        return pool;
      })
    );
  };

  const handleAddChatMessage = (poolId: string, chatMsg: ChatMessage) => {
    setPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId) {
          const updatedPool: OrderPool = {
            ...pool,
            messages: [...(pool.messages || []), chatMsg],
          };
          if (selectedPoolForDetail?.id === poolId) {
            setSelectedPoolForDetail(updatedPool);
          }
          return updatedPool;
        }
        return pool;
      })
    );
  };

  const handleAddComment = (commentData: Omit<FeedbackComment, 'id' | 'upvotes' | 'createdAt'>) => {
    const newComment: FeedbackComment = {
      ...commentData,
      id: `c-${Date.now()}`,
      upvotes: 1,
      hasUpvoted: true,
      createdAt: 'Just now',
    };
    setComments((prev) => [newComment, ...prev]);
    setToastMessage('💬 Thank you for building in public with us!');
  };

  const handleUpvoteComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasUpvoted = !c.hasUpvoted;
          return {
            ...c,
            hasUpvoted,
            upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
          };
        }
        return c;
      })
    );
  };

  const handleAddCommunity = (newCommunity: Community) => {
    setCommunities((prev) => [newCommunity, ...prev]);
  };

  // Filter pools by active community & search & platform
  const communityPools = pools.filter(
    (p) => p.communityId === activeCommunity.id || p.communityName === activeCommunity.name
  );

  const filteredPools = communityPools.filter((p) => {
    const matchesPlatform = selectedPlatform === 'All' || p.platform === selectedPlatform;
    const matchesSearch =
      p.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.items.some((i) => i.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.hostName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      
      {/* Clean Top Header */}
      <Header
        activeCommunity={activeCommunity}
        onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
        onOpenCreatePoolModal={() => setIsCreatePoolModalOpen(true)}
        onOpenAboutModal={() => {
          const el = document.getElementById('about');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        locationState={locationState}
        onRequestLocation={requestLocation}
      />

      {/* FULL-BLEED APPLE-STYLE DISPLAY HERO SECTION (EDGE-TO-EDGE BLACK BAND) */}
      <motion.section
        initial={{ opacity: 0.1, filter: 'blur(10px)', y: 30 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-black text-white pt-16 pb-16 sm:pt-24 sm:pb-20 px-4 sm:px-8 text-center relative overflow-hidden space-y-6 transition-all duration-700"
      >
        {/* Centered Blue Icon Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-black text-2xl sm:text-3xl mx-auto shadow-lg tracking-tight">
          1F
        </div>

        <div className="max-w-5xl mx-auto space-y-5">
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Meet the smartest way to order.
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[#f5f5f7] font-medium max-w-4xl mx-auto leading-relaxed opacity-90 tracking-tight">
            No ₹199 minimum cart penalties. No solo surge delivery fees. No buying extra snacks just to hit free delivery. Pure shared savings with the people down the hall. Every order hits zero fees, every single time — only on 1Form.
          </p>
        </div>
      </motion.section>

      {/* FULL-BLEED HERO PRIMARY BANNER (EDGE-TO-EDGE FULL WIDTH) */}
      <motion.section
        ref={section1Ref}
        initial={{ opacity: 0.05, filter: 'blur(16px)', y: 60, scale: 0.97 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-8 transition-all duration-700 bg-gradient-to-b from-slate-50/80 via-rose-50/30 to-slate-50/80"
      >
        {/* Soft ambient gradient glow across full viewport width */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial from-rose-500/[0.07] via-purple-500/[0.03] to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-rose-400/[0.08] rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-amber-400/[0.06] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 px-4 text-center">
          {/* Main Brand Headline with Rotating Word */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1d1d1f] tracking-tight leading-[1.1] text-center">
              1Form does{' '}
              <span className="relative inline-block text-left">
                {/* Invisible static placeholder 'that.' locks heading width so '1Form does' never shifts */}
                <span className="opacity-0 pointer-events-none select-none font-serif italic font-normal pr-1" aria-hidden="true">
                  that.
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING_WORDS[rotatingIndex]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-0 top-0 whitespace-nowrap font-serif italic font-normal text-[#ff2d55] pr-1"
                  >
                    {ROTATING_WORDS[rotatingIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Subtext - Centered & Clean */}
            <div className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed space-y-1 text-center">
              <p>Ordering late night snacks or daily essentials? No problem.</p>
              <p>1Form automatically pairs your cart with nearby orders.</p>
            </div>
          </div>

          {/* Subtle Divider */}
          <div className="w-16 h-[1px] bg-slate-300 mx-auto opacity-60" />

          {/* Slogan & Action Block */}
          <div className="max-w-3xl mx-auto space-y-5 text-center">
            {/* Eyebrow tag in vibrant coral/pink text */}
            <div className="text-xs sm:text-sm font-extrabold tracking-widest text-[#ff2d55] uppercase text-center">
              ZERO MINIMUM CART FEES
            </div>

            {/* Slogan with serif italic accent word styling */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1d1d1f] tracking-tight leading-snug text-center">
              Group buying made <span className="font-serif italic font-normal text-[#ff2d55] pr-1">local.</span> Savings made simple.
            </h2>

            {/* Subtitle with line accent */}
            <div className="flex items-center justify-center gap-3 pt-1 text-slate-600 text-xs sm:text-sm font-semibold">
              <span className="w-8 sm:w-12 h-[1px] bg-slate-300"></span>
              <span>Built for hostellers, apartments & office hubs</span>
              <span className="w-8 sm:w-12 h-[1px] bg-slate-300"></span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3 max-w-md mx-auto">
              <button
                onClick={() => setIsCreatePoolModalOpen(true)}
                className="w-full bg-[#1d1d1f] hover:bg-black text-white font-extrabold py-4 px-8 sm:px-12 rounded-full text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-6 h-6 stroke-[3] text-emerald-400" />
                <span>Create an Order Pool</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 space-y-16">

        {/* SECTION 2: ACTIVE POOLS AT YOUR LOCATION */}
        <motion.section
          id="active-pools"
          initial={{ opacity: 0.05, filter: 'blur(16px)', y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 transition-all duration-700"
        >
          
          {filteredPools.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#1d1d1f] tracking-tight flex items-center gap-2.5">
                      <span>Active Pools Running at Your Location</span>
                      <span className="text-xs font-extrabold text-slate-800 bg-black/[0.05] px-2.5 py-0.5 rounded-full">
                        {filteredPools.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Select an open order below to add your items and share delivery costs.
                    </p>
                  </div>

                  <button
                    onClick={loadNearbyPools}
                    disabled={isLoadingNearby}
                    className="p-2 rounded-full bg-black/[0.04] hover:bg-black/10 text-slate-700 transition-colors"
                    title="Refresh nearby pools"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingNearby ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Apple Pill Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-3" />
                  <input
                    type="text"
                    placeholder="Search items or stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/80 border border-black/[0.08] focus:border-black/30 rounded-full pl-9 pr-4 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none font-medium shadow-2xs backdrop-blur-md transition-all"
                  />
                </div>
              </div>

              {/* Connected Apple Segmented Control Bar */}
              <div className="w-full bg-black/[0.04] p-1.5 rounded-2xl sm:rounded-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 backdrop-blur-md border border-black/[0.03] shadow-2xs">
                <button
                  onClick={() => setSelectedPlatform('All')}
                  className={`py-2.5 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedPlatform === 'All'
                      ? 'bg-white text-[#1d1d1f] shadow-xs'
                      : 'text-slate-600 hover:text-[#1d1d1f]'
                  }`}
                >
                  <span>All Stores</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    selectedPlatform === 'All' ? 'bg-black/10 text-[#1d1d1f]' : 'bg-black/5 text-slate-700'
                  }`}>
                    {communityPools.length}
                  </span>
                </button>

                {PLATFORMS.map((p) => {
                  const count = communityPools.filter((cp) => cp.platform === p.id).length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`py-2.5 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedPlatform === p.id
                          ? 'bg-white text-[#1d1d1f] shadow-xs'
                          : 'text-slate-600 hover:text-[#1d1d1f]'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                          selectedPlatform === p.id ? 'bg-black/10 text-[#1d1d1f]' : 'bg-black/5 text-slate-700'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPools.map((pool) => (
                    <motion.div
                      key={pool.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{
                        type: 'spring',
                        damping: 22,
                        stiffness: 280,
                      }}
                    >
                      <OrderPoolCard
                        pool={pool}
                        onSelectPool={(p) => setSelectedPoolForDetail(p)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Single Clean Zero-State Card without Clutter */
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.08] rounded-[32px] p-10 text-center space-y-4 shadow-2xs max-w-2xl mx-auto my-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold border border-amber-100">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-[#1d1d1f]">⚡️ No active pools at your place</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto">
                  Be the first at your place to start an order pool for Zepto, Blinkit, or Swiggy Instamart!
                </p>
              </div>
              <button
                onClick={() => setIsCreatePoolModalOpen(true)}
                className="bg-[#1d1d1f] hover:bg-black text-white font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[3] text-emerald-400" />
                <span>+ Start a Pool</span>
              </button>
            </div>
          )}

        </motion.section>

        {/* SECTION 3: HOW 1FORM WORKS IN 3 SIMPLE STEPS */}
        <motion.section
          id="how-it-works"
          initial={{ opacity: 0.05, filter: 'blur(16px)', y: 60, scale: 0.97 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 border border-black/[0.08] shadow-2xs text-[#1d1d1f] space-y-8 transition-all duration-700"
        >
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold text-[#1d1d1f] uppercase tracking-widest bg-black/[0.04] px-3 py-1 rounded-full border border-black/[0.05]">
              Simple & Automated
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              How 1Form Works in 3 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#f5f5f7] p-6 rounded-2xl border border-black/[0.04] space-y-3 flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white text-sm font-extrabold flex items-center justify-center shadow-xs">
                1
              </div>
              <h4 className="text-base font-extrabold text-[#1d1d1f]">Pick Store</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Select Zepto or Blinkit nearby.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#f5f5f7] p-6 rounded-2xl border border-black/[0.04] space-y-3 flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white text-sm font-extrabold flex items-center justify-center shadow-xs">
                2
              </div>
              <h4 className="text-base font-extrabold text-[#1d1d1f]">Add Items</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Watch the cart hit free delivery live.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#f5f5f7] p-6 rounded-2xl border border-black/[0.04] space-y-3 flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white text-sm font-extrabold flex items-center justify-center shadow-xs">
                3
              </div>
              <h4 className="text-base font-extrabold text-[#1d1d1f]">Split & Save</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Host orders, you pay via instant UPI.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* SECTION 4: 1FORM SUPPORT (In-Page Apple Support Inspired Layout) */}
        <SupportSection />

        {/* SECTION 5: ABOUT US (In-Page Section at the Very Bottom) */}
        <AboutSection />

      </main>

      {/* Modals */}
      <CreatePoolModal
        isOpen={isCreatePoolModalOpen}
        onClose={() => setIsCreatePoolModalOpen(false)}
        activeCommunity={activeCommunity}
        onCreatePool={handleCreatePool}
        locationState={locationState}
        onRequestLocation={requestLocation}
      />

      <PoolDetailModal
        pool={selectedPoolForDetail}
        onClose={() => setSelectedPoolForDetail(null)}
        onAddItemToPool={handleAddItemToPool}
        onRemoveItemFromPool={handleRemoveItemFromPool}
        onJoinPool={handleJoinPoolBackend}
        onLeavePool={handleLeavePoolBackend}
        onCancelPool={handleCancelPoolBackend}
        onPlaceOrder={handlePlaceOrderBackend}
        onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
        onToggleItemPaid={handleToggleItemPaid}
        onAddChatMessage={handleAddChatMessage}
        onRefreshPoolDetails={handleRefreshPoolDetails}
      />

      <CommunitySelectorModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        communities={communities}
        activeCommunity={activeCommunity}
        onSelectCommunity={(comm) => setActiveCommunity(comm)}
        onAddCommunity={handleAddCommunity}
        locationState={locationState}
        onRequestLocation={requestLocation}
      />

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
