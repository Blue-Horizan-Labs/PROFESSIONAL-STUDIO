/* Targeted pricing integration: preserves the original page layout and visual design. */
(function () {
  "use strict";
  var plans = window.PROFESSIONAL_STUDIO_PLANS;
  if (!plans) {
    console.error("Professional Studio plan catalog could not be loaded.");
    return;
  }
  function money(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
  }
  document.querySelectorAll("[data-plan]").forEach(function (card) {
    var id = card.getAttribute("data-plan");
    var plan = plans[id];
    if (!plan) return;
    var price = card.querySelector("[data-plan-price]");
    if (price) price.textContent = money(plan.price);
    var button = card.querySelector(".button-plan");
    if (button) button.href = "/auth/signup.html?plan=" + encodeURIComponent(id);
  });
  // Keep general signup calls on a known default plan, without overriding plan-card selections.
  document.querySelectorAll('a[href*="signup.html"]:not(.button-plan)').forEach(function (link) {
    var url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (!url.searchParams.has("plan")) url.searchParams.set("plan", "starter");
    link.href = url.pathname + url.search + url.hash;
  });
})();
