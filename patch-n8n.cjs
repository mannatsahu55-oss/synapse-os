const fs = require('fs');
const path = require('path');

// The exact SVG string for the knot logo the user provided
const SYNAPSE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M100 20 C140 20, 180 60, 180 100 C180 140, 140 180, 100 180 C60 180, 20 140, 20 100 C20 60, 60 20, 100 20 Z" stroke="none" />
  <path d="M100 20 C140 20, 140 100, 100 100 C60 100, 60 20, 100 20" fill="none" />
  <path d="M100 180 C140 180, 140 100, 100 100 C60 100, 60 180, 100 180" fill="none" />
  <path d="M20 100 C20 60, 100 60, 100 100 C100 140, 20 140, 20 100" fill="none" />
  <path d="M180 100 C180 60, 100 60, 100 100 C100 140, 180 140, 180 100" fill="none" />
</svg>`;

// We search for the n8n-editor-ui dist directory
const searchPaths = [
    path.join(__dirname, 'node_modules', 'n8n', 'node_modules', 'n8n-editor-ui', 'dist'),
    path.join(__dirname, 'node_modules', 'n8n-editor-ui', 'dist'),
    path.join(__dirname, 'node_modules', 'n8n', 'dist', 'public'),
    path.join(__dirname, 'node_modules', '@n8n', 'design-system', 'dist'),
    // Paths for inside the official n8n Docker image
    '/usr/local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist',
    '/usr/local/lib/node_modules/n8n/dist/public',
    '/usr/local/lib/node_modules/n8n/node_modules/@n8n/design-system/dist'
];

let targetDirs = [];
for (const p of searchPaths) {
    if (fs.existsSync(p)) {
        targetDirs.push(p);
    }
}

if (targetDirs.length === 0) {
    console.error("Could not find n8n-editor-ui compiled assets. Skipping patch.");
    process.exit(0);
}

console.log(`Found n8n UI directories at: \n${targetDirs.join('\n')}`);

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

// Targeted string replacements to avoid breaking variables!
const replacements = [
    { regex: /<title>.*<\/title>/gi, replace: "<title>Synapse OS</title><script>localStorage.setItem('n8n-theme', 'light');</script><style>a[href*=\"/templates\"], a[href*=\"/insights\"], [data-test-id*=\"templates\"], [data-test-id*=\"insights\"], [data-test-id*=\"help\"], a[href*=\"https://docs.n8n.io\"] { display: none !important; }</style>" },
    { regex: />\s*Welcome to n8n\s*</gi, replace: ">Welcome to Synapse<" },
    { regex: /title: *"n8n"/gi, replace: 'title:"Synapse"' },
    { regex: /title: *'n8n'/gi, replace: "title:'Synapse'" },
    { regex: />\s*n8n\s*</gi, replace: ">Synapse<" },
    { regex: /alt="n8n"/gi, replace: 'alt="Synapse"' },
    { regex: /"n8n"/gi, replace: '"Synapse"' },
    { regex: />\s*n8n API\s*</gi, replace: ">Synapse API<" },
    { regex: /'n8n'/gi, replace: "'Synapse'" },
    { regex: /n8n API/gi, replace: "Synapse API" }
];

targetDirs.forEach(targetDir => {
    console.log(`Patching directory: ${targetDir}`);
    
    walkDir(targetDir, (filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            if (filePath.endsWith('index.html')) {
                const injectedScript = `<script type="text/javascript">
			// Dynamic Brand Replacer (Synapse OS)
			const SYNAPSE_SVG = '<svg class="synapse-injected-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; margin: auto; display: block; margin-bottom: 20px;"><path d="M100 20 C140 20, 180 60, 180 100 C180 140, 140 180, 100 180 C60 180, 20 140, 20 100 C20 60, 60 20, 100 20 Z" stroke="none" /><path d="M100 20 C140 20, 140 100, 100 100 C60 100, 60 20, 100 20" fill="none" /><path d="M100 180 C140 180, 140 100, 100 100 C60 100, 60 180, 100 180" fill="none" /><path d="M20 100 C20 60, 100 60, 100 100 C100 140, 20 140, 20 100" fill="none" /><path d="M180 100 C180 60, 100 60, 100 100 C100 140, 180 140, 180 100" fill="none" /></svg>';
			
            const ITEMS_TO_HIDE = [
                'External Secrets', 'Environments', 'Project roles', 'SSO', 
                'Security & policies', 'LDAP', 'Log Streaming', 'Community nodes',
                'Templates', 'Insights', 'Help'
            ];

			function replaceBranding(node) {
				if (node.nodeType === Node.TEXT_NODE) {
                    let text = node.nodeValue;
                    let trimmedText = text.trim();

					if (text.match(/n8n/i)) {
						node.nodeValue = text.replace(/n8n/gi, 'Synapse');
					}
                    
                    // Hide specific settings tabs and sidebar items without breaking layout!
                    if (ITEMS_TO_HIDE.includes(trimmedText)) {
                        let el = node.parentElement;
                        let target = null;
                        while(el && el.tagName !== 'BODY') {
                            let tag = el.tagName;
                            let role = el.getAttribute ? el.getAttribute('role') : '';
                            let cls = (el.className && typeof el.className === 'string') ? el.className : '';
                            
                            // Find the outermost element that represents the menu row (to include the icon)
                            if (tag === 'LI' || tag === 'A' || role === 'menuitem' || cls.includes('menu-item') || cls.includes('sidebar-item')) {
                                target = el;
                            }
                            el = el.parentElement;
                        }
                        
                        if (target) {
                            target.style.display = 'none';
                        } else if (node.parentElement && node.parentElement.parentElement) {
                            // Safe fallback: hide the wrapper that usually contains the icon and text
                            node.parentElement.parentElement.style.display = 'none';
                        }
                    }

                    if (text.includes('Upgrade to access') || text.includes('Upgrade to unlock') || text.includes('Upgrade')) {
                        let el = node.parentElement;
                        // Hide the upgrade blocks
                        if (el && text.includes('Upgrade to')) {
                            while(el && el.tagName !== 'BODY') {
                                if (el.tagName === 'DIV' && (el.className.includes('card') || el.className.includes('box') || el.className.includes('wrapper') || el.className.includes('container'))) {
                                    el.style.display = 'none';
                                    break;
                                }
                                el = el.parentElement;
                            }
                        }
                    }
				} else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Hide any button containing the exact text 'Upgrade'
                    if ((node.tagName === 'BUTTON' || node.tagName === 'A') && node.textContent.trim() === 'Upgrade') {
                        node.style.display = 'none';
                    }
                    
					if (node.tagName.toLowerCase() === 'svg' && !node.classList.contains('synapse-injected-logo')) {
						if (node.classList.contains('n8n-logo') || node.classList.contains('logo') || (node.closest && node.closest('.logo-container'))) {
							node.outerHTML = SYNAPSE_SVG;
							return;
						}
					}
					if (node.tagName.toLowerCase() === 'img') {
						if (node.src && (node.src.includes('logo') || node.src.includes('n8n'))) {
							node.outerHTML = SYNAPSE_SVG;
							return;
						}
					}
					// Only iterate if it's not our newly injected SVG
					if (!node.classList || !node.classList.contains('synapse-injected-logo')) {
						node.childNodes.forEach(replaceBranding);
					}
				}
			}
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						replaceBranding(node);
					});
				});
			});

            function scanForLogos() {
                // The ultimate foolproof check using the exact data-test-id from the DOM
                document.querySelectorAll('[data-test-id="n8n-logo"]').forEach(container => {
                    if (!container.querySelector('.synapse-injected-logo')) {
                        container.innerHTML = SYNAPSE_SVG;
                    }
                });

                // Aggressively hide items even if the sidebar is collapsed (text is missing)
                document.querySelectorAll('a, li, [role="menuitem"], .menu-item, .sidebar-item').forEach(el => {
                    let text = el.textContent || '';
                    let title = el.getAttribute('title') || '';
                    let aria = el.getAttribute('aria-label') || '';
                    let testId = el.getAttribute('data-test-id') || '';
                    let href = el.href || '';
                    
                    let match = ITEMS_TO_HIDE.some(item => {
                        let lowerItem = item.toLowerCase();
                        let kebabItem = lowerItem.replace(/\s+/g, '-');
                        
                        return text.toLowerCase().trim() === lowerItem || 
                               title.toLowerCase().trim() === lowerItem || 
                               aria.toLowerCase().trim() === lowerItem ||
                               testId === \`menu-item-\${kebabItem}\` ||
                               testId === \`sidebar-item-\${kebabItem}\` ||
                               testId.includes(kebabItem) ||
                               href.toLowerCase().endsWith(\`/\${kebabItem}\`) ||
                               href.toLowerCase().includes(\`/\${kebabItem}?\`);
                    });
                    
                    if (match) {
                        el.style.display = 'none';
                    }
                });

                // Variables under maintenance
                if (window.location.href.includes('variables')) {
                    let targetContainer = null;
                    
                    // Hide the variables table/content
                    document.querySelectorAll('table, .list-container, [data-test-id="variables-list"], [data-test-id="empty-resources-list"], .empty-state').forEach(el => {
                        el.style.display = 'none';
                        if (!targetContainer) targetContainer = el.parentElement;
                    });
                    
                    // Hide the create button AND its dropdown caret if it's a split button
                    document.querySelectorAll('button').forEach(btn => {
                        if (btn.textContent.includes('Create variable')) {
                            let group = btn.closest('.el-button-group');
                            if (group) {
                                group.style.display = 'none';
                            } else if (btn.parentElement && btn.parentElement.children.length <= 2 && btn.parentElement.tagName === 'DIV') {
                                btn.parentElement.style.display = 'none';
                            } else {
                                btn.style.display = 'none';
                            }
                        }
                    });
                    
                    // Show maintenance message
                    if (targetContainer) {
                        if (!document.getElementById('synapse-maintenance')) {
                            let msg = document.createElement('div');
                            msg.id = 'synapse-maintenance';
                            msg.innerHTML = '<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height: 300px; width: 100%; max-width: 600px; margin: 40px auto; border: 1px solid #333; border-radius: 12px; background: rgba(0,0,0,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.2);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6D55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><h2 style="color: #FF6D55; font-size: 22px; font-weight: 600; font-family: system-ui, sans-serif; margin: 0;">Under Maintenance</h2><p style="color: #999; font-family: system-ui, sans-serif; margin-top: 12px; font-size: 15px;">The Variables feature is currently being upgraded. Please check back later.</p></div>';
                            targetContainer.appendChild(msg);
                        }
                    } else {
                        // Fallback absolute positioning if we can't find the table container yet
                        let main = document.querySelector('main') || document.body;
                        if (!document.getElementById('synapse-maintenance-absolute')) {
                            let msg = document.createElement('div');
                            msg.id = 'synapse-maintenance-absolute';
                            msg.style.position = 'absolute';
                            msg.style.top = '380px';
                            msg.style.left = '50%';
                            msg.style.transform = 'translateX(-50%)';
                            msg.style.width = '100%';
                            msg.style.maxWidth = '600px';
                            msg.style.zIndex = '100';
                            msg.innerHTML = '<div style="display:flex; flex-direction:column; justify-content:center; align-items:center; padding: 50px 20px; border: 1px solid #333; border-radius: 12px; background: #1a1a1a; box-shadow: 0 12px 32px rgba(0,0,0,0.4);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6D55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><h2 style="color: #FF6D55; font-size: 22px; font-weight: 600; font-family: system-ui, sans-serif; margin: 0;">Under Maintenance</h2><p style="color: #aaa; font-family: system-ui, sans-serif; margin-top: 12px; font-size: 15px;">The Variables feature is currently being upgraded. Please check back later.</p></div>';
                            main.appendChild(msg);
                        }
                    }
                } else {
                    let msg1 = document.getElementById('synapse-maintenance');
                    let msg2 = document.getElementById('synapse-maintenance-absolute');
                    if (msg1) msg1.remove();
                    if (msg2) msg2.remove();
                }

                // Hide the dashboard metrics/statistics bar
                document.querySelectorAll('div').forEach(el => {
                    let text = el.textContent || '';
                    if (text.includes('Prod. executions') && text.includes('Failure rate') && text.includes('Time saved')) {
                        // Ensure we aren't hiding a high-level page wrapper
                        if (!text.includes('Workflows') && !text.includes('Credentials')) {
                            el.style.display = 'none';
                        }
                    }
                });
            }

			document.addEventListener("DOMContentLoaded", () => {
				replaceBranding(document.body);
				observer.observe(document.body, { childList: true, subtree: true });
                setInterval(scanForLogos, 100);
			});
		</script>
<style>
  [data-test-id*="templates"], [data-test-id*="insights"], [data-test-id*="help"], a[href*="/templates"], a[href*="/insights"] { display: none !important; }
</style>
`;
                if (!content.includes('Dynamic Brand Replacer')) {
                    content = content.replace(/<\/body>/i, injectedScript + '\n</body>');
                    modified = true;
                }
            }


            // Apply text branding replacements
            replacements.forEach(r => {
                const newContent = content.replace(r.regex, r.replace);
                if (newContent !== content) {
                    content = newContent;
                    modified = true;
                }
            });

            // Patch the inline SVG logos in the JS bundles
            if (content.includes('d="M32 17.587V57h')) { 
                content = content.replace(/<svg[^>]*>.*?<\/svg>/g, (match) => {
                    if (match.includes('d="M32 17.587V57h')) {
                        return SYNAPSE_LOGO_SVG;
                    }
                    return match;
                });
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`[PATCHED] ${path.basename(filePath)}`);
            }
        }
    });
});

// --- BACKEND SECURITY PATCH FOR IFRAME EMBEDDING ---
const serverJsPaths = [
    path.join(__dirname, 'node_modules', 'n8n', 'dist', 'server.js'),
    path.join(__dirname, 'node_modules', 'n8n', 'dist', 'Server.js'),
    '/usr/local/lib/node_modules/n8n/dist/server.js',
    '/usr/local/lib/node_modules/n8n/dist/Server.js'
];

serverJsPaths.forEach(p => {
    if (fs.existsSync(p)) {
        console.log('Patching n8n backend security headers in:', p);
        let content = fs.readFileSync(p, 'utf8');
        let modified = false;

        if (content.includes("{ action: 'sameorigin' }")) {
            content = content.replace(/{ action: 'sameorigin' }/g, 'false');
            modified = true;
        }

        if (content.includes("contentSecurityPolicy: (0, isEmpty_1.default)(cspDirectives)")) {
            content = content.replace(/contentSecurityPolicy: \(0, isEmpty_1\.default\)\(cspDirectives\)/g, 'contentSecurityPolicy: false');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(p, content, 'utf8');
            console.log('[PATCHED] Backend security headers disabled successfully!');
        }
    }
});

console.log("n8n Deep Patching Complete! All UI strings branded to Synapse.");
