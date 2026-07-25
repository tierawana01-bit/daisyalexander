const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace invalid/hardcoded SVG attributes with CSS variable tokens
html = html.replace(/fill="var\(--color-cream-light\)"/g, 'fill="var(--color-cream-bg)"');
html = html.replace(/stroke="#BDCDBD"/g, 'stroke="var(--color-sage-medium)"');
html = html.replace(/fill="#E4ECE4"/g, 'fill="var(--color-sage-light)"');
html = html.replace(/fill="#E3A857"/g, 'fill="var(--color-gold)"');
html = html.replace(/fill="#FCFAF7"/g, 'fill="var(--color-cream-bg)"');
html = html.replace(/fill="#2C3E2F"/g, 'fill="var(--color-forest)"');
html = html.replace(/stroke="#2C3E2F"/g, 'stroke="var(--color-forest)"');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated all SVG background watermarks and floral corners in index.html to use theme CSS variables!');
