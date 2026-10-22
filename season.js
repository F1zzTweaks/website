/* ╔═════════════════════════════════════════════════════════════════════════════╗
   ║  SEASONAL THEMES  –  matches the app automatically                          ║
   ║    Halloween   1 – 31 October       orange + purple, bats, spooky lights    ║
   ║    Christmas   1 Nov – 6 Jan   red + green, cozy snow, drift, warm glow     ║
   ║  Change MODE below to force one or switch it off:                           ║
   ║    "auto"  (follows the date)   "halloween"   "christmas"   "off"           ║
   ║  To preview without editing: add ?season=halloween (or christmas / off)     ║
   ║  to the end of any page address.                                            ║
   ╚═════════════════════════════════════════════════════════════════════════════╝ */
(function () {
  var MODE = "auto";

  function bySeasonDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    if (m === 10) return "halloween";
    if (m === 11 || m === 12 || (m === 1 && day <= 6)) return "christmas";
    return "off";
  }

  var season = MODE === "auto" ? bySeasonDate(new Date()) : MODE;
  try {
    var q = new URLSearchParams(location.search).get("season");
    if (q === "halloween" || q === "christmas" || q === "off") season = q;
  } catch (e) {}
  window.F1zzSeason = season;
  window.F1zzRecolor = function (s) { return s; };
  if (season !== "halloween" && season !== "christmas") return;

  /* ---------- colours: every purple / pink shade on the page is re-hued ----------
     Greys, greens and ambers are left alone. Halloween keeps dark purples (spooky)
     and turns bright purples orange; Christmas turns purples red, pinks green and
     the purple-tinted darks into a deep pine. */
  var XMAS = season === "christmas";
  function rehue(r, g2, b) {
    r /= 255; g2 /= 255; b /= 255;
    var mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2, h = 0, sat = 0, d = mx - mn;
    if (d) {
      sat = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g2 - b) / d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r) / d + 2 : (r - g2) / d + 4;
      h *= 60;
    }
    if (sat < .08 || h < 230 || h >= 345) return null;           // not purple / pink
    var pink = h >= 300;
    if (!XMAS) {
      if ((l < .30 && !pink) || sat < .35 || l > .82) return null;  // dark purples + soft text stay
      h = pink ? 272 : 26; if (!pink) sat = Math.max(sat, .9);
    } else if (l < .30 || sat < .3 || l > .86) {
      h = 160; sat = Math.min(sat, l > .86 ? .3 : .38);             // backgrounds, muted text, near-white
    } else if (pink) { h = 145; sat = .62; l = Math.min(l, .46); }
    else { h = 354; sat = Math.min(Math.max(sat, .72), .84); l = Math.min(l, .58); }
    function f(n) {
      var k = (n + h / 30) % 12, a = sat * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    }
    return [f(0), f(8), f(4)];
  }
  var rx = /#([0-9a-f]{6})(?![0-9a-f])|(rgba?\(\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi;
  function recolor(s) {
    return String(s).replace(rx, function (m, hex, pre, r, g2, b) {
      if (hex) {
        var n = parseInt(hex, 16), c = rehue(n >> 16, (n >> 8) & 255, n & 255);
        return c ? "#" + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1) : m;
      }
      var c2 = rehue(+r, +g2, +b);
      return c2 ? pre + c2[0] + "," + c2[1] + "," + c2[2] : m;
    });
  }
  window.F1zzRecolor = recolor;

  // <style> blocks in <head> (this script runs right after them, before anything is drawn)
  var styles = document.querySelectorAll("style");
  for (var i = 0; i < styles.length; i++) styles[i].textContent = recolor(styles[i].textContent);
  document.documentElement.setAttribute("data-season", season);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", recolor(meta.getAttribute("content") || ""));

  // inline style="" attributes in the page body
  function recolorInline() {
    var els = document.querySelectorAll("[style]");
    for (var j = 0; j < els.length; j++) {
      var st = els[j].getAttribute("style"), ns = recolor(st);
      if (ns !== st) els[j].setAttribute("style", ns);
    }
  }

  /* ---------- effects: lights along the top, snow or bats drifting down ---------- */
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HALLOWEEN = season === "halloween";
  var BULBS = HALLOWEEN ? ["#ff7a14", "#a24cf0", "#7dff6a", "#ffb43c", "#c070ff"]
                        : ["#ff3b4b", "#2fd47a", "#ffd23c", "#4aa8ff", "#ff7ad0"];
  var WIRE = HALLOWEEN ? "rgba(40,24,56,.95)" : "rgba(20,46,30,.95)";

  function start() {
    recolorInline();
    var cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:60";
    document.body.appendChild(cv);
    var g = cv.getContext("2d"), W = 0, H = 0, dpr = 1, parts = [], t0 = performance.now();

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = reduce ? 0 : HALLOWEEN ? (W < 700 ? 4 : 8) : (W < 700 ? 40 : 90);
      while (parts.length < want) parts.push(spawn(true));
      parts.length = want;
    }
    function spawn(anywhere) {
      return HALLOWEEN
        ? { x: Math.random() * W, y: anywhere ? Math.random() * H : -40, s: 13 + Math.random() * 12,
            vx: (Math.random() < .5 ? -1 : 1) * (.25 + Math.random() * .45), vy: .12 + Math.random() * .25,
            ph: Math.random() * 6.28, fl: 7 + Math.random() * 4 }
        : (Math.random() < .1
          ? { x: Math.random() * W, y: anywhere ? Math.random() * H : -14, r: 5 + Math.random() * 4, crystal: true,
              vy: .45 + Math.random() * .35, ph: Math.random() * 6.28, a: .55 + Math.random() * .35,
              rot: Math.random() * 6.28, spin: (Math.random() - .5) * .02 }
          : { x: Math.random() * W, y: anywhere ? Math.random() * H : -8, r: .8 + Math.random() * 2.6,
              vy: .3 + Math.random() * .9, ph: Math.random() * 6.28, a: .35 + Math.random() * .55 });
    }

    function lights(t) {
      var gap = W < 700 ? 34 : 42, n = Math.ceil(W / gap) + 1, top = 1, sag = 7;
      g.lineWidth = 1.6; g.strokeStyle = WIRE; g.beginPath();
      for (var k = 0; k < n; k++) {
        var x0 = k * gap, x1 = x0 + gap;
        if (k === 0) g.moveTo(x0, top);
        g.quadraticCurveTo(x0 + gap / 2, top + sag * 2, x1, top);
      }
      g.stroke();
      for (var b = 0; b < n; b++) {
        var bx = b * gap + gap / 2, by = top + sag + 1, col = BULBS[b % BULBS.length];
        var tw = reduce ? 1 : .55 + .45 * Math.sin(t / 520 + b * 1.7);
        var glow = g.createRadialGradient(bx, by + 5, 0, bx, by + 5, 16);
        glow.addColorStop(0, hexA(col, .55 * tw)); glow.addColorStop(1, hexA(col, 0));
        g.fillStyle = glow; g.beginPath(); g.arc(bx, by + 5, 16, 0, 6.29); g.fill();
        g.fillStyle = "rgba(30,30,34,.95)"; g.fillRect(bx - 2.2, by - 2, 4.4, 3.5);
        g.fillStyle = hexA(col, .55 + .45 * tw);
        g.beginPath(); g.ellipse(bx, by + 5.5, 3.6, 5.2, 0, 0, 6.29); g.fill();
        g.fillStyle = "rgba(255,255,255," + (.35 * tw) + ")";
        g.beginPath(); g.ellipse(bx - 1.1, by + 4, 1, 1.8, 0, 0, 6.29); g.fill();
      }
    }

    function bat(p, t) {
      var s = p.s, cx = p.x, cy = p.y, f = Math.sin(t / 1000 * p.fl + p.ph), tip = -.55 * s * f;
      var glow = g.createRadialGradient(cx, cy, 0, cx, cy, s * 1.5);
      glow.addColorStop(0, "rgba(255,150,60,.22)"); glow.addColorStop(1, "rgba(255,150,60,0)");
      g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, s * 1.5, 0, 6.29); g.fill();
      g.fillStyle = "rgba(122,80,174,.95)";
      [-1, 1].forEach(function (sd) {
        g.beginPath();
        g.moveTo(cx + sd * .18 * s, cy - .10 * s);
        g.lineTo(cx + sd * .55 * s, cy + tip * .6 - .15 * s);
        g.lineTo(cx + sd * 1.10 * s, cy + tip);
        g.lineTo(cx + sd * .92 * s, cy + tip * .5 + .22 * s);
        g.lineTo(cx + sd * .70 * s, cy + tip * .35 + .10 * s);
        g.lineTo(cx + sd * .52 * s, cy + tip * .25 + .26 * s);
        g.lineTo(cx + sd * .32 * s, cy + .12 * s);
        g.lineTo(cx + sd * .18 * s, cy + .16 * s);
        g.closePath(); g.fill();
      });
      g.beginPath(); g.ellipse(cx, cy + .04 * s, .2 * s, .3 * s, 0, 0, 6.29); g.fill();
      g.beginPath(); g.arc(cx, cy - .33 * s, .17 * s, 0, 6.29); g.fill();
      g.beginPath(); g.moveTo(cx - .15 * s, cy - .40 * s); g.lineTo(cx - .11 * s, cy - .62 * s); g.lineTo(cx - .03 * s, cy - .44 * s); g.fill();
      g.beginPath(); g.moveTo(cx + .15 * s, cy - .40 * s); g.lineTo(cx + .11 * s, cy - .62 * s); g.lineTo(cx + .03 * s, cy - .44 * s); g.fill();
      g.fillStyle = "#ffa028";
      var er = Math.max(1, .05 * s);
      g.beginPath(); g.arc(cx - .08 * s, cy - .36 * s, er, 0, 6.29); g.arc(cx + .08 * s, cy - .36 * s, er, 0, 6.29); g.fill();
    }

    function crystal(p) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
      g.strokeStyle = "rgba(240,248,255," + p.a + ")"; g.lineWidth = 1.3; g.lineCap = "round";
      g.beginPath();
      for (var k = 0; k < 6; k++) {
        g.moveTo(0, 0); g.lineTo(0, -p.r);
        g.moveTo(0, -p.r * .55); g.lineTo(-p.r * .28, -p.r * .8);
        g.moveTo(0, -p.r * .55); g.lineTo(p.r * .28, -p.r * .8);
        g.rotate(Math.PI / 3);
      }
      g.stroke(); g.restore();
    }

    // Christmas: warm firelight from the bottom corners + a snow drift that builds up along the bottom
    var pile = reduce ? 1 : .35, bumps = [];
    function cozy(t) {
      var rad = Math.max(W, H) * .55;
      [0, W].forEach(function (cx) {
        var gl = g.createRadialGradient(cx, H, 0, cx, H, rad);
        gl.addColorStop(0, "rgba(255,160,70,.18)"); gl.addColorStop(1, "rgba(255,140,60,0)");
        g.fillStyle = gl; g.fillRect(cx - rad, H - rad, rad * 2, rad);
      });
      pile = reduce ? 1 : Math.min(1, .35 + t / 30000);              // fills up over ~20 seconds
      var cols = Math.ceil(W / 6) + 2;
      if (bumps.length !== cols) {
        var p1 = Math.random() * 6, p2 = Math.random() * 6; bumps = [];
        for (var i = 0; i < cols; i++) bumps.push(.62 + .22 * Math.sin(i * .11 + p1) + .12 * Math.sin(i * .37 + p2));
      }
      var maxH = (W < 700 ? 16 : 26) * pile;
      if (maxH < .5) return;
      g.beginPath(); g.moveTo(-2, H + 2);
      for (var j = 0; j < cols; j++) g.lineTo(j * 6, H - bumps[j] * maxH);
      g.lineTo(W + 2, H + 2); g.closePath();
      var sg = g.createLinearGradient(0, H - maxH, 0, H);
      sg.addColorStop(0, "rgba(250,252,255,.97)"); sg.addColorStop(1, "rgba(196,214,236,.92)");
      g.fillStyle = sg; g.fill();
      for (var k = 3; k < cols; k += 11) {
        var a = (.5 + .5 * Math.sin(t / 450 + k)) * pile;
        g.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        g.fillRect(k * 6 - 1, H - bumps[k] * maxH + 2, 2, 2);
      }
    }

    function frame(now) {
      var t = now - t0;
      g.clearRect(0, 0, W, H);
      if (!HALLOWEEN) cozy(t);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (HALLOWEEN) {
          p.x += p.vx; p.y += p.vy + Math.sin(t / 900 + p.ph) * .35;
          if (p.y > H + 40 || p.x < -60 || p.x > W + 60) { parts[i] = spawn(false); continue; }
          bat(p, t);
        } else {
          p.y += p.vy; p.x += Math.sin(t / 1600 + p.ph) * .35;
          if (p.y > H + 8) { parts[i] = spawn(false); continue; }
          if (p.crystal) { p.rot += p.spin; crystal(p); continue; }
          if (p.r > 2.4) {                                   // nearer flakes get a soft halo
            g.fillStyle = "rgba(220,235,255," + (p.a * .18) + ")";
            g.beginPath(); g.arc(p.x, p.y, p.r * 2, 0, 6.29); g.fill();
          }
          g.fillStyle = "rgba(255,255,255," + p.a + ")";
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill();
        }
      }
      lights(t);
      if (!reduce) requestAnimationFrame(frame);
    }

    size();
    addEventListener("resize", function () { size(); if (reduce) frame(performance.now()); });
    if (reduce) frame(performance.now()); else requestAnimationFrame(frame);
  }

  function hexA(h, a) {
    var n = parseInt(h.slice(1), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a.toFixed(3) + ")";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
