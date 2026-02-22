const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/CorporateDashboard.jsx', 'utf8');
const lines = content.split('\n');
let inTemplate = false;
lines.forEach((line, i) => {
    const backticks = (line.match(/\`/g) || []).length;
    if (backticks % 2 !== 0) {
        console.log(`Line ${i+1}: Potentially unbalanced backticks (${backticks}): ${line.trim()}`);
    }
});
