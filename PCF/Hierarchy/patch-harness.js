/**
 * Patches pcf-start's index.html to include React 18 platform libraries.
 * 
 * pcf-start's test harness has a bug where the FeatureManager defaults
 * pcfReactPlatformLibraries to "off" and cannot read featureconfig.json
 * at runtime in the browser (fs is shimmed to empty).
 * This script injects the React 18 and Fluent UI scripts directly.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'node_modules', 'pcf-start', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('[patch-harness] pcf-start not installed yet, skipping.');
  process.exit(0);
}

const html = fs.readFileSync(indexPath, 'utf8');

if (html.includes('react_18_3_1.js')) {
  console.log('[patch-harness] Already patched, skipping.');
  process.exit(0);
}

const patched = '<!doctype html><html><head>' +
  '<meta charset="UTF-8"/>' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>PCF Control Sandbox</title>' +
  '<script src="lib/react_18_3_1.js"></script>' +
  '<script>' +
    'window.React = window.Reactv18;' +
    'window.ReactDOM = window.ReactDOMv18;' +
    'window["Reactv16"] = window.Reactv18;' +
    'window["ReactDOMv16"] = window.ReactDOMv18;' +
  '</script>' +
  '<script src="lib/fluent_8_121_1.js"></script>' +
  '<script defer="defer" src="harness.js"></script>' +
  '</head><body><div id="app-root"></div></body></html>';

fs.writeFileSync(indexPath, patched, 'utf8');
console.log('[patch-harness] Patched pcf-start index.html with React 18 platform libraries.');
