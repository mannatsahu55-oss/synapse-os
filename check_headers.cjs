const https = require('https');

// Follow redirects manually to see the chain
function checkRedirects(url, depth = 0) {
  const options = new URL(url);
  const req = https.get({
    hostname: options.hostname,
    path: options.pathname,
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }
  }, (res) => {
    console.log(`[${depth}] ${url}`);
    console.log(`    Status: ${res.statusCode}`);
    
    // Print security headers
    const secHeaders = ['content-security-policy', 'x-frame-options', 'x-content-type-options', 'location', 'set-cookie'];
    for (const h of secHeaders) {
      if (res.headers[h]) {
        console.log(`    ${h}: ${res.headers[h]}`);
      }
    }
    
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      let next = res.headers.location;
      if (next.startsWith('/')) {
        next = `https://${options.hostname}${next}`;
      }
      checkRedirects(next, depth + 1);
    }
  });
  req.on('error', (e) => console.error('Error:', e.message));
}

checkRedirects('https://synapse-os-server-production.up.railway.app/');
