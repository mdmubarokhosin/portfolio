/**
 * minimatch-bridge — CVE-2026-118764 security shim
 * ----------------------------------------------------------------
 * Why this exists:
 *   - minimatch below 11.0.1 has a DoS vulnerability (CVE-2026-118764).
 *   - The npm "overrides" entry in the ROOT package.json forces every
 *     minimatch dependency in the tree to THIS bridge.
 *   - This bridge wraps the patched minimatch 11.0.3+ (aliased here as
 *     "minimatch-real") and exposes it through the legacy v3-style API:
 *
 *       const minimatch = require("minimatch");  // returns a CALLABLE function
 *       minimatch(path, globPattern);             // direct call        (v3 style)
 *       minimatch.minimatch(path, globPattern);   // named export call  (v9+ style)
 *       new minimatch.Minimatch(pattern);         // class              (both styles)
 *
 *   Older ESLint plugins (react, jsx-a11y, import) call the required
 *   module directly, while newer code (typescript-eslint, at-slash-eslint)
 *   uses named properties — this shim satisfies both simultaneously.
 *
 * Removal:
 *   When eslint-config-next ships plugins that depend on minimatch 11+
 *   natively, delete this folder and the "overrides" block in the root
 *   package.json, then run "npm install" again.
 */

"use strict";

const mm = require("minimatch-real");

// Callable facade — direct `minimatch(pattern, path)` calls land here.
const bridge = function (path, pattern, options) {
  return mm.minimatch(path, pattern, options);
};

// Copy every named export from minimatch 11 onto the callable:
//   Minimatch, escape, unescape, GLOBSTAR, sep, filter, match,
//   braceExpand, defaults, minimatch (the function itself)
Object.assign(bridge, mm);

// v3-style: `require("minimatch").minimatch` also resolved to a callable.
// Named-access consumers (typescript-estree) call `.minimatch(...)` too.
bridge.minimatch = bridge;

module.exports = bridge;
