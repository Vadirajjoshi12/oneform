import React from 'react';
import { Community, UserLocationState } from '../types';
import { MapPin, Info, ShoppingBag, HelpCircle, Sparkles } from 'lucide-react';
import { formatDistance, calculateDistanceInKm } from '../utils/location';

interface HeaderProps {
  activeCommunity: Community;
  onOpenCommunityModal: () => void;
  onOpenCreatePoolModal: () => void;
  onOpenAboutModal: () => void;
  locationState: UserLocationState;
  onRequestLocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCommunity,
  onOpenCommunityModal,
  onOpenCreatePoolModal,
  onOpenAboutModal,
  locationState,
  onRequestLocation,
}) => {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl text-[#1d1d1f] border-b border-black/[0.06] transition-all">
      <div className="w-full px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo - Dead Left */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-xs">
              1F
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-[#1d1d1f] font-sans">
                1FORM
              </h1>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">
                Local Quick-Commerce Pooling
              </p>
            </div>
          </div>

          {/* Navigation Links - Dead Right */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-end">
            {/* Location */}
            <button
              onClick={onOpenCommunityModal}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-1 px-1 rounded-md"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Your location</span>
            </button>

            {/* Active Pools Link */}
            <button
              onClick={() => scrollToSection('active-pools')}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-1 px-1 rounded-md"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Active Pools</span>
            </button>

            {/* How It Works Link */}
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-1 px-1 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>How It Works</span>
            </button>

            {/* About Link */}
            <button
              onClick={() => scrollToSection('about')}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-1 px-1 rounded-md"
              title="About 1Form"
            >
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>About</span>
            </button>

            {/* Support Link */}
            <button
              onClick={() => scrollToSection('support')}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-1 px-1 rounded-md"
              title="Support & Helpdesk"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Support</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

