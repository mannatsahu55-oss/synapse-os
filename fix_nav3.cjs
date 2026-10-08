const fs = require('fs');
const path = '/Users/hritikshukla/Desktop/synapse ka bhosda/SYNAPSE-AI/public/framer/index.html';
let html = fs.readFileSync(path, 'utf8');

const cssStart = html.indexOf('#custom-static-nav {');
const cssEnd = html.indexOf('</style>', cssStart);

const newCSS = `nav:not(#custom-static-nav) { display: none !important; }

#custom-static-nav {
    position: fixed !important;
    top: 32px !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
    background: transparent !important;
}
#custom-static-nav > div {
    pointer-events: auto !important;
}
#custom-static-nav a {
    transition: opacity 0.2s;
}
#custom-static-nav a:hover {
    opacity: 0.7;
}
`;

html = html.substring(0, cssStart) + newCSS + html.substring(cssEnd);

fs.writeFileSync(path, html);
console.log("Applied absolute centering!");
