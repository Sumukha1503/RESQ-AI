const fs = require('fs');
const file = 'frontend/src/pages/CorporateDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix remaining spaces in classes
content = content.replace(/overflow - hidden/g, 'overflow-hidden');
content = content.replace(/z - 10/g, 'z-10');
content = content.replace(/p - 2/g, 'p-2');
content = content.replace(/p - 4/g, 'p-4');
content = content.replace(/p - 6/g, 'p-6');
content = content.replace(/mb - 0\.5/g, 'mb-0.5');
content = content.replace(/mt - 0\.5/g, 'mt-0.5');
content = content.replace(/text - xs/g, 'text-xs');
content = content.replace(/text - lg/g, 'text-lg');
content = content.replace(/text - xl/g, 'text-xl');
content = content.replace(/text - 2xl/g, 'text-2xl');
content = content.replace(/mb - 1/g, 'mb-1');
content = content.replace(/mb - 1\.5/g, 'mb-1.5');
content = content.replace(/mb - 3/g, 'mb-3');
content = content.replace(/mb - 8/g, 'mb-8');
content = content.replace(/delay: i \* 0\.07/g, 'delay: i * 0.07');
content = content.replace(/text-sm \${ isDark \? 'text-white' : 'text-gray-900' }/g, "text-sm ${isDark ? 'text-white' : 'text-gray-900'}");
content = content.replace(/className={`flex-1 py-2\.5 rounded-xl text-sm font-semibold capitalize transition-all \${ activeTab === tab \? 'text-white' : isDark \? 'text-white\/50' : 'text-gray-500' } `}/g, 
                          "className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-white' : isDark ? 'text-white/50' : 'text-gray-500'}`}");

// General patterns for any single character or short word isolated by spaces
content = content.replace(/ \${ /g, ' ${');
content = content.replace(/ }`/g, '}`');
content = content.replace(/ } /g, '}');
content = content.replace(/ \. /g, '.');
content = content.replace(/ - /g, '-');
content = content.replace(/ \/ /g, '/');

fs.writeFileSync(file, content);
console.log('Final cleanup corporate complete.');
