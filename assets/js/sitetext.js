/* ==========================================================================
   LIT @ KAIST — 사이트 자유 텍스트 (admin 편집 가능)
   data/site_text.csv (key,ko,en) 를 읽어, data-st="key" 요소의
   data-ko / data-en 를 채운 뒤 현재 언어로 렌더합니다.
   CSV에 키가 없으면 HTML에 적힌 기존 문구(폴백)를 그대로 사용합니다.
   ========================================================================== */
(function (global) {
  var P = global.Pubs;
  if (!document.querySelector("[data-st]") || !P) return;

  function applyText() {
    fetch("data/site_text.csv", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (t) {
        if (!t) return;
        var map = {};
        P._rowsToObjects(P._parseCSV(t)).forEach(function (r) {
          var k = (r.key || "").trim();
          if (k) map[k] = { ko: (r.ko || "").trim(), en: (r.en || "").trim() };
        });
        Array.prototype.forEach.call(document.querySelectorAll("[data-st]"), function (el) {
          var m = map[el.getAttribute("data-st")];
          if (!m) return;
          if (m.ko) el.setAttribute("data-ko", m.ko);
          if (m.en) el.setAttribute("data-en", m.en);
        });
        if (global.LitI18n) global.LitI18n.apply(global.LitI18n.get());
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyText);
  else applyText();
})(window);
