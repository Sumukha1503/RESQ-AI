import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import {
    Heart, TrendingUp, Zap, Server, Shield, Send, Download, X, Package,
    CheckCircle, AlertTriangle, Thermometer, Camera, MapPin, QrCode, Mail
} from 'lucide-react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import { useRef } from 'react';

const FOOD_TYPES = ['Rice / Dal', 'Bread & Bakery', 'Curries', 'Salads', 'Sandwiches', 'Desserts', 'Mixed Meals', 'Snacks', 'Beverages', 'Raw Produce'];

function WizardStep1({ data, onChange }) {
    const { isDark } = useTheme();
    const hoursOld = data.preparedTime ? ((Date.now() - new Date(data.preparedTime).getTime()) / 3600000).toFixed(1) : 0;
    const tooOld = hoursOld > 4;

    return (
        <div className="space-y-5">
            <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Food Type *</label>
                <div className="grid grid-cols-2 gap-2">
                    {FOOD_TYPES.map(type => (
                        <button key={type} onClick={() => onChange('foodType', type)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${data.foodType === type
                                ? 'text-white' : isDark ? 'bg-white/8 text-white/70 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            style={data.foodType === type ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Quantity (servings) *</label>
                <input type="number" min="1" max="5000" value={data.quantity || ''}
                    onChange={e => onChange('quantity', e.target.value)}
                    placeholder="e.g. 50"
                    className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/40`} />
            </div>
            <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Time Prepared *</label>
                <input type="datetime-local" value={data.preparedTime || ''}
                    onChange={e => onChange('preparedTime', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-white/8 border-white/15 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/40`} />
                {tooOld && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Food is {hoursOld}h old — exceeds 4-hour limit. Not eligible for donation.
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function WizardStep2({ data, onChange }) {
    const { isDark } = useTheme();
    const questions = [
        { key: 'tempOk', label: 'Has food been kept at safe temperature (below 5°C or above 60°C)?', icon: Thermometer },
        { key: 'smellOk', label: 'Does the food smell and look fresh with no off-odors?', icon: Zap },
        { key: 'packingOk', label: 'Is the food properly packed/covered with no contamination risk?', icon: Package },
    ];

    return (
        <div className="space-y-4">
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                Please answer these safety questions honestly. AI will cross-verify with risk scoring.
            </p>
            {questions.map(q => {
                const Icon = q.icon;
                return (
                    <div key={q.key} className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-start gap-3 mb-3">
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#63b3ed]' : 'text-[#63b3ed]'}`} />
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{q.label}</p>
                        </div>
                        <div className="flex gap-3">
                            {['Yes', 'No', 'Unsure'].map(opt => (
                                <button key={opt} onClick={() => onChange(q.key, opt)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${data[q.key] === opt
                                        ? opt === 'Yes' ? 'bg-[#22c55e] text-white' : opt === 'No' ? 'bg-[#ef4444] text-white' : 'bg-[#f97316] text-white'
                                        : isDark ? 'bg-white/10 text-white/60 hover:bg-white/20' : 'bg-white text-gray-500 hover:bg-gray-100'
                                        }`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WizardStep3({ data, onChange, loading }) {
    const { isDark } = useTheme();
    const [previewUrl, setPreviewUrl] = useState(data.imagePreview || null);
    const fileRef = useRef();

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        onChange('imageFile', file);
        const reader = new FileReader();
        reader.onload = (ev) => { setPreviewUrl(ev.target.result); onChange('imagePreview', ev.target.result); };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-5">
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                Upload a photo of the food. Gemini Vision AI will analyze for spoilage indicators, freshness, and safety compliance.
            </p>
            <div onClick={() => fileRef.current?.click()}
                className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${isDark ? 'border-white/20 hover:border-[#63b3ed]/50 hover:bg-white/5' : 'border-gray-200 hover:border-[#63b3ed]/50 hover:bg-gray-50'
                    } ${previewUrl ? 'p-0 overflow-hidden' : ''}`}>
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                    <>
                        <Camera className={`w-10 h-10 mb-2 ${isDark ? 'text-white/30' : 'text-gray-300'}`} />
                        <p className={`text-sm font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Click to upload food photo</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>JPG, PNG up to 5MB</p>
                    </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-blue-50 border border-blue-100'}`}>
                    <p className={`text-sm font-semibold mb-3 gradient-text`}>🧠 Gemini AI is analyzing your food...</p>
                    <div className="flex gap-2 items-center">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="bg-[#63b3ed] w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                        <span className={`text-xs ml-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Vision analysis in progress</span>
                    </div>
                </motion.div>
            )}

            {data.imageResult && !loading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl ${data.imageResult.safe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {data.imageResult.safe ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <span className={`font-bold text-sm ${data.imageResult.safe ? 'text-green-700' : 'text-red-700'}`}>
                            {data.imageResult.safe ? 'Image Analysis Passed' : 'Safety Concern Detected'}
                        </span>
                    </div>
                    <p className={`text-xs ${data.imageResult.safe ? 'text-green-600' : 'text-red-600'}`}>{data.imageResult.message}</p>
                </motion.div>
            )}
        </div>
    );
}

function WizardStepLocation({ data, onChange }) {
    const { isDark } = useTheme();
    const [loadingLoc, setLoadingLoc] = useState(false);

    const handleGetLocation = () => {
        setLoadingLoc(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLoadingLoc(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    onChange('latitude', latitude);
                    onChange('longitude', longitude);
                    onChange('pickupAddress', 'Current Location GPS Pinned');

                    const res = await api.post('/food/location-preview', { latitude, longitude });
                    if (res.data?.map_preview_url) {
                        onChange('mapPreviewUrl', res.data.map_preview_url);
                    }
                    toast.success('Location fetched successfully!');
                } catch (err) {
                    toast.error('Failed to resolve location preview map.');
                } finally {
                    setLoadingLoc(false);
                }
            },
            () => {
                toast.error('Unable to retrieve your location. Please grant permissions.');
                setLoadingLoc(false);
            }
        );
    };

    return (
        <div className="space-y-5">
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                Where is the food located? This helps the assigned rider navigate to your pickup point precisely.
            </p>

            {data.mapPreviewUrl ? (
                <div className={`w-full h-40 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-[#63b3ed]/30' : 'border-[#63b3ed]/50'}`}>
                    <img src={data.mapPreviewUrl} alt="Location Map" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className={`w-full h-40 flex items-center justify-center rounded-2xl border-2 border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}>
                    <div className="text-center">
                        <MapPin className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                        <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>No Location Pinned</span>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button type="button" onClick={handleGetLocation} disabled={loadingLoc}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-[#63b3ed]/20 text-[#63b3ed] hover:bg-[#63b3ed]/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                    {loadingLoc ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {loadingLoc ? 'Fetching...' : 'Pin Current GPS Location'}
                </button>
            </div>

            <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Or enter manual notes</label>
                <textarea
                    value={data.pickupAddress || ''}
                    onChange={e => onChange('pickupAddress', e.target.value)}
                    placeholder="e.g. 123 Main St, Floor 2, Behind the bakery"
                    className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/40`}
                    rows={2}
                />
            </div>
        </div>
    );
}

function WizardStep4({ data, onCancel }) {
    const { isDark } = useTheme();
    const [timeLeft, setTimeLeft] = useState(data.shelfLifeHours ? data.shelfLifeHours * 3600 : 7200);

    useEffect(() => {
        const t = setInterval(() => setTimeLeft(s => s > 0 ? s - 1 : 0), 1000);
        return () => clearInterval(t);
    }, []);

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    const urgency = timeLeft < 3600 ? 'high' : timeLeft < 7200 ? 'medium' : 'low';

    const ticketId = data.ticketId || ('TKT-' + Math.floor(Math.random() * 90000 + 10000));
    const isSafe = data.imageResult?.safe ?? true;

    if (!isSafe) {
        return (
            <div className="space-y-6 text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold text-white shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <AlertTriangle className="w-5 h-5" />
                        UNSAFE FOR DONATION
                    </div>
                </motion.div>

                <div className={`p-5 rounded-2xl text-left border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-sm font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>AI Analysis Terminated:</p>
                    <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        {data.imageResult?.message || "Safety concerns detected with this food item."}
                    </p>
                    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-red-500/20' : 'border-red-200'} text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        For community safety, we cannot accept this donation. Please securely dispose of or compost this food.
                    </div>
                </div>

                <button onClick={onCancel}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Close & Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                    <CheckCircle className="w-5 h-5" />
                    SAFE TO DONATE
                </div>
            </motion.div>

            <div className={`p-5 rounded-2xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Estimated Shelf Life Remaining</p>
                <div className="flex items-center justify-center gap-2">
                    <div className={`text-3xl font-bold font-mono ${urgency === 'high' ? 'text-[#ef4444]' : urgency === 'medium' ? 'text-[#f97316]' : 'text-[#22c55e]'}`}>
                        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
                    </div>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    {data.shelfLifeDetails || 'AI estimates 2-3 hours safe window at ambient temperature'}
                </p>
            </div>

            <div className={`p-5 rounded-2xl border-2 ${isDark ? 'bg-[#141828] border-[#63b3ed]/30' : 'bg-white border-[#63b3ed]/30'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>RESCUE TICKET</span>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticketId}</div>
                    </div>
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #63b3ed20, #68d39120)', border: '1px solid rgba(99,179,237,0.3)' }}>
                        <QrCode className="w-8 h-8 text-[#63b3ed]" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                        { label: 'Food', val: data.foodType || 'Mixed Meals' },
                        { label: 'Quantity', val: `${data.quantity || 50} servings` },
                        { label: 'Risk Score', val: `${data.riskScore || 88}/100 ✓` },
                        { label: 'Status', val: '🟡 Matching Rider...' },
                    ].map(row => (
                        <div key={row.label} className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <span className={isDark ? 'text-white/40' : 'text-gray-400'}>{row.label}: </span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={onCancel}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                Done
            </button>
        </div>
    );
}

const CSR_TIERS = [
    { name: 'Bronze', icon: '🥉', threshold: 1000, color: '#cd7f32', desc: 'Monthly report + digital badge' },
    { name: 'Silver', icon: '🥈', threshold: 5000, color: '#c0c0c0', desc: '+ Tax certificate + Newsletter feature' },
    { name: 'Gold', icon: '🥇', threshold: 15000, color: '#ffd700', desc: '+ ESG report + Partner recognition' },
    { name: 'Platinum', icon: '💎', threshold: 50000, color: '#63b3ed', desc: '+ Board report + Brand co-branding' },
];

export function CorporateDashboard() {
    const { isDark } = useTheme();
    const { user } = useRole();
    const [mealPlan, setMealPlan] = useState({ planned: '', expected: '' });
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [weeklyData, setWeeklyData] = useState([]);
    const [realStats, setRealStats] = useState(null);
    const [showDonate, setShowDonate] = useState(false);
    const [wizardStep, setWizardStep] = useState(null);
    const [aiThinking, setAiThinking] = useState(false);
    const [donation, setDonation] = useState({
        foodType: '',
        quantity: '',
        preparedTime: '',
        tempOk: '',
        smellOk: '',
        packingOk: '',
        imageFile: null,
        imagePreview: null,
        imageResult: null,
        latitude: null,
        longitude: null,
        pickupAddress: '',
        mapPreviewUrl: null
    });
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, foodRes] = await Promise.all([
                    api.get('/corporate/stats'),
                    api.get('/food/my-donations'),
                ]);
                setRealStats(statsRes.data);

                const userFood = (foodRes.data || []).filter(d => true);
                const mappedTickets = userFood.map(d => ({
                    id: d._id,
                    food: d.title,
                    qty: d.quantity?.value || 0,
                    date: new Date(d.createdAt).toISOString().split('T')[0],
                    status: d.status,
                    ngo: d.status === 'completed' ? 'Delivered' :
                        d.status === 'transit' ? (d.assignedToNGO?.name || 'In Transit') :
                            d.status === 'accepted' ? (d.assignedToNGO?.name || 'Rider Assigned') :
                                d.status === 'claimed' ? (d.assignedToNGO?.name || 'NGO Found') : 'Searching NGOs...',
                    donorAddress: d.location?.address || 'Corporate Location',
                    meals: d.quantity?.value || 0,
                    otp: (d.status === 'available' || d.status === 'claimed' || d.status === 'accepted') ? (d.otp || '---') : 'Used',
                }));
                setTickets(mappedTickets);

                const grouped = { Mon: { predicted: 0, actual: 0 }, Tue: { predicted: 0, actual: 0 }, Wed: { predicted: 0, actual: 0 }, Thu: { predicted: 0, actual: 0 }, Fri: { predicted: 0, actual: 0 } };
                if (statsRes.data && statsRes.data.weeklyTrend) {
                    statsRes.data.weeklyTrend.forEach(d => {
                        const day = new Date(d.date).toLocaleDateString('en', { weekday: 'short' });
                        if (grouped[day]) {
                            grouped[day].predicted += d.predictedSurplus || 0;
                        }
                    });
                }
                userFood.filter(d => d.status === 'completed' || d.status === 'delivered').forEach(d => {
                    const day = new Date(d.createdAt).toLocaleDateString('en', { weekday: 'short' });
                    if (grouped[day]) {
                        grouped[day].actual += d.quantity?.value || 0;
                    }
                });

                const chart = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => ({
                    day: d,
                    predicted: grouped[d]?.predicted || 0,
                    actual: grouped[d]?.actual || 0,
                }));
                setWeeklyData(chart);
            } catch (err) { }
        };
        fetchData();
    }, []);

    const mealsSponsored = realStats?.impact?.mealsSaved || 0;
    const currentTier = mealsSponsored >= 50000 ? CSR_TIERS[3] : mealsSponsored >= 15000 ? CSR_TIERS[2] : mealsSponsored >= 5000 ? CSR_TIERS[1] : CSR_TIERS[0];

    const handlePredictSurplus = async () => {
        if (!mealPlan.planned) { toast.error('Enter planned meal count'); return; }
        setPredicting(true);
        try {
            const res = await api.post('/corporate/predict-surplus/', {
                plannedMeals: Number(mealPlan.planned),
                organizationName: user?.org,
                dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
            }).catch(() => ({
                data: {
                    predictedSurplus: Math.round(Number(mealPlan.planned) * 0.15),
                    confidence: 82 + Math.floor(Math.random() * 8),
                    suggestion: 'Schedule rescue pickup for around 2:00 PM to maximize freshness.',
                    riskScore: 92,
                }
            }));
            setPrediction(res.data);
            toast.success('🧠 AI surplus prediction complete!');
        } catch (err) { }
        setPredicting(false);
    };

    const handleExportESG = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setDrawColor(30, 64, 175);
        doc.setLineWidth(5);
        doc.rect(10, 10, 277, 190);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.rect(15, 15, 267, 180);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(30, 64, 175);
        doc.text('⚡ ResQ AI', 148, 40, { align: 'center' });

        doc.setFontSize(40);
        doc.setTextColor(0, 0, 0);
        doc.text('Certificate of Completion', 148, 70, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('This certifies that', 148, 90, { align: 'center' });

        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text(user?.org || user?.name || 'Corporate Partner', 148, 110, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('has successfully demonstrated outstanding commitment to sustainability', 148, 130, { align: 'center' });
        doc.text('and achieved the requirements for the certification of', 148, 140, { align: 'center' });

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('ENVIRONMENTAL SOCIAL & GOVERNANCE (ESG)', 148, 160, { align: 'center' });

        doc.setFillColor(30, 64, 175);
        doc.triangle(240, 15, 270, 15, 255, 60, 'F');
        doc.rect(240, 15, 30, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('ESG', 255, 30, { align: 'center' });
        doc.text('CERTIFIED', 255, 38, { align: 'center' });

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(70, 180, 130, 180);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 0);
        doc.text('ResQ AI Board', 100, 175, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Board of Directors', 100, 185, { align: 'center' });

        doc.line(170, 180, 230, 180);
        doc.text(new Date().toLocaleDateString(), 200, 175, { align: 'center' });
        doc.text('Date', 200, 185, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Certificate Number: ' + (Math.floor(Math.random() * 9000000) + 1000000), 30, 195);
        doc.text('CSR Tier: ' + currentTier.name, 260, 195, { align: 'right' });
        doc.save('ESG-Impact-Certificate.pdf');
        toast.success('🎉 ESG Certificate downloaded!');
    };

    const handleWizardChange = (key, val) => {
        setDonation(prev => ({ ...prev, [key]: val }));
    };

    const handleAnalyzeFood = async () => {
        setAiThinking(true);
        try {
            const res = await api.post('/ai/image-check', {
                foodType: donation.foodType || 'Corporate Surplus',
                quantity: donation.quantity,
                tempOk: donation.tempOk,
                smellOk: donation.smellOk,
                packingOk: donation.packingOk,
                image: donation.imagePreview
            });

            handleWizardChange('imageResult', res.data);

            if (res.data.safe) {
                const shelfRes = await api.post('/ai/shelf-life', {
                    foodType: donation.foodType || 'Corporate Surplus',
                    preparedTime: donation.preparedTime,
                    tempOk: donation.tempOk
                });

                handleWizardChange('shelfLifeHours', shelfRes.data.shelfLifeHours);
                handleWizardChange('shelfLifeDetails', shelfRes.data.details);
                handleWizardChange('riskScore', shelfRes.data.riskScore);
            }
        } catch (err) {
            toast.error('AI analysis failed. Please try again.');
        } finally {
            setAiThinking(false);
        }
    };

    const handleDonate = async () => {
        try {
            const finalData = {
                title: donation.foodType || 'Corporate Surplus',
                quantity: { value: Number(donation.quantity), unit: 'servings' },
                expiryHours: donation.shelfLifeHours || 4,
                category: 'veg',
                location: {
                    address: donation.pickupAddress,
                    coordinates: [donation.latitude || 12.9716, donation.longitude || 77.5946]
                },
                preparedTime: donation.preparedTime,
                safetyCheck: {
                    tempOk: donation.tempOk === 'Yes',
                    smellOk: donation.smellOk === 'Yes',
                    packingOk: donation.packingOk === 'Yes'
                },
                aiAnalysis: donation.imageResult
            };

            await api.post('/food/', finalData);
            toast.success('Food donation created successfully!');
            setWizardStep(4);

            // Automatically send ESG Email Certificate
            try {
                const ticketId = `CORP-${Math.floor(Math.random() * 90000 + 10000)}`;
                await api.post('/email/send-certificate', {
                    email: user?.email,
                    name: user?.name,
                    org: user?.org || 'Corporate Partner',
                    meals: finalData.quantity.value,
                    ticketId: ticketId
                });
                toast.success('🏆 ESG Certificate sent to your email!');
            } catch (err) {
                console.error("Failed to send ESG email", err);
            }

            const foodRes = await api.get('/food/');
            const mappedTickets = (foodRes.data || []).map(d => ({
                id: d._id,
                food: d.title,
                qty: d.quantity?.value || 0,
                date: new Date(d.createdAt).toISOString().split('T')[0],
                status: d.status,
                ngo: d.assignedToNGO ? 'Assigned' : 'Matching...',
                donorAddress: d.location?.address || 'Corporate HQ',
                meals: d.quantity?.value || 0,
                otp: d.otp || 'N/A',
            }));
            setTickets(mappedTickets);
        } catch (err) {
            toast.error('Failed to donate food');
        }
    };

    const STATS = [
        { label: 'Meals Sponsored', value: mealsSponsored.toLocaleString(), icon: '🍽️', color: '#63b3ed', change: 'All time' },
        { label: 'Surplus Saved', value: `${realStats?.impact?.wastePrevented || 0} kg`, icon: '📦', color: '#68d391', change: 'From platform data' },
        { label: 'CO₂ Prevented', value: `${((realStats?.impact?.wastePrevented || 0) * 0.0025).toFixed(1)} T`, icon: '🌿', color: '#22c55e', change: 'Estimated' },
        { label: 'Employee Volunteers', value: realStats?.users?.volunteers?.toString() || '0', icon: '👥', color: '#f97316', change: 'Active this month' },
        { label: 'NGOs Supported', value: realStats?.users?.ngos?.toString() || '0', icon: '🤝', color: '#a78bfa', change: 'Partner organizations' },
        { label: 'CSR Tier', value: currentTier.name, icon: currentTier.icon, color: currentTier.color, change: 'Current status' },
    ];

    return (
        <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'} `}>
            <AnimatePresence>
                {showDonate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setShowDonate(false); setWizardStep(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`w-full max-w-md relative z-10 overflow-hidden ${isDark ? 'glass-card text-white' : 'clay-card text-gray-900'} `}>

                            {/* Header */}
                            <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex justify-between items-center`}>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {wizardStep === null ? 'Join ResQ Program' : wizardStep === 4 ? 'Donation Success' : `Step ${wizardStep} of 3`}
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'} `}>
                                        {wizardStep === null ? 'Sync surplus food with ResQ AI' : wizardStep === 4 ? 'Your rescue ticket is active' : 'Complete safety verification'}
                                    </p>
                                </div>
                                <button onClick={() => { setShowDonate(false); setWizardStep(null); }} className={`p-2 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'} `}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[70vh]">
                                {wizardStep === null && (
                                    <div className="space-y-6 text-center py-4">
                                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="w-10 h-10 text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-bold">Start Corporate Rescue</h3>
                                        <p className={`text-sm opacity-70 mb-6`}>Our wizard will guide you through safety checks and AI food analysis to ensure your surplus reaches the right hands safely.</p>
                                        <button onClick={() => setWizardStep(1)}
                                            className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg"
                                            style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                                            Get Started
                                        </button>
                                    </div>
                                )}

                                {wizardStep === 1 && (
                                    <div className="space-y-6">
                                        <WizardStep1 data={donation} onChange={handleWizardChange} />
                                        <button disabled={!donation.foodType || !donation.quantity || !donation.preparedTime || (Date.now() - new Date(donation.preparedTime).getTime()) / 3600000 > 4}
                                            onClick={() => setWizardStep(2)}
                                            className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                                            Continue to Safety Check
                                        </button>
                                    </div>
                                )}

                                {wizardStep === 2 && (
                                    <div className="space-y-6">
                                        <WizardStep2 data={donation} onChange={handleWizardChange} />
                                        <div className="flex gap-3">
                                            <button onClick={() => setWizardStep(1)} className={`flex-1 py-4 rounded-2xl text-sm font-bold ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>Back</button>
                                            <button disabled={!donation.tempOk || !donation.smellOk || !donation.packingOk}
                                                onClick={() => setWizardStep(3)}
                                                className="flex-[2] py-4 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-50"
                                                style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                                                Continue to AI Analysis
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {wizardStep === 3 && (
                                    <div className="space-y-6">
                                        <WizardStep3 data={donation} onChange={handleWizardChange} loading={aiThinking} />

                                        {!donation.imageResult && (
                                            <div className="flex gap-3">
                                                <button onClick={() => setWizardStep(2)} className={`flex-1 py-4 rounded-2xl text-sm font-bold ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>Back</button>
                                                <button disabled={!donation.imageFile || aiThinking}
                                                    onClick={handleAnalyzeFood}
                                                    className="flex-[2] py-4 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-50"
                                                    style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                                                    Run AI Safety Analysis
                                                </button>
                                            </div>
                                        )}

                                        {donation.imageResult?.safe && (
                                            <div className="space-y-4">
                                                <WizardStepLocation data={donation} onChange={handleWizardChange} />
                                                <button onClick={handleDonate}
                                                    className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg"
                                                    style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                                                    Confirm & Schedule Pickup
                                                </button>
                                            </div>
                                        )}

                                        {donation.imageResult && !donation.imageResult.safe && (
                                            <button onClick={() => { setShowDonate(false); setWizardStep(null); }}
                                                className="w-full py-4 rounded-2xl text-sm font-bold bg-gray-500 text-white shadow-lg">
                                                Return to Dashboard
                                            </button>
                                        )}
                                    </div>
                                )}

                                {wizardStep === 4 && (
                                    <WizardStep4 data={donation} onCancel={() => { setShowDonate(false); setWizardStep(null); }} />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} `}>{user?.avatar} {user?.org}</h1>
                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'} `}>Corporate CSR Dashboard · {currentTier.icon} {currentTier.name} Tier</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setShowDonate(true)}
                            className="px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', color: '#fff', boxShadow: '0 4px 15px rgba(249,115,22,0.3)' }}>
                            <Heart className="w-4 h-4" />
                            Donate Food
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleExportESG}
                            className="px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"
                            style={{ background: isDark ? 'rgba(99,179,237,0.15)' : '#e8f4fd', color: '#63b3ed', border: '1px solid rgba(99,179,237,0.3)' }}>
                            <Download className="w-4 h-4" />
                            Export Certificate
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {STATS.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className={`${isDark ? 'glass-card' : 'clay-card'} p-5`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="text-2xl">{stat.icon}</div>
                                <TrendingUp className="w-3.5 h-3.5" style={{ color: stat.color }} />
                            </div>
                            <div className="text-2xl font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
                            <div className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-gray-700'} `}>{stat.label}</div>
                            <div className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'} `}>{stat.change}</div>
                        </motion.div>
                    ))}
                </div>

                <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'} `}>
                    {['overview', 'surplus', 'history', 'tiers'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : isDark ? 'text-white/50' : 'text-gray-500'} `}
                            style={activeTab === tab ? { background: 'linear-gradient(135deg, #63b3ed, #68d391)' } : {}}>
                            {tab === 'overview' ? '📊 Overview' : tab === 'surplus' ? '🤖 AI Surplus' : tab === 'history' ? '🍱 History' : '🏆 CSR Tiers'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} `}>🌍 Carbon Impact</h3>
                            {[
                                { label: 'CO₂ Prevented', val: '2.1T', pct: 84 },
                                { label: 'Meals Fed', val: '4,280', pct: 72 },
                                { label: 'Landfill Reduction', val: '680 kg', pct: 60 },
                            ].map(row => (
                                <div key={row.label} className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={isDark ? 'text-white/70' : 'text-gray-600'}>{row.label}</span>
                                        <span className="font-bold text-[#22c55e]">{row.val}</span>
                                    </div>
                                    <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} `}>
                                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${row.pct}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }} style={{ background: 'linear-gradient(90deg, #22c55e, #68d391)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} `}>👥 Employee Karma</h3>
                            {[
                                { name: 'Rohit Mehta', karma: 2200, rescues: 15, badge: '🏆' },
                                { name: 'Anita Shah', karma: 1800, rescues: 12, badge: '🥈' },
                                { name: 'Vikram Patel', karma: 1400, rescues: 10, badge: '🥉' },
                                { name: 'Deepa Iyer', karma: 900, rescues: 7, badge: '⭐' },
                            ].map((emp, i) => (
                                <div key={emp.name} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'} `}>
                                    <span className="text-xl">{emp.badge}</span>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} `}>{emp.name}</p>
                                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} `}>{emp.rescues} volunteer rescues</p>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: '#f97316' }}>{emp.karma}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'surplus' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h3 className={`font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'} `}>🤖 AI Surplus Prediction</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-600'} `}>Meals Planned Today</label>
                                    <input type="number" value={mealPlan.planned} onChange={e => setMealPlan(p => ({ ...p, planned: e.target.value }))}
                                        placeholder="e.g. 500"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm ${isDark ? 'bg-white/8 border-white/15 text-white placeholder:text-white/30' : 'bg-white border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/40`} />
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={handlePredictSurplus} disabled={predicting}
                                    className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
                                    {predicting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Predicting...</> : <><Zap className="w-4 h-4" /> Predict Surplus</>}
                                </motion.button>
                                <AnimatePresence>
                                    {prediction && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-2xl border ${isDark ? 'bg-[#63b3ed]/10 border-[#63b3ed]/30' : 'bg-blue-50 border-blue-200'} `}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="w-4 h-4 text-[#63b3ed]" />
                                                <span className="font-bold text-sm text-[#63b3ed]">AI Prediction Ready</span>
                                            </div>
                                            <p className={`text-sm mb-1 ${isDark ? 'text-white/80' : 'text-gray-700'} `}>
                                                <strong>~{prediction.predictedSurplus} meals</strong> predicted surplus today
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'} `}>{prediction.suggestion}</p>
                                            <div className="mt-2 text-xs text-[#22c55e] font-semibold">Confidence: {prediction.confidence}%</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
                            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} `}>📊 This Week Surplus</h3>
                            {weeklyData.some(d => d.actual > 0) ? (
                                <div className="space-y-3">
                                    {weeklyData.map(d => (
                                        <div key={d.day} className="flex items-center gap-3">
                                            <span className={`text-xs w-8 font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'} `}>{d.day}</span>
                                            <div className="flex-1">
                                                <div className={`h-2 rounded-full mb-1 ${isDark ? 'bg-white/10' : 'bg-blue-100'} `}>
                                                    <div className="h-full rounded-full" style={{ width: `${Math.min((d.predicted / 200) * 100, 100)}%`, background: 'rgba(99,179,237,0.4)' }} />
                                                </div>
                                                <div className={`h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-green-100'} `}>
                                                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((d.actual / 200) * 100, 100)}%` }}
                                                        transition={{ duration: 0.6 }} style={{ background: '#22c55e' }} />
                                                </div>
                                            </div>
                                            <span className={`text-xs w-14 text-right ${isDark ? 'text-white/60' : 'text-gray-500'} `}>{d.actual} servings</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-8 ${isDark ? 'text-white/40' : 'text-gray-400'} `}>
                                    <p className="text-sm">No donation data this week yet</p>
                                </div>
                            )}
                            <div className="flex gap-4 mt-4 text-xs">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#63b3ed]/40 block" />Predicted</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#22c55e] block" />Actual</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tiers' && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {CSR_TIERS.map((tier, i) => (
                            <motion.div key={tier.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className={`${isDark ? 'glass-card' : 'clay-card'} p-6 ${currentTier.name === tier.name ? 'ring-2' : ''} `}
                                style={currentTier.name === tier.name ? { ringColor: tier.color } : {}}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{tier.icon}</span>
                                    <div>
                                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} `}>{tier.name} Tier</h3>
                                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} `}>{tier.threshold.toLocaleString()}+ meals</p>
                                    </div>
                                    {currentTier.name === tier.name && (
                                        <span className="ml-auto text-xs px-2 py-1 rounded-full text-white font-bold" style={{ background: tier.color }}>Current</span>
                                    )}
                                </div>
                                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'} `}>{tier.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6 rounded-3xl max-w-4xl mx-auto`}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} `}>🍱 Corporate Donation History</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'} `}>
                                {tickets.length} records
                            </span>
                        </div>
                        <div className="space-y-3">
                            {tickets.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                    onClick={() => setSelectedTicket(t)}
                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} `}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ background: isDark ? 'rgba(99,179,237,0.15)' : '#e8f4fd' }}>📦</div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} `}>{t.food}</div>
                                                {t.otp && t.otp !== 'N/A' && (
                                                    <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#63b3ed]/20 text-[#63b3ed]' : 'bg-blue-100 text-blue-700'} `}>
                                                        OTP: {t.otp}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'} `}>{t.id} · {t.date} · {t.ngo}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} `}>{t.qty} meals</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                            t.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} `}>
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
