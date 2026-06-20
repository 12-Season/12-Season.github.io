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

/* ===== 패널 스크롤 애니메이션 (오른쪽에서 날아옴 / 위로 오버랩되며 사라짐) ===== */
(function (global) {
  var reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = [].slice.call(document.querySelectorAll(".about-panel .panel-content"));
  if (!items.length) return;
  if (reduce) { items.forEach(function (c) { c.style.opacity = 1; }); return; }

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var ticking = false;

  function update() {
    var vh = global.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var cy = r.top + r.height / 2;
      var t = (cy - vh / 2) / (vh / 2);     // -1(위) … 0(중앙) … +1(아래)
      var k = clamp((Math.abs(t) - 0.18) / 0.72, 0, 1);  // 중앙 근처는 또렷, 멀수록 사라짐
      var tx = 0, ty = 0;
      if (t > 0) tx = k * 90;               // 아래에 있으면 오른쪽에서 날아옴
      else ty = -k * 50;                    // 위로 지나가면 위로 오버랩되며 사라짐
      c.style.opacity = (1 - k).toFixed(3);
      c.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px)";
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { global.requestAnimationFrame(update); ticking = true; } }

  global.addEventListener("scroll", onScroll, { passive: true });
  global.addEventListener("resize", onScroll);
  update();
})(window);
