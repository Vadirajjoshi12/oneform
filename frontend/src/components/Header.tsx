import React, { useState } from 'react';
import { Community, UserLocationState } from '../types';
import { MapPin, Info, ShoppingBag, HelpCircle, Sparkles, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeCommunity: Community;
  onOpenCommunityModal: () => void;
  onOpenCreatePoolModal: () => void;
  onOpenAboutModal: () => void;
  locationState: UserLocationState;
  onRequestLocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommunityModal,
  onOpenAboutModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navigation = [
    { label: 'Your location', icon: MapPin, action: onOpenCommunityModal },
    { label: 'Active Pools', icon: ShoppingBag, action: () => scrollToSection('active-pools') },
    { label: 'How It Works', icon: Sparkles, action: () => scrollToSection('how-it-works') },
    { label: 'About', icon: Info, action: onOpenAboutModal },
    { label: 'Support', icon: HelpCircle, action: () => scrollToSection('support') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl text-[#1d1d1f] border-b border-black/[0.06]">
      <div className="w-full px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Go to 1FORM home"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-xs">
              1F
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-xl tracking-tight text-[#1d1d1f] font-sans">1FORM</h1>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">Local Quick-Commerce Pooling</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-3 lg:gap-6" aria-label="Primary navigation">
            {navigation.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] transition-colors py-2 px-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              >
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav id="mobile-navigation" className="md:hidden pb-3 border-t border-black/[0.05] pt-2" aria-label="Mobile navigation">
            <div className="grid grid-cols-1 gap-1">
              {navigation.map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="w-full flex items-center gap-3 text-left text-sm font-semibold text-slate-700 hover:text-[#1d1d1f] hover:bg-black/[0.04] rounded-xl px-3 py-3 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
