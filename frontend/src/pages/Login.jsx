import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, ArrowRight, Zap } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Role → dashboard path mapping
const ROLE_PATHS = {
  admin: '/dashboard/admin',
  donor: '/dashboard/donor',
  ngo: '/dashboard/ngo',
  rider: '/dashboard/rider',
  corporate: '/dashboard/corporate',
  community: '/community',
  volunteer: '/dashboard/volunteer',
  sponsor: '/community',
};

// Role → avatar
const ROLE_META = {
  admin: { icon: '⚡', label: 'Admin' },
  donor: { icon: '🍱', label: 'Donor' },
  ngo: { icon: '🤝', label: 'NGO' },
  rider: { icon: '🛵', label: 'Rider' },
  corporate: { icon: '🏢', label: 'Corporate' },
  community: { icon: '🌟', label: 'Community' },
  volunteer: { icon: '🙋', label: 'Volunteer' },
  sponsor: { icon: '💎', label: 'Sponsor' },
};

const HINT_CREDENTIALS = [
  { role: 'donor', email: 'donor@gmail.com', pass: 'donor123' },
  { role: 'ngo', email: 'ngo@gmail.com', pass: 'ngo123' },
  { role: 'rider', email: 'rider@gmail.com', pass: 'rider123' },
  { role: 'corporate', email: 'corporate@gmail.com', pass: 'corporate123' },
  { role: 'admin', email: 'admin@gmail.com', pass: 'admin123' },
];

export function Login() {
  const { isDark } = useTheme();
  const { loginUser } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      // Store JWT
      const userObj = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        org: data.org,
        avatar: data.avatar || ROLE_META[data.role]?.icon || '👤',
        karma: data.karma || 0,
        badge: data.badge || '',
      };

      localStorage.setItem('resq_token', data.token);
      localStorage.setItem('resq_user', JSON.stringify(userObj));
      loginUser(userObj);

      toast.success(`Welcome back, ${data.name}! 🎉`);
      navigate(ROLE_PATHS[data.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const fillHint = (cred) => {
    setEmail(cred.email);
    setPassword(cred.pass);
    setHintOpen(false);
    toast(`Filled: ${cred.email}`, { icon: ROLE_META[cred.role]?.icon });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-16 ${isDark ? 'bg-[#0b0f19]' : 'bg-gradient-to-br from-[#f0f9ff] via-[#f4f6f8] to-[#e8fdf0]'}`}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #63b3ed, #68d391)' }} />
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
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sign In</h1>
          <p className={`text-sm mb-7 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Login to your ResQ AI account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${isDark
                  ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-[#63b3ed]/60'
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#63b3ed]/60'
                  } focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20`}
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all ${isDark
                    ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-[#63b3ed]/60'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-[#63b3ed]/60'
                    } focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20`}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)', boxShadow: '0 4px 20px rgba(99,179,237,0.35)' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <button onClick={() => setHintOpen(h => !h)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${isDark ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              <Zap className="w-3.5 h-3.5" />
              {hintOpen ? 'Hide' : 'Show'} Demo Credentials
            </button>
            <AnimatePresence>
              {hintOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2">
                  <div className="space-y-1.5">
                    {HINT_CREDENTIALS.map(c => {
                      const meta = ROLE_META[c.role];
                      return (
                        <button key={c.role} onClick={() => fillHint(c)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <span className="text-base">{meta.icon}</span>
                          <div className="flex-1">
                            <span className={`font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{meta.label}</span>
                            <span className={`ml-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{c.email}</span>
                          </div>
                          <span className={`font-mono ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{c.pass}</span>
                          <ArrowRight className="w-3 h-3 text-[#63b3ed]" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className={`text-center text-xs mt-5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          © 2026 ResQ AI · Zero Waste Logistics Network · Hackathon Edition
        </p>

        <p className={`text-center text-sm mt-3 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#a78bfa] hover:underline">Register here</Link>
        </p>

      </motion.div>
    </div>
  );
}