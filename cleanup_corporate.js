const fs = require('fs');
const file = 'frontend/src/pages/CorporateDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the classes and broken template literals
content = content.replace(/min - h - screen/g, 'min-h-screen');
content = content.replace(/py - 8/g, 'py-8');
content = content.replace(/px - 4/g, 'px-4');
content = content.replace(/max - w - md/g, 'max-w-md');
content = content.replace(/rounded - xl/g, 'rounded-xl');
content = content.replace(/text - sm/g, 'text-sm');
content = content.replace(/text - xs/g, 'text-xs');
content = content.replace(/rounded - full/g, 'rounded-full');
content = content.replace(/px - 3/g, 'px-3');
content = content.replace(/py - 2\.5/g, 'py-2.5');
content = content.replace(/rounded - 2xl/g, 'rounded-2xl');
content = content.replace(/border - b/g, 'border-b');
content = content.replace(/justify - between/g, 'justify-between');
content = content.replace(/bg - white/g, 'bg-white');
content = content.replace(/w - full/g, 'w-full');
content = content.replace(/px - 4/g, 'px-4');
content = content.replace(/py - 3\.5/g, 'py-3.5');
content = content.replace(/mt - 0\.5/g, 'mt-0.5');
content = content.replace(/gap - 1/g, 'gap-1');
content = content.replace(/p - 1/g, 'p-1');
content = content.replace(/mb - 6/g, 'mb-6');
content = content.replace(/flex - 1/g, 'flex-1');
content = content.replace(/transition - all/g, 'transition-all');
content = content.replace(/mb - 4/g, 'mb-4');
content = content.replace(/font - bold/g, 'font-bold');
content = content.replace(/h - 2/g, 'h-2');
content = content.replace(/mb - 1/g, 'mb-1');
content = content.replace(/items - center/g, 'items-center');
content = content.replace(/gap - 3/g, 'gap-3');
content = content.replace(/p - 3/g, 'p-3');
content = content.replace(/mb - 2/g, 'mb-2');
content = content.replace(/mb - 5/g, 'mb-5');
content = content.replace(/mb - 1\.5/g, 'mb-1.5');
content = content.replace(/py - 3/g, 'py-3');
content = content.replace(/border - white/g, 'border-white');
content = content.replace(/p - 6/g, 'p-6');
content = content.replace(/p - 5/g, 'p-5');
content = content.replace(/gap - 4/g, 'gap-4');
content = content.replace(/font - semibold/g, 'font-semibold');
content = content.replace(/mt - 2/g, 'mt-2');
content = content.replace(/max - w - 6xl/g, 'max-w-6xl');
content = content.replace(/mb - 8/g, 'mb-8');
content = content.replace(/text - 2xl/g, 'text-2xl');

// Fix dynamic parts
content = content.replace(/`${ /g, '`${');
content = content.replace(/ } `/g, '}`');
content = content.replace(/: \${ /g, ': ${');
content = content.replace(/ } /g, '}');

// Fix the api.post space
content = content.replace(/\/ food/g, '/food');

fs.writeFileSync(file, content);
console.log('Cleanup corporate complete.');
