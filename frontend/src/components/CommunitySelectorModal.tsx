import React, { useState } from 'react';
import { Community, UserLocationState } from '../types';
import { X, Plus, Check, Building, GraduationCap, Home } from 'lucide-react';
import { calculateDistanceInKm } from '../utils/location';

interface CommunitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: Community[];
  activeCommunity: Community;
  onSelectCommunity: (community: Community) => void;
  onAddCommunity: (newCommunity: Community) => void;
  locationState: UserLocationState;
  onRequestLocation: () => void;
}

export const CommunitySelectorModal: React.FC<CommunitySelectorModalProps> = ({
  isOpen,
  onClose,
  communities,
  activeCommunity,
  onSelectCommunity,
  onAddCommunity,
  locationState,
  onRequestLocation,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Community['type']>('Hostel');
  const [locationArea, setLocationArea] = useState('');
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Distance from current user position to active community
  const activeDistance = locationState.coords
    ? calculateDistanceInKm(locationState.coords.lat, locationState.coords.lng, activeCommunity.lat, activeCommunity.lng)
    : null;
  const isPresentAtActiveHub = activeDistance !== null && activeDistance <= (activeCommunity.radiusKm || 2.0);

  // Calculate distance for all communities and sort by distance
  const communitiesWithDistance = communities.map((c) => {
    const dist = locationState.coords
      ? calculateDistanceInKm(locationState.coords.lat, locationState.coords.lng, c.lat, c.lng)
      : null;
    const isWithinFence = dist !== null && dist <= (c.radiusKm || 2.0);
    return { ...c, dist, isWithinFence };
  });

  const sortedCommunities = [...communitiesWithDistance].sort((a, b) => {
    if (a.dist !== null && b.dist !== null) {
      return a.dist - b.dist;
    }
    return 0;
  });

  const handleDisabledClick = (communityName: string) => {
    setToastFeedback(`Move closer to select ${communityName}.`);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationArea.trim()) return;

    if (locationState.status !== 'granted' || !locationState.coords) {
      onRequestLocation();
      return;
    }

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: name.trim(),
      type,
      location: locationArea.trim(),
      lat: locationState.coords.lat,
      lng: locationState.coords.lng,
      radiusKm: 1.5,
      memberCount: 1,
      totalSaved: 0,
      activePoolsCount: 0,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop&q=60',
    };

    onAddCommunity(newComm);
    onSelectCommunity(newComm);
    setName('');
    setLocationArea('');
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden my-8 text-[#1d1d1f] flex flex-col">
        
        {/* Header - Clean Apple HIG Single Bar */}
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between shrink-0 bg-white/50">
          <h3 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">
            Select Community Hub
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.10] text-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Inline Feedback Toast on Tap */}
        {toastFeedback && (
          <div className="bg-[#1d1d1f] text-white text-xs font-semibold px-4 py-2.5 mx-6 mt-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200 shadow-md">
            <span>{toastFeedback}</span>
            <button onClick={() => setToastFeedback(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {!showAddForm ? (
            <>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {sortedCommunities.map((c) => {
                  const isActive = c.id === activeCommunity.id;
                  const isSelectDisabled = isPresentAtActiveHub && !isActive;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (isSelectDisabled) {
                          handleDisabledClick(c.name);
                          return;
                        }
                        onSelectCommunity(c);
                        onClose();
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-black/[0.03] border-black/20 shadow-2xs'
                          : isSelectDisabled
                          ? 'bg-slate-50/50 opacity-50 border-black/[0.04] cursor-not-allowed'
                          : 'bg-white border-black/[0.06] hover:bg-black/[0.02] hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-slate-800 font-semibold shrink-0">
                          {c.type === 'Hostel' && <GraduationCap className="w-5 h-5" />}
                          {c.type === 'PG' && <Home className="w-5 h-5" />}
                          {c.type === 'Apartment Complex' && <Building className="w-5 h-5" />}
                          {c.type === 'College Campus' && <GraduationCap className="w-5 h-5" />}
                        </div>

                        <div>
                          <div className="font-extrabold text-sm text-[#1d1d1f] tracking-tight flex items-center gap-2">
                            <span>{c.name}</span>
                          </div>

                          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{c.memberCount} members</span>
                            <span>•</span>
                            <span className={c.isWithinFence ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                              {c.isWithinFence ? 'Current Location' : c.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (locationState.status !== 'granted') {
                    onRequestLocation();
                    return;
                  }
                  setShowAddForm(true);
                }}
                className="w-full bg-[#1d1d1f] hover:bg-black text-white font-bold py-3.5 px-6 rounded-full text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-xs mt-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Register New Hub at Current Location</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                Register New Hub
              </div>

              <input
                type="text"
                required
                placeholder="Hub Name (e.g. St. Xavier's Hostel Block C)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/[0.03] border border-black/[0.08] focus:border-black/30 rounded-2xl px-4 py-3 text-xs text-[#1d1d1f] focus:outline-none font-medium"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Community['type'])}
                  className="bg-black/[0.03] border border-black/[0.08] focus:border-black/30 rounded-2xl px-3.5 py-3 text-xs text-[#1d1d1f] focus:outline-none font-medium"
                >
                  <option value="Hostel">Hostel</option>
                  <option value="PG">PG (Paying Guest)</option>
                  <option value="Apartment Complex">Apartment Complex</option>
                  <option value="College Campus">College Campus</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="City / Area (e.g. Koramangala)"
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full bg-black/[0.03] border border-black/[0.08] focus:border-black/30 rounded-2xl px-4 py-3 text-xs text-[#1d1d1f] focus:outline-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-1/2 bg-black/[0.05] text-slate-700 font-bold py-3 rounded-full text-xs hover:bg-black/[0.10] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#1d1d1f] text-white font-bold py-3 rounded-full text-xs hover:bg-black transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Create & Anchor Hub
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
