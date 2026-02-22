import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import {
  ArrowRight, Zap, Leaf, Users, TrendingUp, Heart,
  Shield, Truck, MapPin, Award, ChevronRight, Globe,
  Star, Building2, Bike, Package, CheckCircle, Sparkles, Wind
} from 'lucide-react';

// Animated Counter
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="counter-value">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Floating bike animation
function AnimatedBike() {
  return (
    <div className="absolute bottom-8 left-0 w-full overflow-hidden pointer-events-none h-16">
      <motion.div
        className="absolute bottom-0"
        animate={{ x: ['−120px', 'calc(100vw + 120px)'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ x: -120 }}
      >
        <div className="relative">
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
              <circle cx="20" cy="36" r="12" stroke="#63b3ed" strokeWidth="3" fill="none" />
              <circle cx="60" cy="36" r="12" stroke="#63b3ed" strokeWidth="3" fill="none" />
              <circle cx="20" cy="36" r="3" fill="#63b3ed" />
              <circle cx="60" cy="36" r="3" fill="#63b3ed" />
              <path d="M20 36 L40 15 L60 36" stroke="#68d391" strokeWidth="3" strokeLinecap="round" />
              <path d="M40 15 L45 8" stroke="#68d391" strokeWidth="2" strokeLinecap="round" />
              <path d="M45 8 L52 8" stroke="#63b3ed" strokeWidth="3" strokeLinecap="round" />
              <circle cx="44" cy="6" r="4" fill="#f97316" />
              <path d="M40 15 L35 25 L45 25" stroke="#63b3ed" strokeWidth="2" />
              <rect x="13" y="24" width="14" height="4" rx="2" fill="#63b3ed" opacity="0.5" />
            </svg>
          </motion.div>
          {/* Speed lines */}
          <motion.div className="absolute top-4 -left-8 flex gap-1" animate={{ opacity: [0.8, 0.3, 0.8] }} transition={{ duration: 0.3, repeat: Infinity }}>
            {[12, 8, 5].map((w, i) => (
              <div key={i} style={{ width: w, height: 2, background: '#63b3ed', opacity: 0.6, borderRadius: 1 }} />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const STATS = [
  { label: 'Meals Saved', value: 12847, suffix: '', icon: '🍱', color: '#63b3ed' },
  { label: 'Kg Food Rescued', value: 6230, suffix: 'kg', icon: '🥦', color: '#68d391' },
  { label: 'CO₂ Prevented', value: 15.5, suffix: 'T', icon: '🌿', color: '#22c55e' },
  { label: 'NGOs Supported', value: 48, suffix: '+', icon: '🤝', color: '#f97316' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Shield, title: 'AI Safety Check', description: 'Gemini AI analyzes food safety in real-time, scoring donations based on freshness, preparation time, and visual quality.', color: '#63b3ed', gradient: 'from-blue-400 to-cyan-300' },
  { step: '02', icon: Bike, title: 'Smart Pickup', description: 'Verified riders are matched based on proximity, capacity, and urgency — optimized routes calculated instantly.', color: '#68d391', gradient: 'from-emerald-400 to-green-300' },
  { step: '03', icon: MapPin, title: 'Live Tracking', description: 'Real-time GPS tracking with animated status updates. Donors and NGOs get live visibility end-to-end.', color: '#f97316', gradient: 'from-orange-400 to-amber-300' },
  { step: '04', icon: Heart, title: 'Impact Delivery', description: 'Food reaches NGOs minutes ahead of expiry. Digital proof of impact, carbon credits, and certificates auto-generated.', color: '#22c55e', gradient: 'from-green-400 to-emerald-300' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Restaurant Owner, Mumbai', text: 'We were throwing away 40kg daily. ResQ-AI turned that into 120 meals for children in Dharavi. The AI verification takes 30 seconds — it\'s incredible.', avatar: '👩‍🍳', stars: 5 },
  { name: 'Arjun Verma', role: 'ResQ Rider, Bengaluru', text: 'The karma system keeps me motivated. I\'ve done 280 rescues and earned my Climate Warrior badge. It\'s a movement, not just a job.', avatar: '🛵', stars: 5 },
  { name: 'Meera Nair', role: 'Director, Akshara Patra Foundation', text: 'Before ResQ-AI, coordination was all WhatsApp groups and guesswork. Now we get matched donations in under 5 minutes. Life-changing.', avatar: '🤝', stars: 5 },
];

const SDG_BADGES = [
  { num: 2, label: 'Zero Hunger', color: '#D3A029', bg: '#FFF3CD' },
  { num: 11, label: 'Sustainable Cities', color: '#F99D26', bg: '#FFF0E0' },
  { num: 13, label: 'Climate Action', color: '#3F7E44', bg: '#E8F5E9' },
];

const COMMUNITY_PREVIEW = [];

export function Home() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const howItWorksRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const scrollToHow = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'}`}>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.15), transparent)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute -bottom-20 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(circle, rgba(104,211,145,0.15), transparent)' }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />
        </div>

        {/* Map grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(to right, rgba(99,179,237,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <AnimatedBike />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tag badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.3)', color: '#63b3ed' }}>
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Zero Waste Logistics
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className={`text-5xl md:text-7xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              From <span className="gradient-text">Waste</span> to Worth —
              <br />
              <span className={isDark ? 'text-white' : 'text-gray-900'}>Every Meal</span>{' '}
              <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Matters
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              ResQ-AI is a smart city food rescue ecosystem — combining restaurant surplus redistribution,
              NGO demand matching, rider logistics and AI waste intelligence to end hunger and food waste simultaneously.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center">
              {/* Know More — scrolls to How It Works */}
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={scrollToHow}
                className={`px-8 py-3.5 text-base font-semibold rounded-full flex items-center gap-2 transition-all border-2 ${isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-white hover:shadow-md'}`}>
                <ChevronRight className="w-4 h-4" />
                Know More
              </motion.button>
              {/* Get Started — goes to login */}
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
                className="gradient-btn-primary px-8 py-3.5 text-base font-semibold flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Get Started
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ANIMATED COUNTERS */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} {...fadeUp(i * 0.1)}
                className={`${isDark ? 'glass-card' : 'clay-card'} p-6 text-center`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                <p className={`text-sm font-medium mt-1 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className={`text-sm font-semibold uppercase tracking-widest ${isDark ? 'text-[#63b3ed]' : 'text-[#63b3ed]'}`}>The Journey</span>
            <h2 className={`text-4xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Waste → Rescue → Delivery → <span className="gradient-text">Impact</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#63b3ed] via-[#68d391] to-[#f97316] opacity-30" />
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.step} {...fadeUp(i * 0.15)} className={`${isDark ? 'glass-card' : 'clay-card'} p-6 relative`}>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}>
                    {step.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${step.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <h3 className={`font-bold text-base mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/55' : 'text-gray-500'}`}>{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORPORATE SURPLUS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className={`${isDark ? 'glass-card' : 'clay-card'} p-10 md:p-16 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
              style={{ background: '#63b3ed' }} />
            <div className="relative z-10 md:flex items-center gap-12">
              <div className="flex-1 mb-8 md:mb-0">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4"
                  style={{ background: 'linear-gradient(135deg, #63b3ed, #4a9fd4)' }}>
                  Corporate CSR Module
                </span>
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Turn Cafeteria Surplus Into <span className="gradient-text">ESG Impact</span>
                </h2>
                <p className={`text-base mb-6 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                  ResQ-AI helps corporate canteens predict daily surplus using AI, bulk-schedule rescue tickets, track employee volunteer karma, and generate monthly ESG PDF reports for board-level reporting.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {['AI Surplus Prediction', 'Employee Karma', 'ESG PDF Reports', 'CSR Badge Tiers', 'Tax Certificates'].map(tag => (
                    <span key={tag} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-600'}`}>
                      ✓ {tag}
                    </span>
                  ))}
                </div>

              </div>
              <div className="flex-none grid grid-cols-2 gap-3">
                {[
                  { label: 'Meals Sponsored', value: '4,200', icon: '🍽️', color: '#63b3ed' },
                  { label: 'CO₂ Prevented', value: '2.1 T', icon: '🌿', color: '#68d391' },
                  { label: 'Volunteers', value: '340', icon: '👥', color: '#f97316' },
                  { label: 'NGOs Reached', value: '12', icon: '🤝', color: '#22c55e' },
                ].map(m => (
                  <div key={m.label} className={`p-4 rounded-2xl text-center ${isDark ? 'bg-white/8' : 'bg-white/80'}`}>
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <div className="text-xl font-bold" style={{ color: m.color }}>{m.value}</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY PREVIEW */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Live from the <span className="gradient-text">Community</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {COMMUNITY_PREVIEW.map((post, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className={`${isDark ? 'glass-card' : 'clay-card'} p-5 flex items-start gap-3`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: isDark ? 'rgba(99,179,237,0.2)' : '#e8f4fd' }}>
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.user}</p>
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{post.action}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{post.time}</p>
                </div>
                <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0 animate-pulse"
                  style={{ background: post.type === 'donation' ? '#63b3ed' : post.type === 'achievement' ? '#f97316' : '#22c55e' }} />
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeUp(0.3)} className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#63b3ed] hover:underline">
              View Full Community Feed <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SDG BADGES */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-8">
            <p className={`text-sm font-semibold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              Contributing to UN Sustainable Development Goals
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-4">
            {SDG_BADGES.map(sdg => (
              <div key={sdg.num} className="flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold"
                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : sdg.bg, color: sdg.color, border: `1px solid ${sdg.color}30` }}>
                <span className="text-2xl font-black">SDG {sdg.num}</span>
                <span className="text-sm">{sdg.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voices from the Network</h2>
          </motion.div>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx}
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className={`${isDark ? 'glass-card' : 'clay-card'} p-8 text-center`}>
                <div className="text-4xl mb-4">{TESTIMONIALS[testimonialIdx].avatar}</div>
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: TESTIMONIALS[testimonialIdx].stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className={`text-base italic mb-6 ${isDark ? 'text-white/75' : 'text-gray-600'}`}>
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{TESTIMONIALS[testimonialIdx].name}</div>
                <div className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{TESTIMONIALS[testimonialIdx].role}</div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-6 bg-[#63b3ed]' : isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className={`${isDark ? 'glass-card' : 'clay-card'} p-12 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #63b3ed 0%, transparent 60%)' }} />
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-[#63b3ed]" />
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ready to Make a Difference?</h2>
            <p className={`text-lg mb-8 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              Join thousands of donors, riders, NGOs and corporates building a zero-waste food future.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
                className="gradient-btn-mint px-10 py-4 text-base font-bold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Get Started with the Journey
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 px-4 ${isDark ? 'border-white/10 bg-[#080c14]' : 'border-gray-100 bg-white'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold gradient-text">ResQ-AI</span>
              </div>
              <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Zero Waste Logistics Network. Powered by AI, Driven by Purpose.</p>
            </div>
            {[
              { title: 'Platform', links: ['Donor Portal', 'Rider App', 'NGO Dashboard', 'Corporate CSR'] },
              { title: 'Impact', links: ['Community Feed', 'Analytics', 'SDG Tracker', 'Carbon Calculator'] },
              { title: 'Company', links: ['About ResQ-AI', 'Partners', 'Blog', 'Hackathon 2026'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className={`font-bold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className={`text-xs hover:text-[#63b3ed] transition-colors ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-2 text-xs ${isDark ? 'border-white/10 text-white/30' : 'border-gray-100 text-gray-400'}`}>
            <span>© 2026 ResQ-AI. Building a Zero Hunger Future.</span>
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> SDG Certified • Hackathon Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}