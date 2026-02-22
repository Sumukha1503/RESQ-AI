const fs = require('fs');
const file = 'frontend/src/pages/RiderDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename ROUTE_POINTS to INITIAL_ROUTE_POINTS for fallback
content = content.replace(
    'const ROUTE_POINTS = [',
    'const INITIAL_ROUTE_POINTS = ['
);

// 2. Add dynamicRoute state
content = content.replace(
    '    const [accepted, setAccepted] = useState(null);',
    '    const [accepted, setAccepted] = useState(null);\n    const [dynamicRoute, setDynamicRoute] = useState(INITIAL_ROUTE_POINTS);'
);

// 3. Update liveFeed mapping to include coordinates
content = content.replace(
    `                    time: timeAgo(d.createdAt),\n                    qty: \`\${d.quantity?.value || 0} \${d.quantity?.unit || 'servings'}\`,\n                }));`,
    `                    time: timeAgo(d.createdAt),\n                    qty: \`\${d.quantity?.value || 0} \${d.quantity?.unit || 'servings'}\`,\n                    latitude: d.location?.latitude,\n                    longitude: d.location?.longitude,\n                }));`
);

// 4. Update GPS simulation to use dynamicRoute
content = content.replace(
    '                setBikePos(p => {\n                    if (p >= ROUTE_POINTS.length - 1) {\n                        clearInterval(t);\n                        setDeliveryStatus(\'delivered\');\n                        toast.success(\'🎉 Delivery complete! +50 Karma awarded!\');\n                        setKarma(k => k + 50);\n                        return ROUTE_POINTS.length - 1;\n                    }\n                    return p + 1;\n                });',
    '                setBikePos(p => {\n                    if (p >= dynamicRoute.length - 1) {\n                        clearInterval(t);\n                        setDeliveryStatus(\'delivered\');\n                        toast.success(\'🎉 Delivery complete! +50 Karma awarded!\');\n                        setKarma(k => k + 50);\n                        return dynamicRoute.length - 1;\n                    }\n                    return p + 1;\n                });'
);

// 5. Update handleAccept to fetch real route
content = content.replace(
    `    const handleAccept = (item) => {\n        // Here we'd actually make an API call to assign the rider to the task, wait for success.\n        // For now, optimistic update:\n        setAccepted(item);\n        setDeliveryStatus('arrived'); // Waiting for OTP at donor location\n        setBikePos(0);\n        setFeed(f => f.filter(c => c.id !== item.id));\n        setActiveTab('tracking');\n    };`,
    `    const handleAccept = async (item) => {\n        setAccepted(item);\n        setDeliveryStatus('arrived');\n        setBikePos(0);\n        setFeed(f => f.filter(c => c.id !== item.id));\n        setActiveTab('tracking');\n\n        try {\n            const res = await api.get(\`/food/\${item.id}/route\`);\n            if (res.data.waypoints && res.data.waypoints.length > 0) {\n                setDynamicRoute(res.data.waypoints);\n            }\n        } catch (err) {\n            console.error("Failed to fetch road-aware route", err);\n        }\n    };`
);

// 6. Update totalBikePos calculation
content = content.replace(
    '    const totalBikePos = bikePos < ROUTE_POINTS.length ? ROUTE_POINTS[bikePos] : ROUTE_POINTS[ROUTE_POINTS.length - 1];',
    '    const totalBikePos = bikePos < dynamicRoute.length ? dynamicRoute[bikePos] : dynamicRoute[dynamicRoute.length - 1];'
);

// 7. Update Map markers
content = content.replace(
    '                                    {/* Donor marker */}\n                                    <Marker position={ROUTE_POINTS[0]} icon={donorIcon}>\n                                        <Popup>📦 Pickup: Great Indian Kitchen</Popup>\n                                    </Marker>',
    '                                    {/* Donor marker */}\n                                    <Marker position={dynamicRoute[0]} icon={donorIcon}>\n                                        <Popup>📦 Pickup: {accepted?.restaurant || "Donor"}</Popup>\n                                    </Marker>'
);
content = content.replace(
    '                                    {/* NGO marker */}\n                                    <Marker position={ROUTE_POINTS[ROUTE_POINTS.length - 1]} icon={ngoIcon}>',
    '                                    {/* NGO marker */}\n                                    <Marker position={dynamicRoute[dynamicRoute.length - 1]} icon={ngoIcon}>'
);
content = content.replace(
    '                                    {/* Route */}\n                                    <Polyline positions={ROUTE_POINTS} color="#63b3ed" weight={3} opacity={0.7} dashArray="8 4" />\n                                    {/* Completed route */}\n                                    {bikePos > 0 && <Polyline positions={ROUTE_POINTS.slice(0, bikePos + 1)} color="#22c55e" weight={3} />}',
    '                                    {/* Route */}\n                                    <Polyline positions={dynamicRoute} color="#63b3ed" weight={3} opacity={0.7} dashArray="8 4" />\n                                    {/* Completed route */}\n                                    {bikePos > 0 && <Polyline positions={dynamicRoute.slice(0, bikePos + 1)} color="#22c55e" weight={3} />}'
);

// 8. Update Timeline status for delivery step
content = content.replace(
    `{ label: 'Delivering to NGO', done: bikePos >= 5, time: bikePos >= 5 ? 'In progress' : '--' },`,
    `{ label: 'Delivering to NGO', done: bikePos > 0 && bikePos < dynamicRoute.length - 1, time: bikePos > 0 ? 'In progress' : '--' },`
);

fs.writeFileSync(file, content);
console.log('Update rider frontend complete.');
