const fs = require('fs');

const path = '/Users/hritikshukla/Desktop/synapse ka bhosda/SYNAPSE-AI/public/framer/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Force the #custom-static-nav CSS to be bulletproof
const cssOld = /#custom-static-nav \{[^}]+\}/;
const cssNew = `#custom-static-nav {
    position: fixed !important;
    top: 16px !important;
    left: 0 !important;
    width: 100vw !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
}
#custom-static-nav > div {
    pointer-events: auto !important;
}`;
html = html.replace(cssOld, cssNew);

// Hide all framer navs completely to prevent duplication/overlap
const hideFramer = `
#main nav[data-framer-name="Large"],
#main nav[data-framer-name="Medium"],
#main nav[data-framer-name="Small Menu Closed"],
.framer-sfzdwg-container nav {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
}
</style>
`;
html = html.replace('</style>', hideFramer);

// 2. Rewrite the HTML for #custom-static-nav
const navStart = html.indexOf('<nav id="custom-static-nav">');
const navEnd = html.indexOf('</nav>', navStart) + 6;

const navHTML = `<nav id="custom-static-nav">
  <div style="display: grid; grid-template-columns: 100px auto 100px; align-items: center; gap: 24px;">
    <a href="./about" style="justify-self: end; color: #545454; font-family: sans-serif; font-size: 13px; letter-spacing: 0.01em; text-decoration: none; font-weight: 500;">
      [About]
    </a>
    <a href="./" aria-label="Home" style="justify-self: center; display: grid; grid-template-columns: 10px 10px; gap: 2px; width: 22px; height: 22px; text-decoration: none;">
      <div style="background-color: black; border-radius: 4px; width: 10px; height: 10px;"></div>
      <div style="background-color: black; border-radius: 4px; width: 10px; height: 10px;"></div>
      <div style="background-color: black; border-radius: 4px; width: 10px; height: 10px;"></div>
      <div style="background-color: black; border-radius: 4px; width: 10px; height: 10px;"></div>
    </a>
    <a href="./#pricing" style="justify-self: start; color: #545454; font-family: sans-serif; font-size: 13px; letter-spacing: 0.01em; text-decoration: none; font-weight: 500;">
      [Pricing]
    </a>
  </div>
</nav>`;

html = html.substring(0, navStart) + navHTML + html.substring(navEnd);

fs.writeFileSync(path, html);
console.log("Applied bulletproof centering!");
