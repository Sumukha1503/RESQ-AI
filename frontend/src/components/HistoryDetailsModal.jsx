import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Package, Clock, ShieldCheck, CheckCircle, Truck, Info } from 'lucide-react';

export default function HistoryDetailsModal({ isOpen, onClose, ticket, isDark }) {
    if (!isOpen || !ticket) return null;

    const statusOptions = {
        available: { color: '#63b3ed', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', icon: <Package className="w-5 h-5 text-blue-500" /> },
        claimed: { color: '#63b3ed', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50', icon: <Package className="w-5 h-5 text-blue-500" /> },
        accepted: { color: '#fbbf24', bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50', icon: <Truck className="w-5 h-5 text-yellow-500" /> },
        transit: { color: '#f97316', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50', icon: <Truck className="w-5 h-5 text-orange-500" /> },
        delivered: { color: '#22c55e', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
        completed: { color: '#22c55e', bg: isDark ? 'bg-green-500/10' : 'bg-green-50', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    };
    const statusProps = statusOptions[ticket.status] || statusOptions.available;

    const isDelivered = ticket.status === 'delivered' || ticket.status === 'completed';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`w-full max-w-lg relative z-10 overflow-hidden rounded-3xl ${isDark ? 'glass-card border-white/10' : 'clay-card border-gray-100'} border shadow-2xl flex flex-col max-h-[90vh]`}>

                    {/* Header */}
                    <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex justify-between items-start`}>
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusProps.bg}`}>
                                {statusProps.icon}
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{ticket.food}</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white`} style={{ backgroundColor: statusProps.color }}>
                                        {ticket?.status?.toUpperCase() || 'AVAILABLE'}
                                    </span>
                                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                        ID: {ticket.id.slice(-8).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} transition-colors`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">

                        {/* OTP Banner (If active and OTP exists) */}
                        {!isDelivered && ticket.otp && ticket.otp !== 'N/A' && (
                            <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(99,179,237,0.1), rgba(104,211,145,0.1))', border: '1px solid rgba(99,179,237,0.2)' }}>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-[#63b3ed]" />
                                    <div>
                                        <div className={`text-xs font-bold text-[#63b3ed] mb-0.5`}>PICKUP VERIFICATION</div>
                                        <div className={`text-[10px] ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Share this OTP with the rider.</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-mono font-black tracking-widest text-[#63b3ed]">{ticket.otp}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>QUANTITY</span>
                                </div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.qty}</div>
                            </div>
                            <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>POSTED</span>
                                </div>
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.date}</div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                                <span className={`text-xs font-bold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>ROUTING</span>
                            </div>
                            <div className="space-y-4 relative">
                                <div className="absolute left-[7px] top-6 bottom-6 w-0.5 bg-gray-300 dark:bg-white/10" />

                                <div className="flex gap-4 relative">
                                    <div className="w-4 h-4 rounded-full bg-blue-400 ring-4 ring-blue-400/20 z-10 mt-1" />
                                    <div>
                                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Donor Location</div>
                                        <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{ticket.donorAddress || 'Local Address'}</div>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className={`w-4 h-4 rounded-full z-10 mt-1 ${isDelivered ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-gray-300 dark:bg-gray-700'}`} />
                                    <div>
                                        <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{isDelivered ? 'Delivered' : 'Awaiting Delivery'}</div>
                                        <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{ticket.ngo || 'NGO Partner'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
