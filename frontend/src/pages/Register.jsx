import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Zap, Check } from 'lucide-react';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

const ROLES = [
  { value: 'donor', label: 'Donor', icon: '🍱', desc: 'Restaurant / Business' },
  { value: 'ngo', label: 'NGO', icon: '🤝', desc: 'Non-profit / Charity' },
  { value: 'rider', label: 'Rider', icon: '🛵', desc: 'Delivery Volunteer' },
  { value: 'corporate', label: 'Corporate', icon: '🏢', desc: 'Corporate Partner' },
  { value: 'community', label: 'Community', icon: '🌟', desc: 'General Member' },
];

export function Register() {
  const { isDark } = useTheme();
  const { loginUser } = useRole();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', org: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all required fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, form);
      const userObj = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        org: data.org,
        karma: 0,
      };
      localStorage.setItem('resq_token', data.token);
      localStorage.setItem('resq_user', JSON.stringify(userObj));
      loginUser(userObj);
      toast.success(`Welcome to ResQ AI, ${data.name}! 🎉`);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    }
    setLoading(false);
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm transition-all
    ${isDark
      ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-[#63b3ed]/60'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#63b3ed]/60'}
    focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-16 ${isDark ? 'bg-[#0b0f19]' : 'bg-gradient-to-br from-[#f0f9ff] via-[#f4f6f8] to-[#e8fdf0]'}`}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a78bfa, #63b3ed)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-black gradient-text mb-1">⚡ ResQ AI</div>
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Zero Waste Logistics Network</p>
          </Link>
        </div>

        {/* Card */}
        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-8`}>
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
          <p className={`text-sm mb-7 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Join the ResQ AI zero-waste network</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Arjun Patel" autoComplete="name" className={inputCls} />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" autoComplete="email" className={inputCls} />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Organisation (optional) */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Organisation <span className="font-normal opacity-50">(optional)</span></label>
              <input type="text" value={form.org} onChange={e => set('org', e.target.value)}
                placeholder="e.g. Zomato, Akshaya Patra" className={inputCls} />
            </div>

            {/* Role selector */}
            <div>
              <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>I am a *</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => set('role', r.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${form.role === r.value
                      ? 'border-[#63b3ed] bg-[#63b3ed]/10 text-[#63b3ed]'
                      : isDark ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}>
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{r.label}</div>
                      <div className="text-[10px] opacity-60 truncate">{r.desc}</div>
                    </div>
                    {form.role === r.value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #63b3ed)', boxShadow: '0 4px 20px rgba(167,139,250,0.35)' }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account...</>
                : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </motion.button>
          </form>

          {/* Link to Login */}
          <p className={`text-center text-sm mt-6 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#63b3ed] hover:underline">Sign in</Link>
          </p>
        </div>

        <p className={`text-center text-xs mt-5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          © 2026 ResQ AI · Zero Waste Logistics Network
        </p>
      </motion.div>
    </div>
  );
}