#!/usr/bin/env node

// Browser smoke test - catches asset loading and DOM issues
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

let serverProcess;
const PORT = 4174; // Different from default to avoid conflicts

function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', ['./web/server.js'], {
      cwd: ROOT,
      env: { ...process.env, PORT: PORT.toString() },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('running at')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', reject);

    // Timeout after 5 seconds
    setTimeout(() => reject(new Error('Server startup timeout')), 5000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function fetchText(path) {
  const url = `http://localhost:${PORT}${path}`;

  // Simple HTTP client without dependencies
  return new Promise((resolve, reject) => {
    import('http').then(({ default: http }) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(3000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log('Starting integration tests...\n');

  try {
    await startServer();
    console.log('✓ Server started successfully\n');

    // Test main page loads
    await test('Main page loads without errors', async () => {
      const response = await fetchText('/web/');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (!response.body.includes('WFHroulette')) {
        throw new Error('Page missing title');
      }
    });

    // Test HTML structure
    await test('HTML contains required elements', async () => {
      const response = await fetchText('/web/');
      const html = response.body;

      const requiredElements = [
        'id="seed"',           // Seed input
        'id="date"',           // Date input
        'id="pick"',           // Button
        'id="result"',         // Result container
        'Pick my WFH day'      // Button text
      ];

      for (const element of requiredElements) {
        if (!html.includes(element)) {
          throw new Error(`Missing required element: ${element}`);
        }
      }
    });

    // Test script loading path
    await test('JavaScript module loads correctly', async () => {
      const response = await fetchText('/web/');
      const html = response.body;

      // Check script tag path
      if (!html.includes('src="/web/app.js"')) {
        throw new Error('Script tag missing correct path /web/app.js');
      }

      // Verify script is actually accessible
      const scriptResponse = await fetchText('/web/app.js');
      if (scriptResponse.status !== 200) {
        throw new Error(`Script not accessible: ${scriptResponse.status}`);
      }

      if (!scriptResponse.body.includes('pickWFHDay')) {
        throw new Error('Script missing expected function imports');
      }
    });

    // Test utility module accessibility
    await test('Utility modules accessible via HTTP', async () => {
      const response = await fetchText('/src/util.js');
      if (response.status !== 200) {
        throw new Error(`util.js not accessible: ${response.status}`);
      }

      const requiredFunctions = ['pickWFHDay', 'pickReason', 'formatDay'];
      for (const fn of requiredFunctions) {
        if (!response.body.includes(`export function ${fn}`)) {
          throw new Error(`Missing exported function: ${fn}`);
        }
      }
    });

    // Test reasons.json accessibility
    await test('Reasons data accessible', async () => {
      const response = await fetchText('/reasons.json');
      if (response.status !== 200) {
        throw new Error(`reasons.json not accessible: ${response.status}`);
      }

      try {
        const reasons = JSON.parse(response.body);
        if (!Array.isArray(reasons) || reasons.length === 0) {
          throw new Error('Invalid reasons format');
        }

        if (!reasons[0].includes('espresso')) {
          throw new Error('Missing expected reason content');
        }
      } catch (e) {
        throw new Error(`Invalid JSON in reasons.json: ${e.message}`);
      }
    });

    // Test CSS and styling
    await test('Stylesheet and styling present', async () => {
      const response = await fetchText('/web/');
      const html = response.body;

      if (!html.includes('<style>') || !html.includes('</style>')) {
        throw new Error('Missing inline styles');
      }

      const requiredStyles = ['.card', 'button', '.result'];
      for (const style of requiredStyles) {
        if (!html.includes(style)) {
          throw new Error(`Missing CSS rule: ${style}`);
        }
      }
    });

    // Test security - no XSS vulnerabilities in output
    await test('No XSS vulnerabilities in static content', async () => {
      const response = await fetchText('/web/');
      const html = response.body;

      // Check for potential XSS vectors
      const dangerousPatterns = [
        'innerHTML.*\\${',     // Template literals in innerHTML
        'eval\\(',            // eval usage
        'document\\.write\\(' // document.write
      ];

      for (const pattern of dangerousPatterns) {
        const regex = new RegExp(pattern);
        if (regex.test(html)) {
          throw new Error(`Potential XSS pattern found: ${pattern}`);
        }
      }
    });

    console.log('\nAll integration tests passed! ✅');

  } finally {
    stopServer();
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

runTests().catch((error) => {
  console.error('Integration test failed:', error);
  stopServer();
  process.exit(1);
});