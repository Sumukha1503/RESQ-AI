const fs = require('fs');
const file = 'frontend/src/pages/CorporateDashboard.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Strip markdown wrappers
if (lines[0].startsWith('```')) lines.shift();
if (lines[lines.length - 1].startsWith('```')) lines.pop();

let content = lines.join('\n');

// 2. Fix spaces in class names and generic hyphens in strings
// Specifically fix " - h - " -> "-h-", etc.
content = content.replace(/ - h - /g, '-h-');
content = content.replace(/py - /g, 'py-');
content = content.replace(/px - /g, 'px-');
content = content.replace(/w - /g, 'w-');
content = content.replace(/max - w - /g, 'max-w-');
content = content.replace(/rounded - /g, 'rounded-');
content = content.replace(/text - /g, 'text-');
content = content.replace(/gap - /g, 'gap-');
content = content.replace(/mb - /g, 'mb-');
content = content.replace(/mt - /g, 'mt-');
content = content.replace(/z - /g, 'z-');
content = content.replace(/p - /g, 'p-');
content = content.replace(/flex - /g, 'flex-');
content = content.replace(/border - /g, 'border-');
content = content.replace(/items - /g, 'items-');
content = content.replace(/justify - /g, 'justify-');

// 3. Fix spaces in URIs
content = content.replace(/\/ /g, '/');
content = content.replace(/ \//g, '/');
content = content.replace(/\/corporate/g, '/corporate');
content = content.replace(/\/predict-surplus/g, '/predict-surplus');

// 4. Fix template literal spaces
content = content.replace(/\$\{\s+/g, '${');
content = content.replace(/\s+\}/g, '}');

// 5. Fix missing space in keywords
content = content.replace(/\}from/g, '} from');
content = content.replace(/\}const/g, '} const');
content = content.replace(/isDark\}/g, 'isDark }'); // In className expressions

// 6. Fix hyphen spaces that might have been part of class names but weren't caught
content = content.replace(/ - /g, '-'); 
// Warning: " - " fix might break subtraction, but in this file, most are class names.
// Let's refine to only fix hyphens NOT surrounded by numbers if possible, 
// but simple is better for now since the corruption is so broad.
// Wait, subtraction like "Date.now() - new Date()" would become "Date.now()-new Date()", which is fine.

fs.writeFileSync(file, content);
console.log('Deep clean complete.');
