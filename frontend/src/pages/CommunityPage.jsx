import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useRole } from '../contexts/RoleContext';
import { toast } from 'sonner';
import { Heart, MessageCircle, Send, Share2, Bookmark, Image, X, Plus, Search, Smile, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

/* ─── helpers ─── */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const s = Math.round((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
}

const TYPE_META = {
    donation: { label: 'Donation', color: '#63b3ed', emoji: '🍱' },
    achievement: { label: 'Achievement', color: '#22c55e', emoji: '🏆' },
    impact: { label: 'Impact', color: '#a78bfa', emoji: '❤️' },
    rescue: { label: 'Rescue', color: '#f97316', emoji: '🛵' },
    milestone: { label: 'Milestone', color: '#fbbf24', emoji: '⭐' },
    general: { label: 'Story', color: '#68d391', emoji: '💬' },
};

const ROLE_AVATAR = { donor: '🏪', ngo: '🏥', rider: '🛵', admin: '⚡', corporate: '🏢', community: '🌐' };

/* ─── Comment Drawer ─── */
function CommentDrawer({ post, user, isDark, onClose }) {
    const [comments, setComments] = useState(post.comments || []);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        // Fetch latest comments
        api.get(`/community/comments/${post._id || post.id}`)
            .then(r => setComments(r.data.comments || []))
            .catch(() => { });
    }, [post._id, post.id]);

    const send = async () => {
        if (!text.trim()) return;
        setSending(true);
        try {
            const res = await api.post(`/community/comment/${post._id || post.id}`, {
                user: user?.name || 'User',
                role: user?.role || 'community',
                avatar: user?.avatar || ROLE_AVATAR[user?.role] || '👤',
                text,
            });
            setComments(prev => [...prev, res.data]);
            setText('');
            setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { toast.error('Failed to send comment'); }
        setSending(false);
    };

    return (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed inset-y-0 right-0 w-full sm:w-[380px] z-50 flex flex-col ${isDark ? 'bg-[#0f1523]' : 'bg-white'} shadow-2xl border-l ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Comments · {comments.length}</h3>
                <button onClick={onClose} className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Post preview */}
            <div className={`px-5 py-3 border-b text-xs ${isDark ? 'text-white/60 border-white/10' : 'text-gray-500 border-gray-100'}`}>
                <span className="font-semibold" style={{ color: TYPE_META[post.type]?.color }}>{post.user}</span> {post.content.slice(0, 80)}{post.content.length > 80 ? '…' : ''}
            </div>
            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
                {comments.length === 0 && (
                    <div className={`text-center py-10 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>No comments yet — be the first! 💬</div>
                )}
                {comments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="text-xl flex-shrink-0">{c.avatar || '👤'}</div>
                        <div>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.user} </span>
                            <span className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{c.text}</span>
                            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{timeAgo(c.createdAt)}</div>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            {/* Input */}
            <div className={`px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'} flex items-center gap-3`}>
                <div className="text-xl">{user?.avatar || ROLE_AVATAR[user?.role] || '👤'}</div>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Add a comment…"
                    className={`flex-1 text-sm bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/30' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
                <button onClick={send} disabled={!text.trim() || sending}
                    className="text-[#63b3ed] font-bold text-xs disabled:opacity-30 transition-opacity">
                    Post
                </button>
            </div>
        </motion.div>
    );
}

/* ─── Post Card ─── */
function PostCard({ post, user, isDark, onOpenComments }) {
    const meta = TYPE_META[post.type] || TYPE_META.general;
    const [liked, setLiked] = useState((post.likedBy || []).includes(user?.name));
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [imgExpanded, setImgExpanded] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleLike = async () => {
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(c => newLiked ? c + 1 : Math.max(0, c - 1));
        try {
            const res = await api.post(`/community/like/${post._id || post.id}`, { userName: user?.name || 'User' });
            setLikeCount(res.data.likes);
            setLiked(res.data.liked);
        } catch { }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`${isDark ? 'bg-[#141828] border-white/8' : 'bg-white border-gray-100'} border rounded-2xl overflow-hidden`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${meta.color}18` }}>
                        {post.avatar || ROLE_AVATAR[post.role] || '👤'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.user}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                                {meta.emoji} {meta.label}
                            </span>
                        </div>
                        <div className={`text-[11px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            {post.role} · {timeAgo(post.createdAt || post.timestamp)}
                            {post.location && ` · 📍 ${post.location}`}
                        </div>
                    </div>
                </div>
                <button className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                    <MoreHorizontal className="w-4 h-4 opacity-50" />
                </button>
            </div>

            {/* Image */}
            {post.imageUrl && (
                <div className="cursor-zoom-in" onClick={() => setImgExpanded(true)}>
                    <img src={post.imageUrl} alt="post" className="w-full max-h-[480px] object-cover" />
                </div>
            )}

            {/* Content */}
            <div className="px-4 py-3">
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/85' : 'text-gray-700'}`}>{post.content}</p>
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.map(t => (
                            <span key={t} className="text-xs font-semibold" style={{ color: meta.color }}>#{t}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={`flex items-center justify-between px-4 pb-4`}>
                <div className="flex items-center gap-4">
                    {/* Like */}
                    <button onClick={handleLike} className="flex items-center gap-1.5 group">
                        <motion.div whileTap={{ scale: 1.4 }}>
                            <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : isDark ? 'text-white/50 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
                        </motion.div>
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{likeCount}</span>
                    </button>
                    {/* Comment */}
                    <button onClick={() => onOpenComments(post)} className="flex items-center gap-1.5 group">
                        <MessageCircle className={`w-5 h-5 ${isDark ? 'text-white/50 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{(post.comments || []).length}</span>
                    </button>
                    {/* Share */}
                    <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast('🔗 Link copied!'); }}
                        className="group">
                        <Share2 className={`w-5 h-5 ${isDark ? 'text-white/50 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-700'}`} />
                    </button>
                </div>
                {/* Bookmark */}
                <button onClick={() => setSaved(s => !s)}>
                    <Bookmark className={`w-5 h-5 transition-colors ${saved ? 'fill-[#63b3ed] text-[#63b3ed]' : isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`} />
                </button>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {imgExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                        onClick={() => setImgExpanded(false)}>
                        <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            src={post.imageUrl} alt="" className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
                        <button className="absolute top-5 right-5 text-white/70 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* ─── Story Pill ─── */
function StoryPill({ name, avatar, color, isYou }) {
    const { isDark } = useTheme();
    return (
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl`}
                style={{ background: `linear-gradient(135deg, ${color}, ${color}80)`, boxShadow: isYou ? `0 0 0 3px ${color}40` : 'none' }}>
                {avatar}
            </div>
            <span className={`text-[10px] font-semibold truncate max-w-[60px] ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                {isYou ? 'Your Story' : name}
            </span>
        </div>
    );
}

/* ─── Compose Sheet ─── */
function ComposeSheet({ user, isDark, onPost, onClose }) {
    const [content, setContent] = useState('');
    const [type, setType] = useState('general');
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef(null);

    const pickImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const submit = async () => {
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/community/post`, {
                type,
                user: user?.name || 'User',
                role: user?.role || 'community',
                avatar: user?.avatar || ROLE_AVATAR[user?.role] || '👤',
                content,
                imageUrl: imagePreview || null,
                location: location || null,
                tags: content.match(/#(\w+)/g)?.map(t => t.slice(1)) || [],
            });
            onPost(res.data);
            toast.success('✅ Posted to the community!');
            onClose();
        } catch { toast.error('Failed to post. Try again.'); }
        setSubmitting(false);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.97, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 20 }}
            className={`fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div className={`w-full max-w-lg rounded-3xl overflow-hidden ${isDark ? 'bg-[#141828]' : 'bg-white'} shadow-2xl`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <button onClick={onClose} className={`text-sm font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Cancel</button>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>New Post</h3>
                    <button onClick={submit} disabled={!content.trim() || submitting}
                        className="text-sm font-bold text-[#63b3ed] disabled:opacity-30 transition-opacity">
                        {submitting ? '...' : 'Share'}
                    </button>
                </div>

                {/* Type pills */}
                <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {Object.entries(TYPE_META).map(([k, v]) => (
                        <button key={k} onClick={() => setType(k)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${type === k ? 'text-white' : isDark ? 'bg-white/8 text-white/60' : 'bg-gray-100 text-gray-500'}`}
                            style={type === k ? { background: `linear-gradient(135deg, ${v.color}, ${v.color}90)` } : {}}>
                            {v.emoji} {v.label}
                        </button>
                    ))}
                </div>

                {/* Compose area */}
                <div className="flex gap-3 px-5 py-4">
                    <div className="text-2xl">{user?.avatar || ROLE_AVATAR[user?.role] || '👤'}</div>
                    <div className="flex-1">
                        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{user?.name || 'User'}</p>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Share a rescue story, milestone, or anything inspiring… Use #hashtags!"
                            rows={4}
                            className={`w-full text-sm resize-none bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/30' : 'text-gray-900 placeholder:text-gray-400'}`}
                        />
                    </div>
                </div>

                {/* Image preview */}
                {imagePreview && (
                    <div className="px-5 pb-4 relative">
                        <img src={imagePreview} alt="" className="w-full max-h-52 object-cover rounded-2xl" />
                        <button onClick={() => setImagePreview(null)}
                            className="absolute top-6 right-9 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Location */}
                <div className={`px-5 pb-2`}>
                    <input value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="📍 Add location (optional)"
                        className={`w-full text-xs bg-transparent outline-none ${isDark ? 'text-white/60 placeholder:text-white/20' : 'text-gray-400 placeholder:text-gray-300'}`} />
                </div>

                {/* Bottom toolbar */}
                <div className={`flex items-center px-5 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'} gap-4`}>
                    <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
                    <button onClick={() => fileRef.current?.click()}
                        className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                        <Image className="w-4 h-4" /> Photo
                    </button>
                    <span className={`ml-auto text-xs ${isDark ? 'text-white/30' : 'text-gray-300'}`}>{content.length}/500</span>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Main CommunityPage ─── */
export function CommunityPage() {
    const { isDark } = useTheme();
    const { user } = useRole();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showCompose, setShowCompose] = useState(false);
    const [commentPost, setCommentPost] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const isLoggedIn = !!localStorage.getItem('resq_token');
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/community/feed?limit=30`);
            setPosts(res.data.posts || []);
        } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleNewPost = (post) => {
        setPosts(prev => [post, ...prev]);
    };

    const filtered = posts.filter(p => {
        const matchType = activeFilter === 'all' || p.type === activeFilter;
        const matchSearch = !searchQuery || p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.user.toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchSearch;
    });

    // Stories bar — derived from real recent posters
    const recentPosters = [...new Map(posts.slice(0, 8).map(p => [p.user, p])).values()];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f4f6f8]'}`}>
            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(user?.role === 'ngo' ? '/ngo-dashboard' : user?.role === 'rider' ? '/rider-dashboard' : user?.role === 'corporate' ? '/corporate-dashboard' : '/donor-dashboard')}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🌐 Community</h1>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>ResQ-AI Rescue Network</p>
                        </div>
                    </div>
                    {isLoggedIn && (
                        <motion.button
                            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                            onClick={() => setShowCompose(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #a78bfa, #63b3ed)' }}
                        >
                            <Plus className="w-4 h-4" /> New Post
                        </motion.button>
                    )}
                </div>

                {/* ── Search ── */}
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-5 ${isDark ? 'bg-white/8 border-white/10' : 'bg-white border-gray-100'} border`}>
                    <Search className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search posts, people…"
                        className={`flex-1 text-sm bg-transparent outline-none ${isDark ? 'text-white placeholder:text-white/30' : 'text-gray-700 placeholder:text-gray-400'}`}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 opacity-50" /></button>
                    )}
                </div>

                {/* ── Stories Bar ── */}
                {recentPosters.length > 0 && (
                    <div className={`${isDark ? 'bg-[#141828] border-white/8' : 'bg-white border-gray-100'} border rounded-2xl p-4 mb-5`}>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar">
                            {isLoggedIn && (
                                <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setShowCompose(true)}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed ${isDark ? 'border-white/20 text-white/40' : 'border-gray-200 text-gray-400'}`}>
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className={`text-[10px] font-semibold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Add Story</span>
                                </div>
                            )}
                            {recentPosters.map((p, i) => (
                                <StoryPill key={p.user} name={p.user} avatar={p.avatar || ROLE_AVATAR[p.role] || '👤'}
                                    color={TYPE_META[p.type]?.color || '#63b3ed'} isYou={p.user === user?.name} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Filter chips ── */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
                    {[['all', '✨ All'], ...Object.entries(TYPE_META).map(([k, v]) => [k, `${v.emoji} ${v.label}`])].map(([k, label]) => (
                        <button key={k} onClick={() => setActiveFilter(k)}
                            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${activeFilter === k ? 'text-white shadow-md' : isDark ? 'bg-white/8 text-white/60' : 'bg-white text-gray-500 border border-gray-100'}`}
                            style={activeFilter === k ? { background: activeFilter === 'all' ? 'linear-gradient(135deg, #a78bfa, #63b3ed)' : `linear-gradient(135deg, ${TYPE_META[k]?.color || '#63b3ed'}, ${TYPE_META[k]?.color || '#63b3ed'}90)` } : {}}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Feed ── */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${isDark ? 'bg-[#141828]' : 'bg-white'} rounded-2xl p-4 animate-pulse`}>
                                <div className="flex gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                                    <div className="flex-1">
                                        <div className={`h-3 rounded w-32 mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                                        <div className={`h-2 rounded w-20 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                                    </div>
                                </div>
                                <div className={`h-4 rounded w-full mb-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                                <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={`text-center py-16 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        <div className="text-5xl mb-4">🌱</div>
                        <p className="font-semibold text-sm">No posts yet</p>
                        <p className="text-xs mt-1">Be the first to share your rescue story!</p>
                        {isLoggedIn && (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCompose(true)}
                                className="mt-5 px-6 py-2.5 rounded-2xl text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #a78bfa, #63b3ed)' }}>
                                Create First Post
                            </motion.button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filtered.map(post => (
                                <PostCard
                                    key={post._id || post.id}
                                    post={post}
                                    user={user}
                                    isDark={isDark}
                                    onOpenComments={setCommentPost}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* ── Floating Post Button (mobile) ── */}
                {isLoggedIn && (
                    <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCompose(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl md:hidden z-30"
                        style={{ background: 'linear-gradient(135deg, #a78bfa, #63b3ed)', boxShadow: '0 8px 24px rgba(167,139,250,0.5)' }}>
                        <Plus className="w-6 h-6" />
                    </motion.button>
                )}
            </div>

            {/* ── Compose Sheet ── */}
            <AnimatePresence>
                {showCompose && (
                    <ComposeSheet user={user} isDark={isDark} onPost={handleNewPost} onClose={() => setShowCompose(false)} />
                )}
            </AnimatePresence>

            {/* ── Comment Drawer ── */}
            <AnimatePresence>
                {commentPost && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40" onClick={() => setCommentPost(null)} />
                        <CommentDrawer post={commentPost} user={user} isDark={isDark} onClose={() => setCommentPost(null)} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
