import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Heart, AlertTriangle, CheckCircle, Zap, Package } from 'lucide-react';
import api from '../services/api';
import HistoryDetailsModal from '../components/HistoryDetailsModal';

const FOOD_PREFS = ['Any', 'Vegetarian', 'Vegan', 'Non-Veg', 'Gluten-Free', 'Halal'];



export function NGODashboard() {
  const { isDark } = useTheme();
  const { user } = useRole();
  const [mealsRequired, setMealsRequired] = useState('');
  const [foodPref, setFoodPref] = useState('Any');
  const [urgency, setUrgency] = useState(5);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [searched, setSearched] = useState(false);
  const [accepted, setAccepted] = useState([]);
  const [stats, setStats] = useState({ mealsReceived: 0, activeRequests: 0, beneficiaries: 0, partnerDonors: 0 });
  const [activeTab, setActiveTab] = useState('find');
  const [history, setHistory] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, ngoRes, historyRes, foodRes] = await Promise.all([
          api.get(`/admin/stats`),
          api.get(`/ngos/stats`),
          api.get(`/food/my-donations`),
          api.get(`/food`),
        ]);
        const s = statsRes.data;
        setStats({
          mealsReceived: ngoRes.data?.mealsSaved || s?.impact?.mealsSaved || 0,
          activeRequests: s?.listings?.available || 0,
          beneficiaries: (s?.users?.total || 0) * 10,
          partnerDonors: s?.users?.donors || 0,
        });

        // Pre-populate history from dedicated endpoint
        const historyFood = (historyRes.data || [])
          .map(d => ({
            id: d._id,
            food: d.title,
            qty: d.quantity?.value || 0,
            date: new Date(d.createdAt).toISOString().split('T')[0],
            status: d.status,
            donorAddress: d.location?.address || 'Local Donor',
            ngo: user?.org || 'Your NGO',
            otp: 'N/A', // NGOs don't need OTP
          }));
        setHistory(historyFood);

        // Pre-populate available food
        const availableFood = (foodRes.data || [])
          .filter(d => d.status === 'available')
          .map(d => ({
            id: d._id,
            food: d.title,
            image: d.category === 'cooked' ? '🍛' : d.category === 'bakery' ? '🥖' : '🍱',
            qty: d.quantity?.value || 0,
            distance: d.distance ? `${d.distance.toFixed(1)} km` : '2.4 km',
            donor: d.location?.address || 'Local Donor',
            corporate: false,
            urgency: d.urgency || 'medium',
            eta: '25 mins'
          }));
        setMatches(availableFood);
        setSearched(true);
      } catch { /* silent */ }
    };
    fetchStats();
  }, []);


  const handleMatch = async () => {
    if (!mealsRequired) { toast.error('Please enter meals required'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/ngos/match-demand`, {
        mealsRequired: Number(mealsRequired),
        foodPreference: foodPref,
        urgency,
      });
      const newMatches = res.data.matches || [];
      setMatches(newMatches);
      setSearched(true);
      toast.success(`🎯 Found ${newMatches.length} matching donations nearby!`);
      if (res.data.prioritizationNote) toast.info(res.data.prioritizationNote, { duration: 5000 });
    } catch {
      toast.error('Failed to fetch matches. Please try again.');
    }
    setLoading(false);
  };


  const handleAccept = async (match) => {
    try {
      // In a real flow, matching should return actual DB _ids.
      // Assuming match.id corresponds to an actual MongoDB _id here.
      // Temporarily we just filter it locally if it's a mock ID.
      if (match.id.length > 10) {
        await api.put(`/food/${match.id}`, { status: 'claimed' });
      }
      setAccepted(prev => Array.from(new Set([...prev, match.id])));
      setMatches(prev => prev.filter(m => m.id !== match.id));
      toast.success(`✅ ${match.food} accepted! Rider will be assigned.`);
    } catch (err) {
      toast.error('Failed to accept donation');
    }
  };

  const urgencyVal = urgency;
  const isUrgent = urgencyVal >= 8;

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.avatar} {user?.org || 'NGO Dashboard'}</h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>NGO Partner · Find matching food donations</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Meals Received', value: stats.mealsReceived.toLocaleString(), icon: '🍽️', color: '#63b3ed' },
            { label: 'Active Listings', value: stats.activeRequests.toString(), icon: '📋', color: '#f97316' },
            { label: 'Est. Beneficiaries', value: stats.beneficiaries.toLocaleString(), icon: '👨‍👩‍👧', color: '#22c55e' },
            { label: 'Partner Donors', value: stats.partnerDonors.toString(), icon: '🤝', color: '#68d391' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={`${isDark ? 'glass-card' : 'clay-card'} p-5 text-center`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {['find', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : isDark ? 'text-white/50' : 'text-gray-500'}`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
              {tab === 'find' ? '🔍 Find Matches' : '🍱 History'}
            </button>
          ))}
        </div>

        {activeTab === 'find' && (
          <div className="grid md:grid-cols-5 gap-6">
            {/* Request Form */}
            <div className={`md:col-span-2 ${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h2 className={`text-base font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔍 Find Donations</h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Meals Required *</label>
                  <input type="number" value={mealsRequired} onChange={e => setMealsRequired(e.target.value)}
                    placeholder="e.g. 100"
                    className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/40`} />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Food Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {FOOD_PREFS.map(p => (
                      <button key={p} onClick={() => setFoodPref(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${foodPref === p ? 'text-white' : isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}
                        style={foodPref === p ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`flex items-center justify-between text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    <span>Urgency Level</span>
                    <span className={`font-bold ${isUrgent ? 'text-[#ef4444]' : 'text-[#63b3ed]'}`}>{urgency}/10 {isUrgent ? '🚨' : ''}</span>
                  </label>
                  <input type="range" min="1" max="10" value={urgency} onChange={e => setUrgency(Number(e.target.value))}
                    className="w-full accent-[#63b3ed]" />
                  {isUrgent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-2 text-xs font-semibold text-[#f97316] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Critical urgency — will be prioritized
                    </motion.div>
                  )}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleMatch} disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2"
                  style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      AI Matching...
                    </>
                  ) : (
                    <><Zap className="w-4 h-4" /> Find Matches</>
                  )}
                </motion.button>
              </div>

              {/* Recently accepted */}
              {accepted.length > 0 && (
                <div className="mt-5 pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }}>
                  <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Accepted Today</p>
                  {accepted.map((id, idx) => (
                    <div key={`${id}-${idx}`} className="flex items-center gap-2 text-xs text-green-500 mb-1">
                      <CheckCircle className="w-3 h-3" />
                      Donation #{id.substring(Math.max(0, id.length - 6))} accepted
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matches */}
            <div className="md:col-span-3">
              <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Matching Donations {searched && <span className={`text-xs font-normal ml-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{matches.length} available</span>}
                </h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {matches.map((match, i) => (
                      <motion.div key={match.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ delay: i * 0.06 }}
                        className={`p-4 rounded-2xl border ${match.urgency === 'high' ? 'flash-critical border-2' : ''
                          } ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{match.image}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{match.food}</span>
                              {match.corporate && (
                                <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: '#63b3ed' }}>Corporate</span>
                              )}
                              {match.urgency === 'high' && (
                                <span className="urgency-badge">URGENT</span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{match.donor} · {match.distance} away · ETA {match.eta}</p>
                            <p className={`text-xs mt-0.5 font-semibold ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{match.qty} servings available</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => handleAccept(match)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #22c55e, #68d391)' }}>
                            Accept
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {matches.length === 0 && (
                    <div className={`text-center py-10 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                      <p className="font-semibold">All donations accepted!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6 rounded-3xl max-w-4xl mx-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🍱 NGO Donation History</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                {history.length} records
              </span>
            </div>
            <div className="space-y-3">
              {history.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedTicket(t)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: isDark ? 'rgba(99,179,237,0.15)' : '#e8f4fd' }}>📦</div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.food}</div>
                      </div>
                      <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{t.id} · {t.date} · {t.donorAddress}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.qty} servings</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {t.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <HistoryDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        isDark={isDark}
      />
    </div>
  );
}
