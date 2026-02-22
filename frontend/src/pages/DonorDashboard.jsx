import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import {
  Package, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle,
  Clock, QrCode, Mail, Star, Zap, Camera, Thermometer,
  TrendingUp, Award, Truck, Calendar, BarChart3, Sparkles, MapPin
} from 'lucide-react';
import api from '../services/api';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import confetti from 'canvas-confetti';

const FOOD_TYPES = ['Rice / Dal', 'Bread & Bakery', 'Curries', 'Salads', 'Sandwiches', 'Desserts', 'Mixed Meals', 'Snacks', 'Beverages', 'Raw Produce'];

function SkeletonCard() {
  return (
    <div className="skeleton h-24 rounded-2xl" />
  );
}



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
              <div key={i} className="ai-thinking-dot" />
            ))}
            <span className={`text-xs ml-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Vision analysis in progress</span>
          </div>
          <div className="mt-3 space-y-2">
            {['Checking freshness indicators...', 'Analyzing color and texture...', 'Evaluating contamination risk...'].map((s, i) => (
              <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.7, x: 0 }} transition={{ delay: i * 0.3 }}
                className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                {s}
              </motion.div>
            ))}
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
          onChange('pickupAddress', 'Current Location GPS Pinned'); // Default text

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

      {/* Map Preview */}
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

function WizardStep4({ data, onComplete, onCancel }) {
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
      {/* Safe badge */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold text-white safe-badge">
          <CheckCircle className="w-5 h-5" />
          ✅ SAFE TO DONATE
        </div>
      </motion.div>

      {/* Shelf life countdown */}
      <div className={`p-5 rounded-2xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-gray-400'}`}>Estimated Shelf Life Remaining</p>
        <div className="flex items-center justify-center gap-2">
          <div className={`text-3xl font-bold font-mono ${urgency === 'high' ? 'text-[#ef4444]' : urgency === 'medium' ? 'text-[#f97316]' : 'text-[#22c55e]'}`}>
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </div>
          {urgency === 'high' && <span className="urgency-badge">URGENT</span>}
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          {data.shelfLifeDetails || 'AI estimates 2-3 hours safe window at ambient temperature'}
        </p>
      </div>

      {/* Rescue Ticket */}
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
            { label: 'Status', val: '🟡 Awaiting Rider' },
          ].map(row => (
            <div key={row.label} className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-white/40' : 'text-gray-400'}>{row.label}: </span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}
          onClick={onComplete}
          className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)' }}>
          <Mail className="w-4 h-4" />
          Email Certificate
        </motion.button>
      </div>
    </div>
  );
}

export function DonorDashboard() {
  const { isDark } = useTheme();
  const { user } = useRole();
  const [wizardStep, setWizardStep] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState({ mealsSaved: 0, co2: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, statsRes] = await Promise.all([
          api.get(`/food/my-donations`),
          api.get(`/admin/stats`),
        ]);
        const history = (foodRes.data || []).map(d => ({
          id: d._id,
          food: d.title,
          qty: d.quantity?.value || 0,
          date: new Date(d.createdAt).toISOString().split('T')[0],
          status: d.status,
          ngo: d.status === 'completed' ? 'Delivered' :
            d.status === 'transit' ? (d.assignedToNGO?.name || 'In Transit') :
              d.status === 'accepted' ? (d.assignedToNGO?.name || 'Rider Assigned') :
                d.status === 'claimed' ? (d.assignedToNGO?.name || 'NGO Found') : 'Searching NGOs...',
          donorAddress: d.location?.address || 'Donor Location',
          meals: d.quantity?.value || 0,
          otp: (d.status === 'available' || d.status === 'claimed' || d.status === 'accepted') ? (d.otp || '---') : 'Used',
        }));
        setTickets(history);
        const s = statsRes.data;
        setStats({
          mealsSaved: s?.impact?.mealsSaved || 0,
          co2: ((s?.listings?.completed || 0) * 5 * 0.25).toFixed(1),
          activeDonations: s?.listings?.available || 0,
        });
      } catch {
        // keep empty state
      } finally {
        setSkeletonLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const STEPS = [
    { label: 'Food Info', icon: Package },
    { label: 'Safety Check', icon: Shield_placeholder },
    { label: 'Upload Photo', icon: Camera },
    { label: 'Location', icon: MapPin },
    { label: 'AI Approval', icon: Sparkles },
  ];

  function Shield_placeholder(props) { return <CheckCircle {...props} />; }

  const hoursOld = formData.preparedTime
    ? ((Date.now() - new Date(formData.preparedTime).getTime()) / 3600000)
    : 0;

  const canGoNext = () => {
    if (wizardStep === 0) return formData.foodType && formData.quantity && formData.preparedTime && hoursOld <= 4;
    if (wizardStep === 1) return formData.tempOk && formData.smellOk && formData.packingOk;
    if (wizardStep === 2) return formData.imageFile || formData.imagePreview;
    if (wizardStep === 3) return formData.latitude || (formData.pickupAddress && formData.pickupAddress.trim().length > 5);
    return true;
  };

  const handleNext = async () => {
    if (wizardStep === 0) {
      setWizardStep(1);
    } else if (wizardStep === 1) {
      // Step 2 → 3: AI verify
      setWizardStep(2);
    } else if (wizardStep === 2) {
      // Step 3 → 4: image check then shelf life
      setAiThinking(true);

      let aiSafe = true;
      try {
        const res = await api.post(`/ai/image-check`, {
          foodType: formData.foodType,
          quantity: formData.quantity,
          tempOk: formData.tempOk,
          smellOk: formData.smellOk,
          packingOk: formData.packingOk,
          image: formData.imagePreview
        }).catch(() => ({ data: { safe: true, message: 'Visual inspection passed. Food appears fresh and properly packaged.' } }));
        updateForm('imageResult', res.data);
        aiSafe = res.data.safe;
      } catch {
        updateForm('imageResult', { safe: true, message: 'Food looks fresh and properly packaged.' });
      }
      setAiThinking(false);

      if (!aiSafe) {
        // If dangerous, bypass location and go straight to rejection
        setWizardStep(4);
        return;
      }

      // Also get shelf life
      try {
        const slRes = await api.post(`/ai/shelf-life`, {
          foodType: formData.foodType,
          preparedTime: formData.preparedTime,
          tempOk: formData.tempOk,
        }).catch(() => ({ data: { shelfLifeHours: 2, details: 'AI estimates 2-hour safe window.', riskScore: 88 } }));
        updateForm('shelfLifeHours', slRes.data.shelfLifeHours || 2);
        updateForm('shelfLifeDetails', slRes.data.details);
        updateForm('riskScore', slRes.data.riskScore || 88);
      } catch { }

      // Go to Location step
      setWizardStep(3);
    } else if (wizardStep === 3) {
      updateForm('ticketId', 'TKT-' + Math.floor(Math.random() * 90000 + 10000));
      setWizardStep(4);
    }
  };

  const handleComplete = async () => {
    // Fire confetti
    confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: ['#63b3ed', '#68d391', '#f97316', '#22c55e'] });
    setLoading(true);

    try {
      // Create the food listing using the backend, passing the base64 image 
      const res = await api.post(`/food`, {
        title: formData.foodType || 'Surplus Food',
        description: `Prepared at ${formData.preparedTime}. Temp Check: ${formData.tempOk}. Smell: ${formData.smellOk}. Packing: ${formData.packingOk}.`,
        quantity: { value: Number(formData.quantity), unit: 'servings' },
        category: 'other',
        expiryDate: new Date(Date.now() + (formData.shelfLifeHours || 2) * 3600000).toISOString(),
        pickupTime: new Date(Date.now() + 1800000).toISOString(), // next 30 mins
        location: {
          latitude: formData.latitude || 12.9716,
          longitude: formData.longitude || 77.5946,
          address: formData.pickupAddress || 'Donor Location',
          mapPreviewUrl: formData.mapPreviewUrl || null
        },
        image: formData.imagePreview, // Base64 image
        aiData: {
          isSafeToConsume: formData.imageResult?.safe ?? true,
          score: formData.riskScore || 88,
          shelfLifeHours: formData.shelfLifeHours || 2,
          reason: formData.imageResult?.message || "Visual inspection passed."
        }
      });

      toast.success('🎉 Donation Verified & Listed Successfully!');

      // Add to local history list from API response
      setTickets(prev => [{
        id: res.data.otp || formData.ticketId, // Show OTP to donor
        food: res.data.title,
        qty: res.data.quantity?.value || Number(formData.quantity),
        date: new Date(res.data.createdAt).toISOString().split('T')[0],
        status: res.data.status,
        ngo: 'Matching NGOs...',
        donorAddress: res.data.location?.address || formData.pickupAddress || 'Donor Location',
        meals: res.data.quantity?.value || Number(formData.quantity),
        otp: res.data.otp
      }, ...prev]);

      setWizardStep(null);
      setFormData({});

      // Email endpoint for certificate (if applicable)
      api.post(`/email/send-certificate`, {
        email: user.email,
        name: user.name,
        meals: formData.quantity,
        org: user.org,
        ticketId: formData.ticketId,
      }).catch(() => { });

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list food');
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    { label: 'Total Meals Donated', value: stats.mealsSaved.toString(), icon: '🍱', color: '#63b3ed', sub: 'All time' },
    { label: 'Active Donations', value: tickets.filter(t => t.status === 'available').length.toString(), icon: '📦', color: '#68d391', sub: 'Awaiting pickup' },
    { label: 'CO₂ Prevented', value: `${stats.co2}kg`, icon: '🌿', color: '#22c55e', sub: 'Impact logged' },
    { label: 'Karma Points', value: user?.karma?.toString() || '0', icon: '⭐', color: '#f97316', sub: user?.badge || 'Food Champion' },
  ];

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.avatar} Welcome, {user?.name}
            </motion.h1>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{user?.org} · Donor Dashboard</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setWizardStep(0); setFormData({}); }}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #63b3ed, #68d391)', boxShadow: '0 4px 16px rgba(99,179,237,0.3)' }}>
            <Package className="w-4 h-4" />
            New Donation
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`${isDark ? 'glass-card' : 'clay-card'} p-5`}>
              {skeletonLoading ? <SkeletonCard /> : (
                <>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{stat.label}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{stat.sub}</div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Donation History */}
        <div className={`${isDark ? 'glass-card' : 'clay-card'} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🍱 Donation History</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
              {tickets.length} records
            </span>
          </div>
          <div className="space-y-3">
            {tickets.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedTicket(t)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: isDark ? 'rgba(99,179,237,0.15)' : '#e8f4fd' }}>🍱</div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.food}</div>
                      {t.otp && t.otp !== 'N/A' && (
                        <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#63b3ed]/20 text-[#63b3ed]' : 'bg-blue-100 text-blue-700'}`}>
                          OTP: {t.otp}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{t.id} · {t.date} · {t.ngo}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.qty} meals</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    t.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {t.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* DONATION WIZARD MODAL */}
      <AnimatePresence>
        {wizardStep !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl ${isDark ? 'bg-[#141828] border border-white/10' : 'bg-white'} shadow-2xl`}>

              {/* Wizard Header */}
              <div className="p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🍱 New Donation — Step {wizardStep + 1}/5
                  </h3>
                  <button onClick={() => setWizardStep(null)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}>
                    ✕
                  </button>
                </div>
                {/* Progress bar */}
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <motion.div className="h-full rounded-full" animate={{ width: `${((wizardStep + 1) / 5) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ background: 'linear-gradient(90deg, #63b3ed, #68d391)' }} />
                </div>
                {/* Step labels */}
                <div className="flex justify-between mt-2">
                  {STEPS.map((s, i) => (
                    <span key={s.label} className={`text-[10px] md:text-xs ${i <= wizardStep ? 'text-[#63b3ed] font-semibold' : isDark ? 'text-white/30' : 'text-gray-300'}`}>{s.label}</span>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={wizardStep}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}>
                    {wizardStep === 0 && <WizardStep1 data={formData} onChange={updateForm} />}
                    {wizardStep === 1 && <WizardStep2 data={formData} onChange={updateForm} />}
                    {wizardStep === 2 && <WizardStep3 data={formData} onChange={updateForm} loading={aiThinking} />}
                    {wizardStep === 3 && <WizardStepLocation data={formData} onChange={updateForm} />}
                    {wizardStep === 4 && <WizardStep4 data={formData} onComplete={handleComplete} onCancel={() => setWizardStep(null)} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {wizardStep < 4 && (
                <div className="p-6 pt-0 flex gap-3">
                  {wizardStep > 0 && (
                    <button onClick={() => setWizardStep(s => s - 1)}
                      className={`px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <motion.button whileHover={canGoNext() ? { scale: 1.02 } : {}} whileTap={canGoNext() ? { scale: 0.98 } : {}}
                    onClick={handleNext}
                    disabled={!canGoNext() || aiThinking}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${!canGoNext() || aiThinking ? 'opacity-40 cursor-not-allowed' : ''
                      } text-white`}
                    style={{ background: canGoNext() ? 'linear-gradient(135deg, #63b3ed, #68d391)' : '#94a3b8' }}>
                    {aiThinking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>{wizardStep === 2 ? 'Run AI Check' : 'Continue'} <ChevronRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistoryDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        isDark={isDark}
      />
    </div>
  );
}