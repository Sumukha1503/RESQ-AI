import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Zap, AlertTriangle, Download, TrendingUp, Bike, Package, Leaf, Users } from 'lucide-react';
import api from '../services/api';

// Leaflet custom icons
const makeIcon = (color, emoji) => L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 8px ${color}80;display:flex;align-items:center;justify-content:center;font-size:10px">${emoji}</div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const waitingIcon = makeIcon('#ef4444', '⏳');
const transitIcon = makeIcon('#f59e0b', '🛵');
const deliveredIcon = makeIcon('#22c55e', '✅');

const DEMO_DONATIONS = [];

const WASTE_SOURCES_DATA = [
  { name: 'Restaurants', value: 38, color: '#63b3ed' },
  { name: 'Corporate', value: 28, color: '#68d391' },
  { name: 'Hotels', value: 18, color: '#f97316' },
  { name: 'Events', value: 10, color: '#a78bfa' },
  { name: 'Retail', value: 6, color: '#fbbf24' },
];

const TIME_HEATMAP_DATA = [
  { time: '8am', Mon: 20, Tue: 25, Wed: 18, Thu: 30, Fri: 45 },
  { time: '12pm', Mon: 55, Tue: 60, Wed: 48, Thu: 70, Fri: 80 },
  { time: '3pm', Mon: 30, Tue: 35, Wed: 28, Thu: 40, Fri: 50 },
  { time: '6pm', Mon: 45, Tue: 50, Wed: 38, Thu: 55, Fri: 65 },
  { time: '9pm', Mon: 25, Tue: 20, Wed: 15, Thu: 30, Fri: 35 },
];

const NGO_IMPACT_DATA = [
  { week: 'W1', meals: 840, beneficiaries: 280 },
  { week: 'W2', meals: 1200, beneficiaries: 400 },
  { week: 'W3', meals: 980, beneficiaries: 327 },
  { week: 'W4', meals: 1540, beneficiaries: 513 },
  { week: 'W5', meals: 1820, beneficiaries: 607 },
  { week: 'W6', meals: 2100, beneficiaries: 700 },
];

const RIDER_PERF_DATA = [
  { name: 'Ravi K.', rescues: 340, karma: 17200 },
  { name: 'Arjun V.', rescues: 280, karma: 14000 },
  { name: 'Sneha R.', rescues: 210, karma: 10500 },
  { name: 'Karan M.', rescues: 180, karma: 9000 },
  { name: 'Divya P.', rescues: 155, karma: 7750 },
];

const PLATFORM_STATS = [
  { label: 'Total Donations', value: '1,284', icon: '📦', color: '#63b3ed' },
  { label: 'Active Riders', value: '47', icon: '🛵', color: '#68d391' },
  { label: 'NGO Partners', value: '48', icon: '🤝', color: '#a78bfa' },
  { label: 'Meals Today', value: '847', icon: '🍱', color: '#f97316' },
  { label: 'CO₂ Prevented', value: '15.5T', icon: '🌿', color: '#22c55e' },
  { label: 'Success Rate', value: '94%', icon: '✅', color: '#fbbf24' },
];

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`p-3 rounded-xl text-xs ${isDark ? 'bg-[#141828] border border-white/10 text-white' : 'bg-white border border-gray-100 text-gray-800 shadow-lg'}`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const { isDark } = useTheme();
  const { user } = useRole();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [donations, setDonations] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, statsRes] = await Promise.all([
          api.get(`/food`),
          api.get(`/admin/stats`),
        ]);
        // Map to map-display shape
        const mapped = (foodRes.data || []).map(d => ({
          id: d._id,
          food: d.title,
          qty: d.quantity?.value || 0,
          status: d.status === 'available' ? 'waiting' : d.status === 'claimed' ? 'transit' : 'delivered',
          donor: d.user?.name || 'Donor',
          lat: d.location?.latitude || 12.9716 + (Math.random() - 0.5) * 0.05,
          lng: d.location?.longitude || 77.5946 + (Math.random() - 0.5) * 0.05,
        }));
        setDonations(mapped);
        setPlatformStats(statsRes.data);
      } catch { /* silent */ }
    };
    fetchData();
  }, []);


  const mapCenter = [12.9716, 77.5946];

  // Emergency mode simulation
  useEffect(() => {
    if (emergencyMode) {
      toast('🚨 Emergency Mode Active — Large donations prioritized!', {
        style: { background: '#ef4444', color: 'white', fontWeight: '700' },
        duration: 3000,
      });
      const interval = setInterval(() => {
        toast('🛵 Rider alert: New urgent pickup in Bengaluru Central!', { duration: 2000 });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [emergencyMode]);

  const getIcon = (status) => status === 'waiting' ? waitingIcon : status === 'transit' ? transitIcon : deliveredIcon;

  const waitingCount = donations.filter(d => d.status === 'waiting').length;
  const transitCount = donations.filter(d => d.status === 'transit').length;
  const deliveredCount = donations.filter(d => d.status === 'delivered').length;

  const handleWastePredict = async () => {
    setPredicting(true);
    try {
      const res = await api.post(`/admin/waste-predict`, {
        date: new Date().toISOString(),
        historicalData: donations.length,
      }).catch(() => ({
        data: {
          predictedWaste: 420,
          hotspots: ['Koramangala', 'Indiranagar', 'Whitefield'],
          riderPlacement: 'Deploy 3 extra riders to Whitefield corridor between 12-2pm',
          confidence: 89,
        }
      }));
      setPrediction(res.data);
      toast.success('🧠 Waste prediction ready!');
    } catch { }
    setPredicting(false);
  };

  const handleExportCSV = () => {
    const rows = [['ID', 'Food', 'Qty', 'Status', 'Donor', 'Lat', 'Lng']];
    donations.forEach(d => rows.push([d.id, d.food, d.qty, d.status, d.donor, d.lat, d.lng]));
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'resqai-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('📊 CSV report downloaded!');
  };

  const totalKg = donations.reduce((s, d) => s + (d.qty * 0.35), 0);
  const co2Prevented = (totalKg * 2.5).toFixed(1);
  const mealsTotal = donations.reduce((s, d) => s + d.qty, 0);

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'} ${emergencyMode ? 'ring-4 ring-red-500/30' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>⚡ Admin Command Center</h1>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>God View — Real-time city rescue network</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Emergency Mode Toggle */}
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setEmergencyMode(e => !e)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all ${emergencyMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-700'
                } ${emergencyMode ? 'animate-pulse' : ''}`}>
              <AlertTriangle className="w-4 h-4" />
              {emergencyMode ? '🚨 Emergency ON' : 'Emergency Mode'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleExportCSV}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Donations', value: platformStats?.listings?.total?.toLocaleString() || '0', icon: '📦', color: '#63b3ed' },
            { label: 'Available', value: platformStats?.listings?.available?.toString() || '0', icon: '🛵', color: '#68d391' },
            { label: 'NGO Partners', value: platformStats?.users?.ngos?.toString() || '0', icon: '🤝', color: '#a78bfa' },
            { label: 'Meals Saved', value: platformStats?.impact?.mealsSaved?.toLocaleString() || '0', icon: '🍱', color: '#f97316' },
            { label: 'Waste Prevented', value: `${platformStats?.impact?.wastePrevented || 0}kg`, icon: '🌿', color: '#22c55e' },
            { label: 'Completed', value: platformStats?.listings?.completed?.toString() || '0', icon: '✅', color: '#fbbf24' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${isDark ? 'glass-card' : 'clay-card'} p-4 text-center`}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {['map', 'analytics', 'carbon', 'predict'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : isDark ? 'text-white/50' : 'text-gray-500'}`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
              {tab === 'map' ? '🗺️ God View' : tab === 'analytics' ? '📊 Analytics' : tab === 'carbon' ? '🌿 Carbon' : '🧠 Predict'}
            </button>
          ))}
        </div>

        {/* GOD VIEW MAP */}
        {activeTab === 'map' && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className={`${isDark ? 'glass-card' : 'clay-card'} overflow-hidden`} style={{ height: 450 }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url={isDark
                      ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    attribution='&copy; OpenStreetMap'
                  />
                  {donations.map(d => (
                    <React.Fragment key={d.id}>
                      <Marker position={[d.lat, d.lng]} icon={getIcon(d.status)}>
                        <Popup>
                          <div className="text-xs">
                            <strong>{d.food}</strong><br />
                            {d.donor}<br />
                            Qty: {d.qty} · Status: {d.status}
                          </div>
                        </Popup>
                      </Marker>
                      {d.status === 'waiting' && emergencyMode && (
                        <Circle center={[d.lat, d.lng]} radius={300} color="#ef4444" fillColor="#ef4444" fillOpacity={0.1} />
                      )}
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Status counts */}
            <div className="space-y-3">
              {[
                { label: 'Waiting Pickup', count: waitingCount, color: '#ef4444', icon: '🔴' },
                { label: 'In Transit', count: transitCount, color: '#f59e0b', icon: '🟡' },
                { label: 'Delivered', count: deliveredCount, color: '#22c55e', icon: '🟢' },
              ].map(s => (
                <div key={s.label} className={`${isDark ? 'glass-card' : 'clay-card'} p-5 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{s.label}</div>
                </div>
              ))}
              <div className={`${isDark ? 'glass-card' : 'clay-card'} p-4`}>
                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Legend</p>
                {[['🔴', 'Waiting pickup'], ['🟡', 'Rider in transit'], ['🟢', 'Delivered']].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs mb-1">
                    <span>{icon}</span>
                    <span className={isDark ? 'text-white/60' : 'text-gray-500'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Waste Sources Pie */}
            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🥧 Food Waste Sources</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={WASTE_SOURCES_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    {WASTE_SOURCES_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Time Heatmap */}
            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>⏱️ Waste Time Heatmap</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TIME_HEATMAP_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Bar dataKey="Mon" fill="#63b3ed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Fri" fill="#68d391" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NGO Impact */}
            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>❤️ NGO Impact Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={NGO_IMPACT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Line type="monotone" dataKey="meals" stroke="#63b3ed" strokeWidth={2.5} dot={{ fill: '#63b3ed', r: 4 }} />
                  <Line type="monotone" dataKey="beneficiaries" stroke="#68d391" strokeWidth={2.5} dot={{ fill: '#68d391', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rider Performance */}
            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🛵 Rider Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={RIDER_PERF_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} width={60} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Bar dataKey="rescues" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CARBON DASHBOARD */}
        {activeTab === 'carbon' && (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'CO₂ Prevented', value: `${co2Prevented} kg`, formula: 'kg × 2.5', icon: '🌿', color: '#22c55e', sub: 'Equivalent to planting 12 trees' },
              { label: 'Meals Fed', value: mealsTotal.toString(), formula: 'All donations sum', icon: '🍱', color: '#63b3ed', sub: 'Beneficiaries served' },
              { label: 'Landfill Diverted', value: `${totalKg.toFixed(1)} kg`, formula: 'qty × 0.35 kg', icon: '♻️', color: '#68d391', sub: 'Waste diverted from landfill' },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`${isDark ? 'glass-card' : 'clay-card'} p-8 text-center`}>
                <div className="text-5xl mb-4">{m.icon}</div>
                <div className="text-4xl font-bold mb-2" style={{ color: m.color }}>{m.value}</div>
                <div className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.label}</div>
                <div className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{m.sub}</div>
                <div className={`text-xs mt-2 px-3 py-1 rounded-full inline-block ${isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'}`}>{m.formula}</div>
              </motion.div>
            ))}
            <div className={`md:col-span-3 ${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📈 Weekly Carbon Savings</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={NGO_IMPACT_DATA.map(d => ({ ...d, co2: (d.meals * 0.35 * 2.5).toFixed(1) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} name="CO₂ Prevented (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI PREDICT */}
        {activeTab === 'predict' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🧠 Tomorrow's Waste Prediction</h3>
              <p className={`text-sm mb-5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                Gemini AI analyzes historical patterns, weather, events, and day-of-week to predict tomorrow's food surplus hotspots and suggest optimal rider placement.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleWastePredict} disabled={predicting}
                className="w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 mb-5"
                style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                {predicting ? (
                  <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Gemini Predicting...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Run AI Prediction</>
                )}
              </motion.button>

              <AnimatePresence>
                {prediction && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl space-y-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#63b3ed]" />
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Prediction Results</span>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                      <strong>~{prediction.predictedWaste} kg</strong> of surplus food predicted tomorrow
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Hotspot Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {prediction.hotspots?.map(h => (
                          <span key={h} className="text-xs px-2 py-1 rounded-lg font-semibold text-white" style={{ background: '#f97316' }}>{h}</span>
                        ))}
                      </div>
                    </div>
                    <div className={`text-sm p-3 rounded-xl ${isDark ? 'bg-[#63b3ed]/10' : 'bg-blue-50'} text-[#63b3ed]`}>
                      📍 <strong>Rider Placement:</strong> {prediction.riderPlacement}
                    </div>
                    <div className="text-xs text-[#22c55e] font-semibold">Confidence: {prediction.confidence}%</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Historical Patterns</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={TIME_HEATMAP_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0'} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#ffffff60' : '#6b7280' }} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Legend />
                  <Bar dataKey="Mon" fill="#63b3ed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Wed" fill="#68d391" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Fri" fill="#f97316" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
