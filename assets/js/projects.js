/* ==========================================================================
   LIT @ KAIST — Research Projects (Current / Past 토글)
   data/projects.csv: status(current|past), title, title_en, period, agency,
   role, description, description_en, url
   ========================================================================== */
(function (global) {
  var P = global.Pubs;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function lang() { return global.LitI18n ? global.LitI18n.get() : "ko"; }
  function pick(r, f) {
    if (lang() === "en") return (r[f + "_en"] || "").trim() || r[f] || "";
    return r[f] || "";
  }

  function init(cfg) {
    var mount = document.getElementById(cfg.mount);
    var tabsEl = document.getElementById(cfg.tabsEl);
    var rows = [];
    var active = "current";
    var TABS = [
      { key: "current", ko: "진행 중", en: "Current" },
      { key: "past", ko: "완료", en: "Past" },
    ];

    mount.innerHTML = '<p class="muted" style="padding:24px 0">불러오는 중…</p>';

    fetch(cfg.csv, { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        rows = P._rowsToObjects(P._parseCSV(t)).filter(function (x) { return (x.title || "").trim(); });
        buildTabs();
        var hash = location.hash.replace(/^#/, "");
        setActive(TABS.some(function (t) { return t.key === hash; }) ? hash : "current");
        document.addEventListener("lit:lang", function () { render(); buildTabs(); });
      })
      .catch(function (e) {
        mount.innerHTML = '<div class="error">프로젝트를 불러오지 못했습니다. 로컬에서는 ' +
          "<code>python3 -m http.server</code> 로 열어주세요.<br>" + esc(e.message) + "</div>";
      });

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

    function card(r) {
      var meta = [pick(r, "period"), pick(r, "agency"), pick(r, "role")]
        .filter(function (x) { return (x || "").trim(); }).join(" · ");
      var url = (r.url || "").trim();
      return (
        '<article class="proj-card reveal">' +
          '<h3 class="proj-title">' + esc(pick(r, "title")) + "</h3>" +
          (meta ? '<div class="proj-meta">' + esc(meta) + "</div>" : "") +
          (pick(r, "description") ? '<p class="proj-desc">' + esc(pick(r, "description")) + "</p>" : "") +
          (url ? '<a class="proj-link" href="' + esc(url) + '" target="_blank" rel="noopener">' +
            (lang() === "en" ? "Details →" : "자세히 →") + "</a>" : "") +
        "</article>"
      );
    }

    function render() {
      var list = rows.filter(function (r) { return (r.status || "").trim().toLowerCase() === active; });
      if (!list.length) {
        var msg = lang() === "en" ? "No projects yet." : "등록된 프로젝트가 없습니다.";
        mount.innerHTML = '<p class="muted" style="padding:28px 0">' + msg + "</p>";
        return;
      }
      mount.innerHTML = '<div class="proj-grid">' + list.map(card).join("") + "</div>";
      if (global.LitReveal) global.LitReveal.observe(mount.querySelectorAll(".reveal"));
    }
  }

  global.Projects = { init: init };
})(window);
