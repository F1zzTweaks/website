/* Lets visitors see F1zz prices in their own currency. Prices are set in USD (site-settings.js).
   Other currencies are estimates from a free daily rate list. If it can't be reached, prices just stay in USD. */
(function () {
  "use strict";
  var CHOICE = "f1zzCurrency", CACHE = "f1zzRates", FRESH = 12 * 3600 * 1000, KEEP = 7 * 24 * 3600 * 1000;
  var RATES_URL = "https://open.er-api.com/v6/latest/USD";
  var prices = [].slice.call(document.querySelectorAll("[data-price]"));
  if (!prices.length || !window.SITE) return;

  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  var picked = /^[A-Z]{3}$/.test(read(CHOICE) || "") ? read(CHOICE) : "USD";
  var data = null;

  function amount(el) { return parseFloat(String(SITE[el.dataset.price] || "").replace(/[^0-9.]/g, "")); }

  function money(usd, code) {
    var value = usd * data.rates[code];
    var digits = value >= 100 ? 0 : 2;
    try {
      return new Intl.NumberFormat("en", { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    } catch (e) {
      return code + " " + value.toFixed(digits);
    }
  }

  function show() {
    var usdOnly = picked === "USD" || !data || !data.rates[picked];
    prices.forEach(function (el) {
      var usd = amount(el);
      el.style.fontSize = "";
      el.style.letterSpacing = "";
      if (usdOnly || isNaN(usd)) {
        el.textContent = SITE[el.dataset.price];
        el.removeAttribute("title");
        return;
      }
      var text = "≈" + money(usd, picked);
      el.textContent = text;
      el.title = SITE[el.dataset.price] + " USD";
      // big headline prices get smaller when the number is long, so they stay on the card
      var size = parseFloat(getComputedStyle(el).fontSize);
      if (text.length > 8 && size >= 24) {
        el.style.fontSize = Math.max(22, size * (text.length > 11 ? 0.56 : 0.66)) + "px";
        el.style.letterSpacing = "-.5px";
      }
    });
    var note = document.getElementById("curNote");
    if (note) note.hidden = usdOnly;
  }

  function nameOf(code) {
    try { return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) || code; } catch (e) { return code; }
  }

  function addPicker() {
    var spot = document.querySelector(".sx-head") || document.querySelector(".pd-pricerow") || document.querySelector(".teaser-side");
    if (!spot) return;

    var style = document.createElement("style");
    style.textContent =
      ".cur-box{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;color:var(--muted,#a9a6bb);font-size:.86rem}" +
      ".sx-head .cur-box{justify-content:center;margin-top:18px}" +
      ".pd-pricerow .cur-box,.teaser-side .cur-box{flex-basis:100%}" +
      ".cur-wrap{position:relative;width:min(280px,100%);text-align:left}" +
      ".cur-btn{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:38px;padding:8px 12px;border-radius:9px;border:1px solid var(--stroke2,#2b3b5e);background:var(--panel2,#111c32);color:var(--text,#eef3ff);font:inherit;cursor:pointer}" +
      ".cur-btn span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}" +
      ".cur-btn::after{content:'';flex:none;width:7px;height:7px;margin:-3px 3px 0 0;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}" +
      ".cur-panel{position:absolute;left:0;top:calc(100% + 6px);z-index:100;width:100%;min-width:260px;max-width:calc(100vw - 32px);padding:8px;border:1px solid var(--stroke2,#2b3b5e);border-radius:11px;background:var(--panel,#0d1526);box-shadow:0 18px 44px -14px rgba(0,0,0,.85)}" +
      ".cur-panel[hidden]{display:none}" +
      ".cur-search{display:block;width:100%;min-height:36px;margin-bottom:6px;padding:7px 10px;border-radius:8px;border:1px solid var(--stroke,#1d2a44);background:var(--panel2,#111c32);color:var(--text,#eef3ff);font:inherit}" +
      ".cur-search::placeholder{color:var(--muted,#97a5c0)}" +
      ".cur-list{max-height:250px;overflow-y:auto;scrollbar-width:thin}" +
      ".cur-opt{display:block;width:100%;padding:8px 10px;border:0;border-radius:7px;background:none;color:var(--text,#eef3ff);font:inherit;text-align:left;cursor:pointer}" +
      ".cur-opt:hover,.cur-opt:focus-visible{background:var(--panel2,#111c32);outline:0}" +
      ".cur-opt[aria-selected=true]{color:var(--blue2,#84acff);font-weight:600}" +
      ".cur-opt[hidden]{display:none}" +
      ".cur-none{padding:10px;color:var(--muted,#97a5c0)}" +
      ".cur-btn:focus-visible,.cur-search:focus-visible{outline:2px solid var(--blue2,#84acff);outline-offset:1px}" +
      ".cur-box small{flex-basis:100%;font-size:.76rem;line-height:1.45}" +
      ".cur-box a{color:inherit;text-decoration:underline}";
    document.head.appendChild(style);

    var box = document.createElement("div");
    box.className = "cur-box";

    var label = document.createElement("span");
    label.id = "curLabel";
    label.textContent = "Show prices in";

    var codes = Object.keys(data.rates).filter(function (k) { return /^[A-Z]{3}$/.test(k) && k !== "USD"; })
      .map(function (k) { return { code: k, name: nameOf(k) }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });
    var all = [{ code: "USD", name: "US Dollar" }].concat(codes);
    var nameFor = function (code) { return code + " \u00b7 " + (all.filter(function (x) { return x.code === code; })[0] || { name: code }).name; };

    var wrap = document.createElement("div");
    wrap.className = "cur-wrap";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "curBtn";
    btn.className = "cur-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-labelledby", "curLabel curBtnText");
    var btnText = document.createElement("span");
    btnText.id = "curBtnText";
    btn.appendChild(btnText);

    var panel = document.createElement("div");
    panel.className = "cur-panel";
    panel.hidden = true;

    var search = document.createElement("input");
    search.type = "search";
    search.className = "cur-search";
    search.placeholder = "Search currencies";
    search.setAttribute("aria-label", "Search currencies");
    search.autocomplete = "off";

    var list = document.createElement("div");
    list.className = "cur-list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-labelledby", "curLabel");

    var none = document.createElement("div");
    none.className = "cur-none";
    none.textContent = "No currency found.";
    none.hidden = true;

    var items = all.map(function (x) {
      var o = document.createElement("button");
      o.type = "button";
      o.className = "cur-opt";
      o.setAttribute("role", "option");
      o.dataset.code = x.code;
      o.dataset.find = (x.code + " " + x.name).toLowerCase();
      o.textContent = x.code + " \u00b7 " + x.name;
      list.appendChild(o);
      return o;
    });
    list.appendChild(none);
    panel.appendChild(search);
    panel.appendChild(list);
    wrap.appendChild(btn);
    wrap.appendChild(panel);

    function mark() {
      if (!data.rates[picked]) picked = "USD";
      btnText.textContent = nameFor(picked);
      items.forEach(function (o) { o.setAttribute("aria-selected", o.dataset.code === picked ? "true" : "false"); });
    }
    function filter() {
      var q = search.value.trim().toLowerCase(), found = false;
      items.forEach(function (o) {
        o.hidden = q.length > 0 && o.dataset.find.indexOf(q) < 0;
        if (!o.hidden) found = true;
      });
      none.hidden = found;
    }
    function shut(back) {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (back) btn.focus();
    }
    function open() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      search.value = "";
      filter();
      var now = list.querySelector('[aria-selected="true"]');
      list.scrollTop = now ? now.offsetTop - list.offsetTop - 60 : 0;
      search.focus();
    }
    function shown() { return items.filter(function (o) { return !o.hidden; }); }

    btn.addEventListener("click", function () { panel.hidden ? open() : shut(true); });
    search.addEventListener("input", filter);
    list.addEventListener("click", function (e) {
      var o = e.target.closest ? e.target.closest(".cur-opt") : null;
      if (!o) return;
      picked = o.dataset.code;
      write(CHOICE, picked);
      mark();
      show();
      shut(true);
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target === search) {
        e.preventDefault();
        var first = shown()[0];
        if (first) first.click();
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      var v = shown(), i = v.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { if (v.length) v[Math.min(i + 1, v.length - 1)].focus(); }
      else if (i <= 0) search.focus();
      else v[i - 1].focus();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) shut(true); });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) shut(false); });
    mark();

    var note = document.createElement("small");
    note.id = "curNote";
    note.hidden = true;
    var day = data.time ? new Date(data.time * 1000).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }) : "";
    note.textContent = "Estimate" + (day ? " using " + day + " rates" : "") + ". Plans are priced in USD, so your bank or checkout sets the final amount. ";

    var credit = document.createElement("small");
    var link = document.createElement("a");
    link.href = "https://www.exchangerate-api.com";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Rates By Exchange Rate API";
    credit.appendChild(link);

    box.appendChild(label);
    box.appendChild(wrap);
    box.appendChild(note);
    box.appendChild(credit);
    spot.appendChild(box);
  }

  function ready(found) {
    data = found;
    addPicker();
    show();
  }

  function usable(d) {
    return d && d.rates && typeof d.rates === "object" && d.rates.EUR > 0;
  }

  var saved = null;
  try { saved = JSON.parse(read(CACHE) || "null"); } catch (e) {}
  if (!usable(saved)) saved = null;
  if (saved && Date.now() - saved.saved < FRESH) return ready(saved);

  fetch(RATES_URL).then(function (r) { return r.json(); }).then(function (j) {
    if (j.result !== "success" || !usable(j)) throw new Error("no rates");
    var clean = {};
    Object.keys(j.rates).forEach(function (c) { if (typeof j.rates[c] === "number" && j.rates[c] > 0) clean[c] = j.rates[c]; });
    var fresh = { rates: clean, time: j.time_last_update_unix, saved: Date.now() };
    write(CACHE, JSON.stringify(fresh));
    ready(fresh);
  }).catch(function () {
    // a recent saved list is still a fair estimate; otherwise prices simply stay in USD with no picker
    if (saved && Date.now() - saved.saved < KEEP) ready(saved);
  });
})();
