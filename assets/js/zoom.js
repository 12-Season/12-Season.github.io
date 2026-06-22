/* ==========================================================================
   LIT @ KAIST — 이미지 클릭 확대 (공용 라이트박스)
   대상: .ra-fig (About 연구분야) · .rt-img img (홈 연구 토글) · .md-body img (프로젝트 상세)
   이벤트 위임이라 동적으로 추가된 이미지에도 동작합니다.
   ========================================================================== */
(function (global) {
  var SEL = ".ra-fig, .rt-img img, .md-body img";
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

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var img = e.target.closest(SEL);
    if (!img || img.tagName !== "IMG" || !img.getAttribute("src")) return;
    open(img.currentSrc || img.src, img.alt);
  });
})(window);
