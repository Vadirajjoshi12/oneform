import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Mail, HelpCircle, ShieldCheck, ArrowRight, PhoneCall, LifeBuoy } from 'lucide-react';

export const SupportSection: React.FC = () => {
  return (
    <motion.section
      id="support"
      initial={{ opacity: 0.05, filter: 'blur(16px)', y: 60, scale: 0.97 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 sm:p-14 border border-black/[0.08] shadow-2xs text-[#1d1d1f] space-y-10 my-12 transition-all duration-700"
    >
      {/* Top Centered Icon & Title inspired by Apple Support UI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        {/* Blue Circle Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md transition-transform hover:scale-105">
          1F
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1d1d1f]">
          1Form Support
        </h2>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 font-medium tracking-tight">
          Need help? Start here.
        </p>
      </motion.div>

      {/* Support Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto pt-2">
        {/* Card 1: WhatsApp Support */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          href="https://wa.me/917026707077"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[#f5f5f7] hover:bg-emerald-50/80 border border-black/[0.05] hover:border-emerald-500/30 p-6 sm:p-8 rounded-[24px] flex flex-col justify-between transition-all duration-200 hover:shadow-md"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] group-hover:text-emerald-950 transition-colors">
              WhatsApp Helpdesk
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
               Send us an email for account support, community requests, or feedback.
            </p>
          </div>

          <div className="pt-6 flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 group-hover:text-emerald-800">
            <span>Chat on WhatsApp</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.a>

        {/* Card 2: Email Support */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          href="mailto:vadiraj12006@gmail.com"
          className="group bg-[#f5f5f7] hover:bg-blue-50/80 border border-black/[0.05] hover:border-blue-500/30 p-6 sm:p-8 rounded-[24px] flex flex-col justify-between transition-all duration-200 hover:shadow-md"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1d1d1f] group-hover:text-blue-950 transition-colors">
              Email Support
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Send us an email anytime. Our team responds within 1 hour for account support, community requests, or feedback.
            </p>
          </div>

          <div className="pt-6 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0071e3] group-hover:text-blue-800">
            <span>vadiraj12006@gmail.com</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.a>
      </div>

      {/* Frequently Asked Questions Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="max-w-4xl mx-auto bg-[#f5f5f7] rounded-[24px] p-6 sm:p-8 border border-black/[0.05] space-y-4"
      >
        <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
          <HelpCircle className="w-5 h-5 text-[#0071e3]" />
          <h4 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">
            Quick Help Topics
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-medium text-slate-700">
          <div className="bg-white p-4 rounded-xl border border-black/[0.04]">
            <strong className="text-[#1d1d1f] block text-sm font-bold mb-1">How do payments work?</strong>
            You pay the pool host directly via UPI using their phone number or QR code shown inside the pool card.
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.04]">
            <strong className="text-[#1d1d1f] block text-sm font-bold mb-1">Is 1Form free to use?</strong>
            Yes! 1Form is 100% free and zero-commission. It helps neighbors pool orders to eliminate delivery & surge charges.
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.04]">
            <strong className="text-[#1d1d1f] block text-sm font-bold mb-1">What are Host Controls?</strong>
            The pool host uses a secure 4-digit PIN to update delivery milestones (Placed, Out for Delivery, Arrived) and lock items.
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.04]">
            <strong className="text-[#1d1d1f] block text-sm font-bold mb-1">Can I start my own pool?</strong>
            Absolutely! Click "Host an Order Pool", choose Zepto, Blinkit, or Instamart, set a pickup location, and share with neighbors.
          </div>
        </div>
      </motion.div>

      {/* Footer Guarantee */}
      <div className="text-center pt-2 text-xs sm:text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>100% Zero-Commission Community Order Pooling</span>
      </div>
    </motion.section>
  );
};
