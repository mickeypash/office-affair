'use strict';
/* Privacy-first analytics: a few anonymous events sent straight to PostHog's capture API (no PostHog script).
   - Sends only on the live site (https://mickey.sh). Off for file://, local servers and CI, off for automated
     browsers (navigator.webdriver: Playwright, Puppeteer, Selenium, many bots), and off when the browser sends
     Do Not Track or Global Privacy Control.
   - To leave your own visits out, run this once in the browser's developer console:
       localStorage.setItem('officeAffair.analytics', 'off')     (remove the key to turn it back on)
   - Stores nothing: no cookies, no localStorage. The visit id lives in memory, so every page load is a new
     anonymous visitor, and events never create person profiles.
   - Never sends names (not even the "Make your own" name), only story ids, built-in character ids and numbers.
   - Every event has app: 'office-affair', so it can be told apart from other sites in the same PostHog project.
   ?analytics=debug records events in analytics.log without sending them (for tests). */
const ANALYTICS = {
  host: 'https://us.i.posthog.com',
  key: 'phc_iKkiCxcbMn2olG1BTRxxQhK7LYmWtrZH6dzzKJw5h9C',   // a PostHog project token is public by design: it ships in every page that uses it
  liveHosts: ['mickey.sh'],
};

/* Browser, OS and device type from the user agent, as PostHog names them ($browser, $os, $device_type). */
function uaProps(ua) {
  const browser = /Edg\//.test(ua) ? 'Microsoft Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /Firefox\/|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'Mac OS X'
    : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chrome OS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const device = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? 'Tablet' : /Mobi|iPhone|iPod|Android/.test(ua) ? 'Mobile' : 'Desktop';
  return { $browser: browser, $os: os, $device_type: device, $raw_user_agent: ua };
}

/* A random id (UUID v4), and a time-ordered one (UUID v7) for PostHog's session id. */
const rndHex = n => Array.from(crypto.getRandomValues(new Uint8Array(Math.ceil(n / 2))), b => b.toString(16).padStart(2, '0')).join('').slice(0, n);
const uuid4 = () => (crypto.randomUUID ? crypto.randomUUID() : `${rndHex(8)}-${rndHex(4)}-4${rndHex(3)}-a${rndHex(3)}-${rndHex(12)}`);
const uuid7 = () => { const t = Date.now().toString(16).padStart(12, '0'); return `${t.slice(0, 8)}-${t.slice(8)}-7${rndHex(3)}-8${rndHex(3)}-${rndHex(12)}`; };

const analytics = {
  log: [],   // the last events (also in production; in memory only)
  debug: new URLSearchParams(location.search).get('analytics') === 'debug',
  visitor: uuid4(), session: uuid7(),
  rounds: 0, roundStart: 0,
  /* Should this page send events? optedOut = this browser turned analytics off in the console. */
  enabledFor(loc, nav, win, optedOut = false) {
    const dnt = nav.doNotTrack === '1' || nav.doNotTrack === 'yes' || win.doNotTrack === '1' || nav.msDoNotTrack === '1';
    return loc.protocol === 'https:' && ANALYTICS.liveHosts.includes(loc.hostname) && !dnt && nav.globalPrivacyControl !== true
      && nav.webdriver !== true && !optedOut;
  },
  get optedOut() { try { return localStorage.getItem('officeAffair.analytics') === 'off'; } catch (e) { return false; } },
  get enabled() { return this.enabledFor(location, navigator, window, this.optedOut); },
  track(event, props = {}) {
    if (!this.enabled && !this.debug) return;
    const ref = (() => { try { return document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { return ''; } })();
    const body = {
      api_key: ANALYTICS.key, event, distinct_id: this.visitor, timestamp: new Date().toISOString(),
      properties: {
        app: 'office-affair', story: STORY.id, ...props,
        $process_person_profile: false, $session_id: this.session, $lib: 'office-affair',
        $current_url: location.origin + location.pathname, $host: location.hostname, $pathname: location.pathname,
        $referring_domain: ref || '$direct', ...uaProps(navigator.userAgent),
        device: matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse',
        viewport: `${Math.round(innerWidth / 100) * 100}x${Math.round(innerHeight / 100) * 100}`,
      },
    };
    this.log.push(body); if (this.log.length > 50) this.log.shift();
    if (this.debug || !this.enabled) return;
    try {
      fetch(ANALYTICS.host + '/i/v0/e/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true, credentials: 'omit' }).catch(() => {});
    } catch (e) { /* analytics must never break the game */ }
  },
  /* Game hooks */
  roundStarted() {
    this.rounds++; this.roundStart = performance.now();
    const girl = cast.pick === 'custom' ? 'custom' : cast.pick;   // a built-in id, never the custom name
    this.track('round_start', { round: this.rounds, girl, guy: cast.guy && cast.guy.id ? cast.guy.id : 'random' });
  },
  roundEnded(r) {
    const props = {
      round: this.rounds, result: r.kind, seconds: Math.round((performance.now() - this.roundStart) / 1000),
      time_left: Math.max(0, Math.ceil(r.timeLeft)), caught: r.strikes, romance: Math.floor(r.romance),
    };
    if (r.kind === 'win') Object.assign(props, { ending: r.ending, score_band: Math.floor(r.score / 500) * 500, new_best: !!r.newBest });
    this.track('round_end', props);
  },
};
analytics.track('$pageview');
