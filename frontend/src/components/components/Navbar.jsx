import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useRole } from '../../contexts/RoleContext';
import {
  Sun, Moon, Menu, X, Zap, LogIn, LogOut, LayoutDashboard, Users,
} from 'lucide-react';


const navLinks = [];

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { currentRole, user, getDashboardPath, logoutUser } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem('resq_token');

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${isDark
      ? 'bg-[#0b0f19]/90 backdrop-blur-xl border-white/10'
      : 'bg-white/80 backdrop-blur-xl border-white/60 shadow-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)', boxShadow: '0 4px 15px rgba(99,179,237,0.4)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Zap className="w-5 h-5 text-white fill-white" />
            </motion.div>
            <div>
              <span className="text-lg font-bold gradient-text">ResQ AI</span>
              <div className={`text-[9px] font-medium leading-none ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                Zero Waste Network
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === link.to
                  ? 'bg-[#63b3ed]/10 text-[#63b3ed]'
                  : isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-white/10 hover:bg-white/20 text-yellow-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {isLoggedIn ? (
              <>
                {/* User display */}
                <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <span className="text-base">{user?.avatar || '👤'}</span>
                  <span className="hidden lg:block max-w-[100px] truncate">{user?.name || 'User'}</span>
                </div>
                {/* Community link */}
                {isLoggedIn && (
                  <Link
                    to="/community"
                    className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/community'
                      ? 'bg-[#a78bfa]/10 text-[#a78bfa]'
                      : isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Community
                  </Link>
                )}
                {/* Dashboard link */}
                <Link
                  to={getDashboardPath()}
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)', boxShadow: '0 4px 12px rgba(99,179,237,0.3)' }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                {/* Logout */}
                <motion.button whileTap={{ scale: 0.92 }}
                  onClick={handleLogout}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/8 text-white/60 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </>
            ) : (
              /* Login button */
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)', boxShadow: '0 4px 12px rgba(99,179,237,0.3)' }}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden border-t ${isDark ? 'bg-[#0b0f19] border-white/10' : 'bg-white border-gray-100'}`}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }}>
                {isLoggedIn ? (
                  <>
                    <Link to={getDashboardPath()} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/community" onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${location.pathname === '/community' ? 'text-[#a78bfa] font-semibold' : isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Users className="w-4 h-4" /> Community
                    </Link>

                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 ${isDark ? 'hover:bg-white/10' : 'hover:bg-red-50'}`}>
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#63b3ed]">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}