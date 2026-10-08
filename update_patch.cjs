const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'node_modules', 'n8n-editor-ui', 'dist', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = htmlContent.match(/(<script type="text\/javascript">\s*\/\/\s*Dynamic Brand Replacer[\s\S]*?<\/script>)/);
if (!scriptMatch) {
    console.error('Script not found');
    process.exit(1);
}

let scriptBlock = scriptMatch[1];
scriptBlock = scriptBlock.replace(/`/g, '\\`').replace(/\$/g, '\\$');

const patchPath = path.join(__dirname, 'patch-n8n.cjs');
let patchContent = fs.readFileSync(patchPath, 'utf8');

const injectionCode = `
            if (filePath.endsWith('index.html')) {
                const injectedScript = \`${scriptBlock}
<style>
  [data-test-id*="templates"], [data-test-id*="insights"], [data-test-id*="help"], a[href*="/templates"], a[href*="/insights"] { display: none !important; }
</style>
\`;
                if (!content.includes('Dynamic Brand Replacer')) {
                    content = content.replace(/<\\/body>/i, injectedScript + '\\n</body>');
                    modified = true;
                }
            }
`;

patchContent = patchContent.replace('let modified = false;', 'let modified = false;\n' + injectionCode);

fs.writeFileSync(patchPath, patchContent, 'utf8');
console.log('Patch script updated successfully!');
