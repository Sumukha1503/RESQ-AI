import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Bike, Star, Award, Zap, Check, X, MapPin, Clock, Package, Trophy, ChevronRight } from 'lucide-react';
import api from '../services/api';
import HistoryDetailsModal from '../components/HistoryDetailsModal';

const mapCenter = [12.9716, 77.5946];


// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const bikeIcon = L.divIcon({
    className: 'bike-map-icon',
    html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));animation:none">🛵</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const donorIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#63b3ed;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(99,179,237,0.6)"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
const ngoIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(34,197,94,0.6)"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });


// GPS simulation - Bengaluru coords
const INITIAL_ROUTE_POINTS = [
    [12.9716, 77.5946],
    [12.972, 77.598],
    [12.973, 77.601],
    [12.9745, 77.603],
    [12.976, 77.605],
    [12.978, 77.607],
    [12.98, 77.609],
];

function getCategoryEmoji(category) {
    const map = { cooked: '🍛', bakery: '🥐', dairy: '🥛', raw: '🥦', packaged: '📦', other: '🍱' };
    return map[category] || '🍱';
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
}


function SwipeCard({ item, onAccept, onSkip }) {
    const { isDark } = useTheme();
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 150], [-20, 20]);
    const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
    const acceptOpacity = useTransform(x, [0, 100], [0, 1]);
    const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

    return (
        <motion.div style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            onDragEnd={(e, info) => {
                if (info.offset.x > 100) onAccept(item);
                else if (info.offset.x < -100) onSkip(item);
            }}
            className={`swipe-card absolute inset-0 w-full ${isDark ? 'glass-card' : 'clay-card'} p-6 cursor-grab`}>

            {/* Accept/Skip overlays */}
            <motion.div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-sm font-bold text-white rotate-[-15deg] z-10"
                style={{ opacity: acceptOpacity, background: '#22c55e', border: '3px solid #22c55e' }}>
                ✓ ACCEPT
            </motion.div>
            <motion.div
                style={{ opacity: skipOpacity, background: '#ef4444', border: '3px solid #ef4444' }}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold text-white rotate-[15deg] z-10">
                ✕ SKIP
            </motion.div>

            <div className="text-center mb-4">
                <div className="text-6xl mb-3">{item.image}</div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.food}</h3>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.restaurant}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.meals}</div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Meals</div>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.distance}</div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Away</div>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className={`text-lg font-bold ${urgencyColor(item.urgency)}`} style={{ color: urgencyColor(item.urgency) }}>
                        {item.urgency.toUpperCase()}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Urgency</div>
                </div>
            </div>

            {item.corporate && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #63b3ed, #4a9fd4)' }}>
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Corporate Donation — +40 Karma
                </div>
            )}

            <p className={`text-xs text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                👈 Swipe left to skip · Swipe right to accept 👉
            </p>
        </motion.div>
    );
}

function urgencyColor(u) {
    return u === 'high' ? '#ef4444' : u === 'medium' ? '#f97316' : '#22c55e';
}

export function RiderDashboard() {
    const { isDark } = useTheme();
    const { user } = useRole();
    const [feed, setFeed] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('feed');
    const [accepted, setAccepted] = useState(null);
    const [dynamicRoute, setDynamicRoute] = useState(INITIAL_ROUTE_POINTS);
    const [bikePos, setBikePos] = useState(0);
    const [deliveryStatus, setDeliveryStatus] = useState('waiting'); // waiting, arrived, transit, delivered
    const [karma, setKarma] = useState(user?.karma || 0);
    const [riderStats, setRiderStats] = useState({ rescues: 0, meals: 0 });
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [deliveryReady, setDeliveryReady] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [foodRes, statsRes, usersRes, myRes] = await Promise.all([
                    api.get(`/food`),
                    api.get(`/admin/stats`),
                    api.get(`/admin/users`),
                    api.get(`/food/my-donations`),
                ]);
                // Map real food listings from my-donations to rider history
                const historyFeed = (myRes.data || []).map(d => ({
                    id: d._id,
                    food: d.title,
                    qty: d.quantity?.value || 0,
                    date: new Date(d.createdAt).toISOString().split('T')[0],
                    status: d.status === 'completed' ? 'delivered' : d.status,
                    donorAddress: d.location?.address || 'Local Donor',
                    ngo: 'NGO Partner',
                    otp: d.otp || 'N/A'
                }));
                setHistory(historyFeed);

                const liveFeed = (foodRes.data || []).filter(d => d.status === 'claimed' && !d.assignedToRider).map(d => ({
                    id: d._id,
                    food: d.title,
                    image: getCategoryEmoji(d.category),
                    meals: d.quantity?.value || 0,
                    distance: d.distance ? `${d.distance.toFixed(1)} km` : 'N/A',
                    urgency: d.urgency || 'medium',
                    corporate: false,
                    restaurant: d.location?.address || 'Local Donor',
                    time: timeAgo(d.createdAt),
                    qty: `${d.quantity?.value || 0} ${d.quantity?.unit || 'servings'}`,
                    latitude: d.location?.latitude,
                    longitude: d.location?.longitude,
                }));
                setFeed(liveFeed);

                // Build leaderboard from real users
                const riders = (usersRes.data || []).filter(u => u.role === 'volunteer' || u.role === 'rider');
                setLeaderboard(riders.slice(0, 5).map((u, i) => ({
                    rank: i + 1,
                    name: u.name,
                    rescues: Math.floor((u.karma || 0) / 50),
                    karma: u.karma || 0,
                    badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐',
                })));

                // Consolidated Session Restoration
                const activeTask = (myRes.data || []).find(d => d.status === 'accepted' || d.status === 'transit');
                const alreadyAcceptedByState = accepted;

                if (activeTask && !alreadyAcceptedByState) {
                    const mapped = {
                        id: activeTask._id,
                        food: activeTask.title,
                        image: getCategoryEmoji(activeTask.category),
                        meals: activeTask.quantity?.value || 0,
                        distance: activeTask.distance ? `${activeTask.distance.toFixed(1)} km` : 'N/A',
                        urgency: activeTask.urgency || 'medium',
                        corporate: false,
                        restaurant: activeTask.location?.address || 'Local Donor',
                        time: timeAgo(activeTask.createdAt),
                        latitude: activeTask.location?.latitude,
                        longitude: activeTask.location?.longitude
                    };
                    setAccepted(mapped);
                    setDeliveryStatus(activeTask.status === 'accepted' ? 'arrived' : 'transit');
                    if (activeTask.status === 'transit') setDeliveryReady(true);
                    setActiveTab('tracking');
                    toast.info("Resuming active delivery...", { icon: '🛵' });

                    try {
                        const routeRes = await api.get(`/food/${activeTask._id}/route`);
                        if (routeRes.data.waypoints) {
                            setDynamicRoute(routeRes.data.waypoints);
                        }
                    } catch (e) { /* silent */ }
                }

                const s = statsRes.data;
                setRiderStats({
                    rescues: s?.listings?.completed || 0,
                    meals: s?.impact?.mealsSaved || 0,
                });
                setKarma(user?.karma || 0);
            } catch { /* silent */ }
        };
        fetchData();
    }, []);


    // GPS simulation
    useEffect(() => {
        if (accepted && deliveryStatus === 'transit') {
            const t = setInterval(() => {
                setBikePos(p => {
                    if (p >= dynamicRoute.length - 1) {
                        clearInterval(t);
                        return dynamicRoute.length - 1;
                    }
                    return p + 1;
                });
            }, 3000);
            return () => clearInterval(t);
        }
    }, [accepted, deliveryStatus]);

    const handleAccept = async (item) => {
        try {
            await api.put(`/food/${item.id}`, { status: 'accepted' });
            setAccepted(item);
            setDeliveryStatus('arrived');
            setBikePos(0);
            setFeed(f => f.filter(c => c.id !== item.id));
            setActiveTab('tracking');
            toast.success("Assignment Confirmed!", { description: `Heading to ${item.restaurant}...` });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept donation");
            return;
        }

        try {
            const res = await api.get(`/food/${item.id}/route`);
            if (res.data.waypoints && res.data.waypoints.length > 0) {
                setDynamicRoute(res.data.waypoints);
            }
        } catch (err) {
            console.error("Failed to fetch road-aware route", err);
        }
    };

    const verifyPickupOtp = async () => {
        if (!accepted || otp.length < 6) { return toast.error("Enter a 6-digit OTP"); }
        setOtpLoading(true);
        try {
            await api.post(`/food/${accepted.id}/verify-otp`, { otp });
            toast.success("✅ Pick-up verified securely!");
            setDeliveryStatus('transit');
            setTimeout(() => setDeliveryReady(true), 5000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        }
    };

    const handleMarkDelivered = async () => {
        if (!accepted) return;
        setOtpLoading(true);
        try {
            await api.put(`/food/${accepted.id}`, { status: 'completed' });
            setDeliveryStatus('delivered');
            toast.success('🎉 Delivery complete! +50 Karma awarded!');
            setKarma(k => k + 50);

            // Move current to history
            setHistory(prev => [{
                id: accepted.id,
                food: accepted.food,
                qty: accepted.qty || 'N/A',
                date: new Date().toISOString().split('T')[0],
                status: 'delivered',
                donorAddress: accepted.restaurant || 'Local Donor',
                ngo: 'NGO Partner',
                otp: 'N/A'
            }, ...prev]);

            setAccepted(null);
            setOtp('');
        } catch (err) {
            toast.error("Failed to update status");
        }
        setOtpLoading(false);
    };

    const handleSkip = (item) => {
        setFeed(f => f.filter(c => c.id !== item.id));
        toast('Skipped — next donation incoming', { icon: '👈' });
    };

    const totalBikePos = bikePos < dynamicRoute.length ? dynamicRoute[bikePos] : dynamicRoute[dynamicRoute.length - 1];

    const STATS = [
        { label: 'Karma Points', value: karma, color: '#f97316', icon: '⭐' },
        { label: 'Rescues Done', value: riderStats.rescues, color: '#63b3ed', icon: '🛕' },
        { label: 'Meals Delivered', value: riderStats.meals, color: '#22c55e', icon: '🍱' },
        { label: 'Badge', value: user?.badge || 'Rider', color: '#68d391', icon: '🏆' },
    ];

    return (
        <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.avatar} {user?.name}</h1>
                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Rescue Rider · {user?.badge}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}>
                        <Star className="w-4 h-4 fill-white" />
                        {karma} Karma
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {STATS.map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className={`${isDark ? 'glass-card' : 'clay-card'} p-4 text-center`}>
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-xl font-bold" style={{ color: s.color }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                            <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {['feed', 'tracking', 'history', 'leaderboard'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : isDark ? 'text-white/50' : 'text-gray-500'
                                }`}
                            style={activeTab === tab ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
                            {tab === 'feed' ? '🍱 Rescue Feed' :
                                tab === 'tracking' ? '🗺️ Live Tracking' :
                                    tab === 'history' ? '🍱 History' :
                                        '🏆 Leaderboard'}
                        </button>
                    ))}
                </div>

                {/* Rescue Feed */}
                {activeTab === 'feed' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Swipe area */}
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Swipe to Rescue</h2>
                            {feed.length > 0 ? (
                                <div className="relative h-72">
                                    <AnimatePresence>
                                        {feed.slice(0, 2).map((item, i) => (
                                            <div key={item.id} style={{ zIndex: 10 - i, transform: `scale(${1 - i * 0.03}) translateY(${i * 8}px)`, position: 'absolute', inset: 0 }}>
                                                {i === 0 ? (
                                                    <SwipeCard item={item} onAccept={handleAccept} onSkip={handleSkip} />
                                                ) : (
                                                    <div className={`absolute inset-0 rounded-3xl ${isDark ? 'glass-card' : 'clay-card'}`} />
                                                )}
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className={`h-72 flex flex-col items-center justify-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                    <div className="text-5xl mb-3">🎉</div>
                                    <p className="font-semibold">All done! Great work today.</p>
                                </div>
                            )}
                            {feed.length > 0 && (
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => feed.length && handleSkip(feed[0])}
                                        className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                                        <X className="w-4 h-4" /> Skip
                                    </button>
                                    <button onClick={() => feed.length && handleAccept(feed[0])}
                                        className="flex-1 py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #22c55e, #68d391)' }}>
                                        <Check className="w-4 h-4" /> Accept
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Badges */}
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>🏅 Your Badges</h2>
                            <div className="space-y-3">
                                {[
                                    { icon: '🍱', name: 'Food Hero', desc: '100+ rescues completed', earned: true, color: '#63b3ed' },
                                    { icon: '🏢', name: 'CSR Champion', desc: '50+ corporate pickups', earned: true, color: '#68d391' },
                                    { icon: '🌿', name: 'Climate Warrior', desc: '500kg CO₂ prevented', earned: false, color: '#22c55e', progress: 78 },
                                    { icon: '⚡', name: 'Speed Demon', desc: '25 dispatches under 10min', earned: false, color: '#f97316', progress: 44 },
                                ].map(badge => (
                                    <div key={badge.name} className={`flex items-center gap-3 p-3 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <div className="text-2xl">{badge.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{badge.name}</span>
                                                {badge.earned && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: badge.color }}>Earned</span>}
                                            </div>
                                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{badge.desc}</p>
                                            {!badge.earned && (
                                                <div className={`h-1 rounded-full mt-1.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                    <div className="h-full rounded-full" style={{ width: `${badge.progress}%`, background: badge.color }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Tracking */}
                {activeTab === 'tracking' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className={`${isDark ? 'glass-card' : 'clay-card'} overflow-hidden`} style={{ height: 420 }}>
                                <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url={isDark
                                            ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                                        attribution='&copy; OpenStreetMap'
                                    />
                                    {/* Donor marker */}
                                    <Marker position={dynamicRoute[0]} icon={donorIcon}>
                                        <Popup>📦 Pickup: {accepted?.restaurant || "Donor"}</Popup>
                                    </Marker>
                                    {/* NGO marker */}
                                    <Marker position={dynamicRoute[dynamicRoute.length - 1]} icon={ngoIcon}>
                                        <Popup>🤝 Delivery: Akshara Patra Foundation</Popup>
                                    </Marker>
                                    {/* Bike marker */}
                                    <Marker position={totalBikePos} icon={bikeIcon}>
                                        <Popup>🛵 Arjun V. — Live</Popup>
                                    </Marker>
                                    {/* Route */}
                                    <Polyline positions={dynamicRoute} color="#63b3ed" weight={3} opacity={0.7} dashArray="8 4" />
                                    {/* Completed route */}
                                    {bikePos > 0 && <Polyline positions={dynamicRoute.slice(0, bikePos + 1)} color="#22c55e" weight={3} />}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>📋 Delivery Timeline</h3>
                            {accepted ? (
                                <div className="space-y-3">
                                    {[
                                        { label: 'Order Accepted', done: true, time: 'Assigned to you' },
                                        { label: 'Arrived at Donor', done: deliveryStatus === 'arrived' || deliveryStatus === 'transit' || deliveryStatus === 'delivered', time: deliveryStatus === 'arrived' ? 'Awaiting OTP' : 'Complete' },
                                        { label: 'Food Picked Up', done: deliveryStatus === 'transit' || deliveryStatus === 'delivered', time: deliveryStatus === 'transit' ? 'OTP Verified ✓' : (deliveryStatus === 'arrived' ? '--' : 'Complete') },
                                        { label: 'Delivering to NGO', done: bikePos > 0 && bikePos < dynamicRoute.length - 1, time: bikePos > 0 ? 'In progress' : '--' },
                                        { label: 'Delivered! ✅', done: deliveryStatus === 'delivered', time: deliveryStatus === 'delivered' ? 'Complete' : '--' },
                                    ].map((step, i) => (
                                        <div key={step.label} className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? 'bg-[#22c55e]' : isDark ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                {step.done && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${step.done ? isDark ? 'text-white' : 'text-gray-900' : isDark ? 'text-white/40' : 'text-gray-400'}`}>{step.label}</p>
                                                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{step.time}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* OTP Entry UI when arrived */}
                                    {deliveryStatus === 'arrived' && (
                                        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-[#f97316]/10 border-[#f97316]/30' : 'bg-orange-50 border-orange-200'} `}>
                                            <p className={`text-xs font-bold mb-2 ${isDark ? 'text-[#fbbf24]' : 'text-[#ea580c]'}`}>Pickup Verification</p>
                                            <p className={`text-xs mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Ask the donor for the 6-digit secure PIN.</p>
                                            <div className="flex gap-2">
                                                <input type="text" maxLength={6} placeholder="Enter PIN" value={otp} onChange={e => setOtp(e.target.value)}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm text-center font-mono tracking-widest border ${isDark ? 'bg-black/20 border-white/20 text-white' : 'bg-white border-orange-300'}`} />
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={verifyPickupOtp} disabled={otpLoading}
                                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#f97316] shadow-lg shadow-[#f97316]/30">
                                                    {otpLoading ? '...' : 'Verify'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className={`text-center py-8 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                    <Bike className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">Accept a rescue from the feed to start tracking</p>
                                </div>
                            )}

                            {accepted && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${accepted.latitude},${accepted.longitude}`, '_blank')}
                                        className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mb-3 ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
                                    >
                                        <MapPin className="w-4 h-4" /> Open in Google Maps
                                    </button>
                                </div>
                            )}

                            {/* Status Button */}
                            <div className="mt-4">
                                {deliveryStatus === 'transit' ? (
                                    <>
                                        {!deliveryReady && (
                                            <div className="w-full py-3 rounded-xl text-sm font-bold text-center text-orange-500 bg-orange-50">
                                                En Route...
                                            </div>
                                        )}
                                        {deliveryReady && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleMarkDelivered}
                                                disabled={otpLoading}
                                                className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-500/20"
                                                style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                                                {otpLoading ? 'Updating...' : '🏁 Confirm Delivery'}
                                            </motion.button>
                                        )}
                                    </>
                                ) : (
                                    <div className={`px-4 py-2.5 rounded-xl text-sm font-bold text-center ${deliveryStatus === 'waiting' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                                        deliveryStatus === 'transit' ? 'bg-[#f97316]/10 text-[#f97316]' :
                                            'bg-[#22c55e]/10 text-[#22c55e]'
                                        }`}>
                                        {deliveryStatus === 'waiting' ? '🔴 Waiting for Pickup' :
                                            deliveryStatus === 'transit' ? '🟡 In Transit' : '🟢 Delivered!'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {activeTab === 'leaderboard' && (
                    <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                        <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>🏆 Weekly Leaderboard</h2>
                        <div className="space-y-3">
                            {leaderboard.length > 0 ? leaderboard.map((rider) => (
                                <motion.div key={rider.rank}
                                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: rider.rank * 0.08 }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <div className="text-2xl w-10 text-center">{rider.badge}</div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{rider.name}</div>
                                        <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{rider.rescues} rescues</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm" style={{ color: '#f97316' }}>{rider.karma.toLocaleString()}</div>
                                        <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>karma</div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className={`text-center py-8 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No riders yet — be the first!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {activeTab === 'history' && (
                <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6 rounded-3xl max-w-4xl mx-auto`}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🍱 Delivery History</h2>
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
            <HistoryDetailsModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
                isDark={isDark}
            />
        </div>
    );
}
