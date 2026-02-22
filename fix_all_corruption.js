const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix template literal spaces: ${ val } -> ${val}
    content = content.replace(/\$\{\s+/g, '${');
    content = content.replace(/\s+\}/g, '}');
    
    // Fix class name/hyphen spaces in strings: min - h - screen -> min-h-screen
    // Specifically looking for [char] - [char]
    content = content.replace(/([a-z0-9])\s-\s([a-z0-9])/gi, '$1-$2');
    content = content.replace(/([a-z0-9])\s-\s([a-z0-9])/gi, '$1-$2'); // Second pass for overlaps
    
    // Fix specific common patterns that might have been missed
    content = content.replace(/min-h-screen/g, 'min-h-screen');
    content = content.replace(/max-w-md/g, 'max-w-md');
    content = content.replace(/max-w-6xl/g, 'max-w-6xl');
    
    // Fix the api.post space
    content = content.replace(/\/ food/g, '/food');
    
    // Fix spaces around dots in imports or properties
    content = content.replace(/\s\.\s/g, '.');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
}

fixFile('frontend/src/pages/CorporateDashboard.jsx');
