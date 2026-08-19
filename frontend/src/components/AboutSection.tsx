import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Users, Heart, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <motion.section
      id="about"
      initial={{ opacity: 0.05, filter: 'blur(16px)', y: 60, scale: 0.97 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 sm:p-14 border border-black/[0.08] shadow-2xs text-[#1d1d1f] space-y-10 my-12 transition-all duration-700"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md tracking-tight">
          1F
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>1FORM Team</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">About Us</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          The mind & engine behind local order pooling
        </p>
      </motion.div>

      <div className="bg-black/[0.02] border border-black/[0.05] p-6 sm:p-8 rounded-2xl space-y-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#1d1d1f]">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Our Mission</span>
        </div>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          1FORM was created to solve high delivery fees and minimum order surges on Blinkit, Zepto, and Swiggy Instamart by connecting neighbors in hostels, PGs, and apartments through real-time GPS-verified order pools.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center">
          <Users className="w-4 h-4 text-slate-500" />
          <span>Founders & Builders</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/90 border border-black/[0.08] p-6 rounded-2xl space-y-3 hover:border-black/20 transition-all shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">V</div>
              <div>
                <h4 className="font-extrabold text-base text-[#1d1d1f] tracking-tight">Vadiraj</h4>
                <span className="text-[11px] text-emerald-900 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-extrabold inline-block border border-emerald-500/20">Founder & Systems</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">Handles technical execution—from database design to real-time sync systems.</p>
          </div>

          <div className="bg-white/90 border border-black/[0.08] p-6 rounded-2xl space-y-3 hover:border-black/20 transition-all shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">Y</div>
              <div>
                <h4 className="font-extrabold text-base text-[#1d1d1f] tracking-tight">Yashvanth</h4>
                <span className="text-[11px] text-emerald-900 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-extrabold inline-block border border-emerald-500/20">Co-Founder & Product</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">Leading product strategy and user experience to ensure friction-free order pooling and instant hyper-local delivery savings.</p>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center text-xs sm:text-sm text-slate-400 font-semibold flex items-center justify-center gap-1.5">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span>Built for local student & residential communities by Yashvanth & Vadiraj</span>
      </div>

      <footer className="border-t border-black/[0.06] pt-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <span>© {new Date().getFullYear()} 1FORM. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <a href="#support" className="hover:text-[#1d1d1f] transition-colors">Support</a>
          <a href="#about" className="hover:text-[#1d1d1f] transition-colors">About</a>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Community-first</span>
        </div>
      </footer>
    </motion.section>
  );
};
