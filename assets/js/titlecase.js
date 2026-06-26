/* ==========================================================================
   LIT @ KAIST — 출판물 제목 Title Case 규칙 (R1~R8)
   window.TitleCase(title) 로 사용. 약어(MIMO/UAVs/MmWave/3GPP 등)는 보존.
   - R1: 아래 small words 는 소문자(첫/끝/콜론 뒤/하이픈 첫단어 제외)
   - R2: 첫 단어·마지막 단어 대문자
   - R3: 하이픈 첫 단어 대문자, 이후는 규칙대로
   - R4: 하이픈 첫 단어가 접두사면 다음 단어 소문자 (Anti-inflammatory)
   - R6: 콜론(:) 다음 단어 대문자
   - R8: (small words 가 모두 4자 이하라 자동 충족)
   ※ R5/R7(문맥상 종속접속사·강조 전치사 대문자)은 자동판별이 어려워 근사 적용
   ========================================================================== */
(function (global) {
  var SMALL = {a:1,an:1,the:1,at:1,by:1,"for":1,"in":1,of:1,on:1,to:1,from:1,up:1,down:1,and:1,as:1,but:1,or:1,nor:1};
  // 혼자 쓸 수 없는 접두사 (R4). 자유롭게 쓰이는 over/under/self/mid 등은 제외.
  var PREFIX = {anti:1,co:1,de:1,dis:1,en:1,ex:1,extra:1,hyper:1,hypo:1,inter:1,intra:1,macro:1,micro:1,mono:1,multi:1,neo:1,non:1,omni:1,poly:1,post:1,pre:1,pro:1,pseudo:1,quasi:1,re:1,semi:1,sub:1,"super":1,supra:1,trans:1,tri:1,ultra:1,un:1,uni:1,bi:1,meta:1,para:1,proto:1,counter:1,auto:1};

  function preserve(w){ return /[A-Z]{2,}/.test(w) || /[0-9]/.test(w) || /[a-z][A-Z]/.test(w); } // 약어/숫자/카멜케이스는 그대로
  function cap(w){ return preserve(w) ? w : (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); }
  function lc(w){ return preserve(w) ? w : w.toLowerCase(); }
  function isSmall(w){ return SMALL[w.toLowerCase()] && !preserve(w); }
  function isPrefix(w){ return PREFIX[w.toLowerCase()] && !preserve(w); }
  function piece(w, force){ return force ? cap(w) : (isSmall(w) ? w.toLowerCase() : cap(w)); }
  function word(text, first, last){
    if (text.indexOf("-") < 0) return piece(text, first || last);
    var parts = text.split("-"), pre = isPrefix(parts[0]);
    return parts.map(function (p, i) {
      if (i === 0) return cap(p);                               // R3
      if (i === 1 && pre) return lc(p);                         // R4
      return piece(p, last && i === parts.length - 1);
    }).join("-");
  }
  var WORD = /[A-Za-z0-9][A-Za-z0-9'’.]*(?:-[A-Za-z0-9'’.]+)*/g;
  function titlecase(title){
    if (!title) return title;
    var s = String(title), ms = [], m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(s)) !== null) ms.push([m.index, m[0]]);
    var n = ms.length;
    for (var i = n - 1; i >= 0; i--) {
      var idx = ms[i][0], t = ms[i][1];
      var prevColon = /:\s*$/.test(s.slice(0, idx));            // R6
      var nt = word(t, i === 0 || prevColon, i === n - 1);      // R2
      s = s.slice(0, idx) + nt + s.slice(idx + t.length);
    }
    return s;
  }
  global.TitleCase = titlecase;
  if (typeof module !== "undefined" && module.exports) module.exports = titlecase;
})(typeof window !== "undefined" ? window : this);
