import React, { useState } from 'react';
import { Users } from 'lucide-react';

export const SavingsCalculator: React.FC = () => {
  const [itemCost, setItemCost] = useState<number>(20);
  const [deliveryFee, setDeliveryFee] = useState<number>(49);
  const [handlingFee, setHandlingFee] = useState<number>(10);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(12);
  const [poolSize, setPoolSize] = useState<number>(3); // Number of neighbors pooling

  // Calculations
  const totalSingleOrder = itemCost + deliveryFee + handlingFee;
  const singleTaxPercentage = Math.round(((deliveryFee + handlingFee) / itemCost) * 100);

  // With 1FORM (free delivery threshold crossed)
  // Shared handling fee split among pool members
  const splitHandlingFee = Math.round(handlingFee / poolSize);
  const total1FormOrder = itemCost + splitHandlingFee; // ₹0 delivery charge
  const savingsPerOrder = totalSingleOrder - total1FormOrder;
  const monthlySavings = savingsPerOrder * monthlyOrders;
  const yearlySavings = monthlySavings * 12;

  // Hostel 300-student savings impact
  const hostelMonthlyLoss = (deliveryFee + handlingFee) * monthlyOrders * 150;

  return (
    <div className="bg-white text-[#1d1d1f] rounded-2xl p-6 sm:p-10 border border-black/[0.08] shadow-2xs space-y-8">
      {/* Header section */}
      <div className="max-w-2xl space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Savings Calculator
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          See how pooling quick-commerce carts with neighbors eliminates individual delivery charges and small order fees.
        </p>
      </div>

      {/* Interactive Controls & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-6 bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border border-black/[0.04] space-y-6">
          <h3 className="text-sm font-bold text-[#1d1d1f]">
            Order Scenario
          </h3>

          {/* Item Cost Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-700">Item Cost</label>
              <span className="text-[#1d1d1f] font-bold">₹{itemCost}</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={itemCost}
              onChange={(e) => setItemCost(Number(e.target.value))}
              className="w-full accent-[#1d1d1f] cursor-pointer bg-slate-200 h-1.5 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹10</span>
              <span>₹150</span>
              <span>₹300</span>
            </div>
          </div>

          {/* Delivery Fee Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-700">App Delivery Charge</label>
              <span className="text-slate-900 font-bold">₹{deliveryFee}</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full accent-[#1d1d1f] cursor-pointer bg-slate-200 h-1.5 rounded-lg"
            />
          </div>

          {/* Handling / Surge Fee */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-700">Platform Handling Fee</label>
              <span className="text-slate-900 font-bold">₹{handlingFee}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="2"
              value={handlingFee}
              onChange={(e) => setHandlingFee(Number(e.target.value))}
              className="w-full accent-[#1d1d1f] cursor-pointer bg-slate-200 h-1.5 rounded-lg"
            />
          </div>

          {/* Monthly Order Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-700">Monthly Orders</label>
              <span className="text-slate-900 font-bold">{monthlyOrders} orders/mo</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(Number(e.target.value))}
              className="w-full accent-[#1d1d1f] cursor-pointer bg-slate-200 h-1.5 rounded-lg"
            />
          </div>

          {/* Pool Neighbors Count */}
          <div className="space-y-2 pt-2 border-t border-black/[0.06]">
            <div className="flex justify-between text-xs font-semibold">
              <label className="text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Neighbors Pooling
              </label>
              <span className="text-[#1d1d1f] font-bold">{poolSize} members</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setPoolSize(num)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    poolSize === num
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-black/[0.06]'
                  }`}
                >
                  {num} Poolers
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Standard Solo Order Card */}
            <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl p-5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solo Order</div>
              <div className="text-2xl font-bold text-[#1d1d1f]">
                ₹{totalSingleOrder}
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Item price:</span>
                  <span className="font-semibold text-slate-900">₹{itemCost}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Delivery + Handling:</span>
                  <span>+₹{deliveryFee + handlingFee}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-black/[0.06]">
                Adds <strong>{singleTaxPercentage}% extra cost</strong> to item.
              </div>
            </div>

            {/* 1FORM Pooled Order Card */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Pooled Order</div>
              <div className="text-2xl font-bold text-emerald-950">
                ₹{total1FormOrder}
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Item price:</span>
                  <span className="font-semibold text-slate-900">₹{itemCost}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Delivery Charge:</span>
                  <span>₹0 Free</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Split Handling:</span>
                  <span>₹{splitHandlingFee}</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold pt-2 border-t border-emerald-200/60">
                Saves <strong>₹{savingsPerOrder}</strong> on this order.
              </div>
            </div>

          </div>

          {/* Monthly & Yearly Savings Highlight Box */}
          <div className="bg-[#1d1d1f] text-white rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual Pocket Savings</span>
              <h4 className="text-3xl font-bold text-white">
                ₹{yearlySavings.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ year</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Your Monthly Saved</span>
                <span className="text-base font-bold text-white">₹{monthlySavings.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hub Monthly Impact</span>
                <span className="text-base font-bold text-white">₹{hostelMonthlyLoss.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};


