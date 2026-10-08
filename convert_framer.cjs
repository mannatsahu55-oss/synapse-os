const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../synapse-os-frontend');
const destPagesDir = path.join(__dirname, 'src', 'views', 'FramerPages');
const destCssFile = path.join(__dirname, 'src', 'framer-styles.css');

if (!fs.existsSync(destPagesDir)) {
  fs.mkdirSync(destPagesDir, { recursive: true });
}

// Ensure CSS file is fresh
fs.writeFileSync(destCssFile, '/* Extracted Framer Styles */\n');

function extractStyles(html) {
  let css = '';
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1] + '\n';
  }
  return css;
}

function extractBody(html) {
  const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  const match = bodyRegex.exec(html);
  return match ? match[1] : '';
}

function processHtmlFile(filename) {
  const htmlPath = path.join(srcDir, filename);
  if (!fs.existsSync(htmlPath)) return;

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Extract styles ONLY from index.html to prevent duplication, assuming shared styles
  if (filename === 'index.html') {
    const styles = extractStyles(htmlContent);
    fs.appendFileSync(destCssFile, styles);
  }

  let bodyContent = extractBody(htmlContent);
  // Optional: Escape backticks and ${} to prevent template string issues
  bodyContent = bodyContent.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

  // Create component name (e.g. about.html -> AboutPage)
  const basename = filename.replace('.html', '');
  const componentName = basename === 'index' 
    ? 'FramerIndex'
    : basename.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Page';

  const reactCode = `import React, { useEffect, useRef } from 'react';

export default function ${componentName}() {
  const containerRef = useRef(null);

  useEffect(() => {
    // React's dangerouslySetInnerHTML does not execute <script> tags.
    // We manually find and re-inject them to trigger Framer's JS.
    if (containerRef.current) {
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }, []);

  return (
    <div 
      className="framer-page-container w-full h-full" 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: \`${bodyContent}\` }} 
    />
  );
}
`;

  const destFile = path.join(destPagesDir, `${componentName}.jsx`);
  fs.writeFileSync(destFile, reactCode);
  console.log(`Created ${componentName}.jsx`);
}

const files = [
  'index.html',
  'about.html',
  'acceptable-use.html',
  'careers.html',
  'case-studies.html',
  'contact.html',
  'privacy-policy.html',
  'terms-and-conditions.html'
];

files.forEach(processHtmlFile);
console.log('Done!');
