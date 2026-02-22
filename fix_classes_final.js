const fs = require('fs');
const file = 'frontend/src/pages/CorporateDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the " - h - " etc patterns globally in this file
content = content.replace(/ - h - /g, '-h-');
content = content.replace(/ - 8/g, '-8');
content = content.replace(/ - 4/g, '-4');
content = content.replace(/ - w - /g, '-w-');
content = content.replace(/ - xl/g, '-xl');
content = content.replace(/ - sm/g, '-sm');
content = content.replace(/ - xs/g, '-xs');
content = content.replace(/ - full/g, '-full');
content = content.replace(/ - 3/g, '-3');
content = content.replace(/ - 2.5/g, '-2.5');
content = content.replace(/ - 2xl/g, '-2xl');
content = content.replace(/ - b/g, '-b');
content = content.replace(/ - between/g, '-between');
content = content.replace(/ - white/g, '-white');
content = content.replace(/ - 6xl/g, '-6xl');
content = content.replace(/ - 2/g, '-2');
content = content.replace(/ - 1/g, '-1');
content = content.replace(/ - 6/g, '-6');
content = content.replace(/ - 4/g, '-4');
content = content.replace(/ - 5/g, '-5');
content = content.replace(/ - semibold/g, '-semibold');
content = content.replace(/ - bold/g, '-bold');
content = content.replace(/ - lg/g, '-lg');
content = content.replace(/ - xl/g, '-xl');
content = content.replace(/ - 2xl/g, '-2xl');

// Fix spaces around hyphens in any word-word combination in className
content = content.replace(/className={`([^`]+)`}/g, (match, p1) => {
    return `className={\`${p1.replace(/\s+-\s+/g, '-')}\`}`;
});

fs.writeFileSync(file, content);
console.log('Class clean complete.');
