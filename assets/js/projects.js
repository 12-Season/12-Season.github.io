/* ==========================================================================
   LIT @ KAIST — Research Projects (Current / Past 토글)
   - Past : data/projects_past.csv (과제명,지원기관,시작,종료,종료연도,원본상태)
            → 종료연도별로 묶은 간결한 목록
   - Current : data/projects.csv (status,title,title_en,period,agency,role,...)
            → status=current 항목 목록
   ========================================================================== */
(function (global) {
  var P = global.Pubs;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function lang() { return global.LitI18n ? global.LitI18n.get() : "ko"; }

  // 각 탭의 데이터 소스 + 표준 형태로 변환
  var SOURCES = {
    current: {
      csv: "data/projects.csv",
      rows: function (recs) {
        return recs
          .filter(function (r) { return (r.status || "").trim().toLowerCase() === "current" && (r.title || "").trim(); })
          .map(function (r) {
            var title = lang() === "en" ? (r.title_en || r.title) : r.title;
            var y = (r.period || "").match(/(\d{4})\s*$/);
            return { title: (title || "").trim(), agency: (r.agency || "").trim(),
                     period: (r.period || "").trim(), year: y ? y[1] : "", url: (r.url || "").trim() };
          });
      },
    },
    past: {
      csv: "data/projects_past.csv",
      rows: function (recs) {
        return recs
          .filter(function (r) { return (r["과제명"] || "").trim(); })
          .map(function (r) {
            var s = (r["시작"] || "").trim(), e = (r["종료"] || "").trim();
            var period = s && e ? s + "–" + e : (e || s || "");
            return { title: (r["과제명"] || "").trim(), agency: (r["지원기관"] || "").trim(),
                     period: period, year: (r["종료연도"] || "").trim(), url: "" };
          });
      },
    },
  };

  function init(cfg) {
    var mount = document.getElementById(cfg.mount);
    var tabsEl = document.getElementById(cfg.tabsEl);
    var cache = {};
    var active = cfg.default || "current";
    var TABS = [
      { key: "current", ko: "진행 중", en: "Current" },
      { key: "past", ko: "완료", en: "Past" },
    ];

    buildTabs();
    var hash = location.hash.replace(/^#/, "");
    setActive(TABS.some(function (t) { return t.key === hash; }) ? hash : active);
    document.addEventListener("lit:lang", function () { buildTabs(); render(); });

    function buildTabs() {
      var en = lang() === "en";
      tabsEl.innerHTML = "";
      TABS.forEach(function (t) {
        var b = document.createElement("button");
        b.className = "tab" + (t.key === active ? " active" : "");
        b.type = "button";
        b.textContent = en ? t.en : t.ko;
        b.addEventListener("click", function () { setActive(t.key); });
        tabsEl.appendChild(b);
      });
    }

    function setActive(key) {
      active = key;
      Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (b, i) {
        b.classList.toggle("active", TABS[i].key === key);
      });
      render();
      if (history.replaceState) history.replaceState(null, "", "#" + key);
    }

    function itemHtml(p) {
      var meta = [p.agency, p.period].filter(function (x) { return (x || "").trim(); }).join(" · ");
      var title = p.url
        ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>"
        : esc(p.title);
      return '<li class="proj-item"><span class="pi-title">' + title + "</span>" +
        (meta ? '<span class="pi-meta">' + esc(meta) + "</span>" : "") + "</li>";
    }

    function render() {
      var src = SOURCES[active];
      mount.innerHTML = '<p class="muted" style="padding:24px 0">불러오는 중…</p>';
      var done = function (list) {
        if (!list.length) {
          mount.innerHTML = '<p class="muted" style="padding:28px 0">' +
            (lang() === "en" ? "No projects yet." : "등록된 과제가 없습니다.") + "</p>";
          return;
        }
        // 종료연도(year) 내림차순 그룹
        var years = [];
        list.forEach(function (p) { if (p.year && years.indexOf(p.year) < 0) years.push(p.year); });
        years.sort(function (a, b) { return b - a; });
        var html = "";
        years.forEach(function (y) {
          var items = list.filter(function (p) { return p.year === y; });
          html += '<section class="proj-year-group"><h2 class="year">' + esc(y) +
            ' <span class="year-count">' + items.length + "</span></h2>" +
            '<ul class="proj-list">' + items.map(itemHtml).join("") + "</ul></section>";
        });
        var noyear = list.filter(function (p) { return !p.year; });
        if (noyear.length) html += '<ul class="proj-list">' + noyear.map(itemHtml).join("") + "</ul>";
        mount.innerHTML = html;
        if (global.LitReveal) global.LitReveal.observe(mount.querySelectorAll(".reveal"));
      };

      if (cache[active]) { done(src.rows(cache[active])); return; }
      fetch(src.csv, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (t) {
          cache[active] = t ? P._rowsToObjects(P._parseCSV(t)) : [];
          done(src.rows(cache[active]));
        })
        .catch(function () { done([]); });
    }
  }

  global.Projects = { init: init };
})(window);
