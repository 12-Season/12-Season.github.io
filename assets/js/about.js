/* ==========================================================================
   LIT @ KAIST — About 페이지 동적 요소
   연구실 현황 인원수를 people_members.csv 에서 계산(방문연구원 제외)해
   #labStatus 에 채웁니다. 언어 토글 시 다시 그립니다.
   ========================================================================== */
(function (global) {
  var P = global.Pubs;
  // 표시 순서 + 한/영 라벨
  var ORDER = [
    { v: "박사", ko: "박사과정", en: "Ph.D." },
    { v: "석사", ko: "석사과정", en: "M.S." },
    { v: "박사후", ko: "박사후연구원", en: "Postdoc" },
    { v: "연구원", ko: "연구원", en: "Researcher" },
  ];
  var counts = null;
  function lang() { return global.LitI18n ? global.LitI18n.get() : "ko"; }

  function load() {
    fetch("data/people_members.csv", { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var rows = P._rowsToObjects(P._parseCSV(t))
          .filter(function (x) { return ((x.name_english || "") + (x.name_korean || "")).trim(); })
          .filter(function (x) { return (x["학위"] || "").trim() !== "방문연구원"; });
        var by = {};
        rows.forEach(function (x) { var d = (x["학위"] || "").trim() || "기타"; by[d] = (by[d] || 0) + 1; });
        counts = { by: by, total: rows.length };
        paint();
        document.addEventListener("lit:lang", paint);
      })
      .catch(function () { var el = document.getElementById("labStatus"); if (el) el.textContent = "—"; });
  }

  function paint() {
    var el = document.getElementById("labStatus");
    if (!el || !counts) return;
    var en = lang() === "en", seen = {}, parts = [];
    ORDER.forEach(function (o) {
      if (counts.by[o.v]) { seen[o.v] = 1; parts.push(en ? counts.by[o.v] + " " + o.en : o.ko + " " + counts.by[o.v] + "명"); }
    });
    Object.keys(counts.by).forEach(function (k) {
      if (!seen[k]) parts.push(en ? counts.by[k] + " " + k : k + " " + counts.by[k] + "명");
    });
    var total = en ? " (" + counts.total + " total)" : " (총 " + counts.total + "명)";
    el.textContent = parts.join(" · ") + total;
    el.classList.remove("muted");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})(window);
/* 패널 스크롤 애니메이션은 reveal.js 로 일반화되었습니다 (.panel .panel-content). */

/* ===== 연구 분야 figure 클릭 시 크게 보기 (라이트박스) ===== */
(function (global) {
  function setup() {
    var imgs = document.querySelectorAll(".ra-fig");
    if (!imgs.length) return;
    var lb;
    function ensure() {
      if (lb) return;
      lb = document.createElement("div");
      lb.className = "lightbox";
      lb.setAttribute("aria-hidden", "true");
      lb.innerHTML =
        '<button class="lb-close" type="button" aria-label="닫기">&times;</button>' +
        '<figure class="lb-figure"><img class="lb-img" alt=""></figure>';
      document.body.appendChild(lb);
      lb.querySelector(".lb-close").addEventListener("click", close);
      lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lb.getAttribute("aria-hidden") === "false") close();
      });
    }
    function open(src, alt) {
      ensure();
      var im = lb.querySelector(".lb-img"); im.src = src; im.alt = alt || "";
      lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    }
    function close() {
      if (!lb) return;
      lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      lb.querySelector(".lb-img").src = "";
    }
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener("click", function () { open(img.src, img.alt); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();
})(window);
