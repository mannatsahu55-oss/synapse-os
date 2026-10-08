const fs = require('fs');

const path = '/Users/hritikshukla/Desktop/synapse ka bhosda/SYNAPSE-AI/public/framer/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Update #custom-static-nav CSS
html = html.replace(
    /display:\s*grid;\n\s*grid-template-columns:\s*1fr\s+auto\s+1fr;\n\s*align-items:\s*center;\n\s*gap:\s*16px;/,
    "display: flex;\n    justify-content: center;\n    align-items: center;"
);

// 2. Remove the empty divs from the custom-static-nav block
const navStart = html.indexOf('<nav id="custom-static-nav">');
const navEnd = html.indexOf('</nav>', navStart) + 6;
let navBlock = html.substring(navStart, navEnd);
navBlock = navBlock.replace(/<div><\/div>/g, '');
html = html.substring(0, navStart) + navBlock + html.substring(navEnd);

// 3. Update the inline style for Large and Medium variants
html = html.replace(
    /style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; width: 100%; padding: 16px 32px; background-color: transparent;"/g,
    'style="display: flex; justify-content: center; align-items: center; width: 100%; padding: 16px 32px; background-color: transparent;"'
);

// 4. Remove the empty divs from the SSR variants
html = html.replace(/<nav data-framer-name="Large"[^>]*>\s*<div><\/div>/, match => match.replace('<div></div>', ''));
html = html.replace(/<\/div>\s*<div><\/div><\/nav>/g, '</div></nav>');

html = html.replace(/<nav data-framer-name="Medium"[^>]*>\s*<div><\/div>/, match => match.replace('<div></div>', ''));

fs.writeFileSync(path, html);
console.log("Navbar fixed and centered!");
