/**
 * telemetry.js
 *
 * Drop this on any page (same script works across all your subdomains).
 * It auto-detects the subdomain + path from the browser and pings the
 * telemetry backend once per page load.
 *
 * Usage:
 *   <script src="https://www.mj46.in/js/telemetry.js"></script>
 *
 * The API endpoint is fixed below — no per-site configuration needed.
 */
(function () {
  "use strict";

  var TELEMETRY_ENDPOINT = "https://api.mj46.in/api/v1/telemetry/";

  function getScriptConfig() {
    return {
      endpoint: TELEMETRY_ENDPOINT,
    };
  }

  function resolveSubdomain(hostname) {
    // blog.mj46.in -> "blog", mj46.in -> "www", 127.0.0.1 -> "localhost", localhost -> "localhost"
    if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return "localhost";
    }
    var parts = hostname.split(".");
    if (parts.length <= 2) {
      return "www";
    }
    return parts[0];
  }

  function resolvePath() {
    // Normalize trailing slashes so "/blog" and "/blog/" count as the same path
    var path = window.location.pathname || "/";
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path;
  }

  function sendVisit(config) {
    var payload = {
      subdomain: resolveSubdomain(window.location.hostname),
      path: resolvePath(),
    };

    fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // required so the visitor cookie is sent/stored
      body: JSON.stringify(payload),
      keepalive: true, // lets the request finish even if the user navigates away
    }).catch(function () {
      // Fail silently — telemetry should never break the page.
      console.error("Telemetry ping failed");
    });
  }

  var config = getScriptConfig();

  if (document.readyState === "complete" || document.readyState === "interactive") {
    sendVisit(config);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      sendVisit(config);
    });
  }
})();