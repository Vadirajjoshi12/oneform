import React, { useState, useEffect } from 'react';
import { OrderPool } from '../types';
import { PLATFORMS } from '../data/mockData';
import { Clock, MapPin, CheckCircle2, Plus, ArrowRight } from 'lucide-react';

interface OrderPoolCardProps {
  pool: OrderPool;
  onSelectPool: (pool: OrderPool) => void;
}

export const OrderPoolCard: React.FC<OrderPoolCardProps> = ({ pool, onSelectPool }) => {
  const platform = PLATFORMS.find((p) => p.id === pool.platform) || PLATFORMS[0];
  
  // Calculate threshold progress
  const percentage = Math.min(Math.round((pool.currentAmount / pool.targetThreshold) * 100), 100);
  const remainingAmount = Math.max(pool.targetThreshold - pool.currentAmount, 0);

  // Timer calculation
  const [timeLeft, setTimeLeft] = useState<string>('00:00');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(pool.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
        const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
        setTimeLeft(`${minsStr}:${secsStr}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pool.expiresAt]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-black/[0.08] hover:border-black/20 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      
      {/* Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Top Header: Platform + Optional Non-Default Status & Countdown Timer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#1d1d1f] tracking-wider uppercase">
              {pool.platform}
            </span>
            {/* Show status tag ONLY if not the default "Cart Open" */}
            {pool.deliveryStatus && pool.deliveryStatus !== 'Cart Open' && (
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                pool.deliveryStatus === 'Arrived at Gate' || pool.deliveryStatus === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                  : pool.deliveryStatus === 'Out for Delivery' || pool.deliveryStatus === 'Order Placed'
                  ? 'bg-blue-500/10 text-blue-800 border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-800 border-amber-500/20'
              }`}>
                {pool.deliveryStatus === 'Cart Locked' ? '🔒 Locked' :
                 pool.deliveryStatus === 'Order Placed' ? '🛒 Placed' :
                 pool.deliveryStatus === 'Out for Delivery' ? '🛵 On the way' :
                 pool.deliveryStatus === 'Arrived at Gate' ? '📍 At Gate' :
                 pool.deliveryStatus === 'Completed' ? '✅ Completed' : pool.deliveryStatus}
              </span>
            )}
          </div>

          {/* Monospaced Countdown Timer */}
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm ${
            isExpired
              ? 'bg-rose-500/10 text-rose-800 border-rose-200/80'
              : 'bg-black/[0.04] text-slate-800 border-black/[0.06]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="tabular-nums font-mono">{isExpired ? 'Expired' : timeLeft}</span>
          </div>
        </div>

        {/* Pickup Location & Host Information */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-semibold text-[#1d1d1f]">{pool.pickupLocation}</span>
          </div>

          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <img
              src={pool.hostAvatar}
              alt={pool.hostName}
              className="w-5 h-5 rounded-full bg-slate-100 border border-black/[0.08] object-cover"
            />
            <span className="text-xs font-semibold text-slate-700 tracking-tight">
              {pool.hostName} <span className="text-[10px] text-slate-400 font-normal">(Host)</span>
            </span>
            {/* Inline Host Note Micro-copy if present */}
            {pool.note && (
              <span className="text-xs text-slate-500 font-normal italic truncate max-w-[180px]">
                • "{pool.note}"
              </span>
            )}
          </div>
        </div>

        {/* Cart Threshold Progress Bar & Actionable Goal */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-[#1d1d1f]">
              {remainingAmount > 0 ? (
                <span>₹{remainingAmount} away from Free Delivery</span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                  Free Delivery Unlocked!
                </span>
              )}
            </span>
            <span className="text-slate-400 text-[11px] font-semibold tabular-nums">
              {percentage}%
            </span>
          </div>

          {/* Apple System Tinted Progress Bar */}
          <div className="w-full h-2 bg-black/[0.05] rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Participants & Savings Badge */}
        <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {pool.items.map((item, idx) => (
                <img
                  key={item.id || idx}
                  src={item.addedByAvatar}
                  alt={item.addedBy}
                  title={`${item.addedBy}: ${item.itemName} (₹${item.price})`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 border border-slate-200 object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 font-medium">
              {pool.items.length} {pool.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <span className="text-[10px] text-emerald-900 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Saves ₹{platform.defaultDeliveryFee} fee
          </span>
        </div>

      </div>

      {/* Integrated Primary Action Capsule Button */}
      <div className="p-3.5 bg-black/[0.02] border-t border-black/[0.06]">
        <button
          onClick={() => onSelectPool(pool)}
          className="w-full bg-[#1d1d1f] hover:bg-black text-white font-extrabold py-3.5 px-6 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3] text-emerald-400" />
          <span>
            {remainingAmount === 0 ? 'Join Pool • Free Delivery Unlocked' : '+ Join Pool & Add Items'}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};


