import React from 'react';
import { Car, ShoppingBag, Coffee, Package, ShieldCheck, ArrowRight, Sparkles, Users, Layers, Zap } from 'lucide-react';

export const VisionSection: React.FC = () => {
  const VISION_MODULES = [
    {
      id: 'quick-commerce',
      title: 'Quick-Commerce Order Pooling',
      subtitle: 'Crush ₹49 delivery fees on ₹20 items',
      status: 'Live MVP',
      statusColor: 'bg-emerald-600 text-white font-black',
      icon: ShoppingBag,
      description: 'Combine Blinkit, Zepto, Swiggy Instamart, Amazon Now, and Flipkart Minutes carts with neighbors in 1 form.',
      savings: 'Save ₹3,000+ per student/year',
    },
    {
      id: 'cab-sharing',
      title: 'Airport & Railway Cab Pooling',
      subtitle: 'Split ₹1,200 airport Uber/Ola fares',
      status: 'In Development',
      statusColor: 'bg-amber-100 text-amber-900 border border-amber-200 font-extrabold',
      icon: Car,
      description: 'Find hostel mates heading to the airport or railway station at the exact same flight/train times.',
      savings: 'Save up to ₹900 per ride',
    },
    {
      id: 'bulk-crates',
      title: 'Bulk PG Grocery & Snack Wholesale',
      subtitle: 'Wholesale prices for community pantries',
      status: 'Coming Soon',
      statusColor: 'bg-blue-100 text-blue-900 border border-blue-200 font-extrabold',
      icon: Package,
      description: 'Pool demand for Maggi cases, milk crates, eggs, and water cans directly from distributors.',
      savings: '25% discount off MRP',
    },
    {
      id: 'exam-drops',
      title: 'Exam Night Coffee & Energy Drops',
      subtitle: 'Scheduled midnight fuel deliveries',
      status: 'Coming Soon',
      statusColor: 'bg-purple-100 text-purple-900 border border-purple-200 font-extrabold',
      icon: Coffee,
      description: 'Automatic 2 AM coffee and red bull drops to hostel study blocks during midterms.',
      savings: 'Guaranteed 0 delivery fee',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Vision Pitch Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4 text-emerald-600" />
          The Grand 1FORM Vision
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The vision goes far beyond delivery savings.
        </h2>

        <p className="text-slate-600 text-sm sm:text-lg max-w-3xl leading-relaxed font-medium">
          Many everyday problems in hostels, PGs, and residential communities can be solved far more efficiently when people with common needs are connected at the right time.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl max-w-2xl text-xs sm:text-sm font-extrabold flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Turning individual isolated needs into powerful collective community benefits.</span>
        </div>
      </div>

      {/* Grid of Collective Need Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VISION_MODULES.map((mod) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={mod.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${mod.statusColor}`}>
                    {mod.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-emerald-700 font-bold">{mod.subtitle}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {mod.savings}
                </span>
                <span className="text-slate-500 group-hover:text-emerald-700 transition-colors flex items-center gap-1 font-bold">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
