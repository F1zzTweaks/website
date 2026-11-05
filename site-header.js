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
