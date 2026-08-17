import React, { useState } from 'react';
import { QuickCommercePlatform, OrderPool, Community, UserLocationState } from '../types';
import { PLATFORMS } from '../data/mockData';
import { createPool, mapBackendPoolToOrderPool } from '../services/api';
import { X, ShoppingBag, MapPin, Clock, Phone, User, ShieldCheck, AlertTriangle, Navigation, Loader2 } from 'lucide-react';
import { calculateDistanceInKm, formatDistance } from '../utils/location';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommunity: Community;
  onCreatePool: (newPool: OrderPool) => void;
  locationState: UserLocationState;
  onRequestLocation: () => void;
}

export const CreatePoolModal: React.FC<CreatePoolModalProps> = ({
  isOpen,
  onClose,
  activeCommunity,
  onCreatePool,
  locationState,
  onRequestLocation,
}) => {
  const [platform, setPlatform] = useState<QuickCommercePlatform>('Blinkit');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostPhone, setHostPhone] = useState<string>('');
  const [hostPin, setHostPin] = useState<string>('1234');
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Host initial item
  const [itemName, setItemName] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');

  if (!isOpen) return null;

  const currentDistance = locationState.coords
    ? calculateDistanceInKm(
        locationState.coords.lat,
        locationState.coords.lng,
        activeCommunity.lat,
        activeCommunity.lng
      )
    : null;

  const maxRadiusKm = activeCommunity.radiusKm || 2.0;
  const isWithinGeofence = currentDistance !== null && currentDistance <= maxRadiusKm;

  const selectedPlatformConfig = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];
  const targetThreshold = selectedPlatformConfig.freeDeliveryThreshold;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (locationState.status !== 'granted') {
      alert('Location access is required to verify physical presence at this community hub before launching an order pool.');
      onRequestLocation();
      return;
    }

    if (!isWithinGeofence) {
      alert(
        `Location Security Error: You are ${formatDistance(
          currentDistance!
        )} away from ${activeCommunity.name}. You must be physically present within ${maxRadiusKm} km of the hub to start an order pool.`
      );
      return;
    }

    if (!pickupLocation.trim() || !hostName.trim() || !hostPhone.trim() || !itemName.trim() || !itemPrice || Number(itemPrice) <= 0) {
      alert('Please fill in all required fields (Drop Location, Host Name, Phone, Item Name and Price).');
      return;
    }

    const initialPrice = Number(itemPrice);
    const backendPlatform = platform === 'Swiggy Instamart' ? 'Instamart' : platform;
    const lat = locationState.coords?.lat || activeCommunity.lat;
    const lng = locationState.coords?.lng || activeCommunity.lng;

    setIsSubmitting(true);

    try {
      const response = await createPool({
        communityId: activeCommunity.id,
        platform: backendPlatform,
        pickupLocation: pickupLocation.trim(),
        radiusKm: maxRadiusKm,
        durationMinutes: timerMinutes,
        targetThreshold,
        note: note.trim() || `Ordering on ${platform}! Join pool to split or avoid delivery fees.`,
        host: {
          name: hostName.trim(),
          phone: hostPhone.trim(),
        },
        item: {
          name: itemName.trim(),
          price: initialPrice,
          quantity: 1,
        },
        location: {
          lat,
          lng,
        },
      });

      const newPool = mapBackendPoolToOrderPool(response.data, activeCommunity.name);
      newPool.hostPhone = hostPhone.trim();
      newPool.hostPin = hostPin.trim() || '1234';
      if (response.hostToken) {
        newPool.hostToken = response.hostToken;
      }

      onCreatePool(newPool);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create pool on backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-black/[0.08] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-8 text-[#1d1d1f] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2">
              Start an Order Pool
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500">
              Community: <span className="font-semibold text-slate-800">{activeCommunity.name}</span>
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Security Status Bar */}
        <div className="bg-[#f5f5f7] px-5 py-2.5 border-b border-black/[0.04] text-xs shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {locationState.status === 'granted' ? (
              isWithinGeofence ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <span>Verified Present ({formatDistance(currentDistance!)})</span>
                </span>
              ) : (
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Out of Range ({formatDistance(currentDistance!)})</span>
                </span>
              )
            ) : (
              <span className="text-slate-600 font-medium">Location permission required</span>
            )}
          </div>

          {locationState.status !== 'granted' && (
            <button
              type="button"
              onClick={onRequestLocation}
              className="bg-[#1d1d1f] hover:bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              <span>Allow Location</span>
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-grow">
          
          {locationState.status === 'granted' && !isWithinGeofence && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Physical Proximity Warning</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You are currently {formatDistance(currentDistance!)} away from {activeCommunity.name}. To prevent misuse and duplicate fake orders, order pools must be created while present within {maxRadiusKm} km of the hub.
              </p>
            </div>
          )}
          
          {/* Step 1: Select Platform */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              1. Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    platform === p.id
                      ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                      : 'bg-white border-black/[0.08] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-xs block">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Free @ ₹{p.freeDeliveryThreshold}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Pickup/Drop-off Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              2. Drop-off Location
            </label>
            <input
              type="text"
              required
              placeholder="Drop-off location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-white border border-black/[0.08] focus:border-black/30 rounded-xl px-3.5 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Step 3: Timer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                3. Pool Timer
              </label>
              <select
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                className="w-full bg-white border border-black/[0.08] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Phone
              </label>
              <input
                type="tel"
                placeholder="Phone number"
                value={hostPhone}
                onChange={(e) => setHostPhone(e.target.value)}
                className="w-full bg-white border border-black/[0.08] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Step 4: Host Info & First Item */}
          <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.04] space-y-3">
            <div className="text-xs font-semibold text-[#1d1d1f] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Host & First Item
              </span>
              <span className="text-[10px] text-slate-500">
                Target: ₹{selectedPlatformConfig.freeDeliveryThreshold}
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Host name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="sm:col-span-2 bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
                />

                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Host PIN (e.g. 1234)"
                  value={hostPin}
                  onChange={(e) => setHostPin(e.target.value)}
                  className="bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none font-mono"
                  title="Host Security PIN used to access Host Controls"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="sm:col-span-2 bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
                />

                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Price"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-6 bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Optional note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1d1d1f] hover:bg-black disabled:bg-slate-400 text-white font-semibold py-3 px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Pool...</span>
                </>
              ) : (
                <span>Launch Order Pool</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

