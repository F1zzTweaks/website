/* Every "Download F1zz Tweaks" button opens the download page in a new tab. The file itself is only offered there, after the agreement. */
(function () {
  var links = document.querySelectorAll('a[data-need="downloadUrl"][data-ready]');
  links.forEach(function (a) {
    a.href = "download";
    a.removeAttribute("download");
    a.target = "_blank";
    a.rel = "noopener";
  });
  // runs before each page's own download click handlers, so they don't start the file or show "starting"
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[data-need="downloadUrl"][data-ready]');
    if (a) e.stopPropagation();
  }, true);
})();

/* The phone menu button, and the Support link from site-settings.js */
(function () {
  var button = document.querySelector(".site-menu"), nav = document.getElementById("site-nav");
  if (!button || !nav) return;
  function set(open) {
    nav.classList.toggle("open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }
  button.addEventListener("click", function () { set(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  var invite = window.SITE && (window.SITE.discordInvite || "").trim();
  if (invite && /^https:\/\//i.test(invite)) nav.querySelector("[data-support]").href = invite;
})();
