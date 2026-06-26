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
/* 패널 스크롤 애니메이션은 reveal.js, 이미지 확대는 zoom.js 로 분리되었습니다. */

/* ===== 대표 연구 성과: 최근 5년(작년까지) TVT/TCOM/JSAC/TWC 논문 중 5편을 무작위로 (월 단위 고정) ===== */
(function (global) {
  var P = global.Pubs;
  var mount = document.getElementById("highlightList");
  if (!mount || !P) return;

  var SRC = "journal_international";   // TVT/TCOM/JSAC/TWC = IEEE 국제 저널
  var VENUES = [/vehicular technology/i, /selected areas in communications/i, /wireless communications/i, /transactions on communications/i];
  var N = 5;
  var now = new Date(), Y = now.getFullYear(), minY = Y - 5, maxY = Y - 1;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function year(r) { var d = (r.date || r.added || "").match(/(\d{4})/); return d ? d[1] : ""; }
  function cite(r) {
    var doi = (r.doi || "").trim(), url = (r.url || "").trim();
    var href = doi ? "https://doi.org/" + doi : url;
    var titleHtml = href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(r.title || "") + "</a>" : esc(r.title || "");
    var v = r.journal || "", y = year(r);
    return (r.author ? esc(r.author) + ", " : "") + '"' + titleHtml + '," ' +
      (v ? "<em>" + esc(v) + "</em>" : "") + (y ? (v ? ", " : "") + esc(y) : "") + ".";
  }
  // 시드 기반 난수(월이 바뀌면 다른 결과) — mulberry32
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  fetch("data/" + SRC + ".csv", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.text() : ""; })
    .then(function (t) {
      var rows = t ? P._rowsToObjects(P._parseCSV(t)) : [];
      var seen = {}, pool = [];
      rows.forEach(function (r) {
        var j = r.journal || "", title = (r.title || "").trim();
        if (!title || (r.status || "").toLowerCase() === "draft") return;
        if (!VENUES.some(function (re) { return re.test(j); })) return;
        var y = parseInt(year(r), 10);
        if (!(y >= minY && y <= maxY)) return;
        var k = title.toLowerCase();
        if (seen[k]) return; seen[k] = 1; pool.push(r);
      });
      if (!pool.length) { mount.innerHTML = ""; return; }
      // 월(YYYYMM) 시드로 셔플 → 한 달 동안 동일, 다음 달에 변경
      var rand = rng(Y * 100 + (now.getMonth() + 1));
      for (var i = pool.length - 1; i > 0; i--) { var j2 = Math.floor(rand() * (i + 1)); var tmp = pool[i]; pool[i] = pool[j2]; pool[j2] = tmp; }
      mount.innerHTML = pool.slice(0, N).map(function (r) { return "<li>" + cite(r) + "</li>"; }).join("");
    })
    .catch(function () { mount.innerHTML = ""; });
})(window);
