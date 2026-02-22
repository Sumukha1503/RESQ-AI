const fs = require('fs');
const file = 'frontend/src/pages/RiderDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    `import api from '../services/api';`,
    `import api from '../services/api';\nimport HistoryDetailsModal from '../components/HistoryDetailsModal';`
);

content = content.replace(
    `    const [otpLoading, setOtpLoading] = useState(false);\n    const mapCenter = [12.9716, 77.5946];`,
    `    const [otpLoading, setOtpLoading] = useState(false);\n    const [history, setHistory] = useState([]);\n    const [selectedTicket, setSelectedTicket] = useState(null);\n    const mapCenter = [12.9716, 77.5946];`
);

content = content.replace(
    `                const liveFeed = (foodRes.data || []).filter(d => d.status === 'accepted' && !d.assignedToRider).map(d => ({`,
    `                const historyFeed = (foodRes.data || []).filter(d => d.status === 'delivered' || d.status === 'completed').map(d => ({\n                    id: d._id,\n                    food: d.title,\n                    qty: d.quantity?.value || 0,\n                    date: new Date(d.createdAt).toISOString().split('T')[0],\n                    status: d.status,\n                    donorAddress: d.location?.address || 'Local Donor',\n                    ngo: 'NGO Partner',\n                    otp: d.otp || 'N/A'\n                }));\n                setHistory(historyFeed);\n\n                const liveFeed = (foodRes.data || []).filter(d => d.status === 'accepted' && !d.assignedToRider).map(d => ({`
);

content = content.replace(
    `                {/* Tabs */}\n                <div className={\`flex gap-1 p-1 rounded-2xl mb-6 \${isDark ? 'bg-white/5' : 'bg-gray-100'}\`}>\n                    {['feed', 'tracking', 'leaderboard'].map(tab => (`,
    `                {/* Tabs */}\n                <div className={\`flex gap-1 p-1 rounded-2xl mb-6 \${isDark ? 'bg-white/5' : 'bg-gray-100'}\`}>\n                    {['feed', 'tracking', 'history', 'leaderboard'].map(tab => (`
);

content = content.replace(
    `                            {tab === 'feed' ? '📋 Available' : tab === 'tracking' ? '📍 Live Tracking' : '🏆 Leaderboard'}`,
    `                            {tab === 'feed' ? '📋 Available' : tab === 'tracking' ? '📍 Live Tracking' : tab === 'history' ? '🍱 History' : '🏆 Leaderboard'}`
);

content = content.replace(
    `            </div>\n        </div>\n    );\n}`,
    `            </div>\n            {activeTab === 'history' && (\n                <div className={\`\${isDark ? 'glass-card' : 'clay-card'} p-6 rounded-3xl max-w-4xl mx-auto\`}>\n                    <div className="flex items-center justify-between mb-5">\n                        <h2 className={\`text-lg font-bold \${isDark ? 'text-white' : 'text-gray-900'}\`}>🍱 Delivery History</h2>\n                        <span className={\`text-xs font-semibold px-2.5 py-1 rounded-lg \${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}\`}>\n                            {history.length} records\n                        </span>\n                    </div>\n                    <div className="space-y-3">\n                        {history.map((t, i) => (\n                            <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}\n                                onClick={() => setSelectedTicket(t)}\n                                className={\`flex items-center justify-between p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-transform \${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}\`}>\n                                <div className="flex items-center gap-3">\n                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"\n                                        style={{ background: isDark ? 'rgba(99,179,237,0.15)' : '#e8f4fd' }}>📦</div>\n                                    <div>\n                                        <div className="flex items-center gap-2 mb-0.5">\n                                            <div className={\`text-sm font-semibold \${isDark ? 'text-white' : 'text-gray-900'}\`}>{t.food}</div>\n                                        </div>\n                                        <div className={\`text-xs \${isDark ? 'text-white/40' : 'text-gray-400'}\`}>{t.id} · {t.date} · {t.donorAddress}</div>\n                                    </div>\n                                </div>\n                                <div className="text-right">\n                                    <div className={\`text-sm font-bold \${isDark ? 'text-white' : 'text-gray-900'}\`}>{t.qty} servings</div>\n                                    <span className={\`text-xs px-2 py-0.5 rounded-full font-semibold \${t.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}\`}>\n                                        {t.status}\n                                    </span>\n                                </div>\n                            </motion.div>\n                        ))}\n                    </div>\n                </div>\n            )}\n            <HistoryDetailsModal \n                isOpen={!!selectedTicket} \n                onClose={() => setSelectedTicket(null)} \n                ticket={selectedTicket} \n                isDark={isDark} \n            />\n        </div>\n    );\n}`
);

fs.writeFileSync(file, content);
console.log('Update rider complete.');
