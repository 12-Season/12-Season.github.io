/* ==========================================================================
   LIT @ KAIST — 계절 자동 색 테마 (밝은 배경 + 단색 헤더/선택 반전)
   월에 따라 봄·여름·가을·겨울 팔레트를 적용. CSS 변수만 :root 에 세팅합니다.
   (head 에서 동기 실행 → 첫 페인트 전에 색 적용, 깜빡임 없음)
   ?season=spring|summer|autumn|winter 로 강제 미리보기 가능.
   ========================================================================== */
(function () {
  // 계절 팔레트(4색). 봄은 채도를 낮춰 사용.
  var RAW = {
    spring: ["#FD7979", "#FDACAC", "#FFCDC9", "#FEEAC9"],
    summer: ["#778873", "#A1BC98", "#D2DCB6", "#F1F3E0"],
    autumn: ["#493628", "#AB886D", "#D6C0B3", "#E4E0E1"],
    winter: ["#0F2854", "#1C4D8D", "#4988C4", "#BDE8F5"]
  };

  function hx(h){h=h.replace('#','').trim();return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function hex(r){return '#'+r.map(function(v){return ('0'+Math.max(0,Math.min(255,Math.round(v))).toString(16)).slice(-2);}).join('');}
  function mix(a,b,t){var A=hx(a),B=hx(b);return hex([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]);}
  function lin(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
  function L(h){var r=hx(h);return 0.2126*lin(r[0])+0.7152*lin(r[1])+0.0722*lin(r[2]);}
  function ratio(a,b){var la=L(a),lb=L(b);return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05);}
  function readable(bg){return ratio(bg,'#ffffff')>=ratio(bg,'#15181c')?'#ffffff':'#15181c';}
  function best(cands,bg){var b=cands[0],br=0;cands.forEach(function(c){var r=ratio(c,bg);if(r>br){br=r;b=c;}});return b;}
  function rgb2hsl(h){var r=hx(h).map(function(v){return v/255;});var mx=Math.max.apply(0,r),mn=Math.min.apply(0,r),d=mx-mn,l=(mx+mn)/2,s=0,hh=0;
    if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r[0])hh=((r[1]-r[2])/d+(r[1]<r[2]?6:0));else if(mx===r[1])hh=(r[2]-r[0])/d+2;else hh=(r[0]-r[1])/d+4;hh/=6;}return [hh,s,l];}
  function h2(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
  function hsl2hex(h,s,l){var r,g,b;if(!s){r=g=b=l;}else{var q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;r=h2(p,q,h+1/3);g=h2(p,q,h);b=h2(p,q,h-1/3);}return hex([r*255,g*255,b*255]);}
  function desat(h,k){var c=rgb2hsl(h);return hsl2hex(c[0],c[1]*k,c[2]);}

  RAW.spring = RAW.spring.map(function (c) { return desat(c, 0.55); }); // 봄 채도 낮춤

  function seasonNow(){var m=new Date().getMonth()+1;return (m>=3&&m<=5)?'spring':(m>=6&&m<=8)?'summer':(m>=9&&m<=11)?'autumn':'winter';}

  try {
    var q = (location.search.match(/[?&]season=([a-z]+)/) || [])[1];
    var season = (q && RAW[q]) ? q : seasonNow();
    var ramp = RAW[season].slice().sort(function(a,b){return L(a)-L(b);}); // c0 어두움 → c3 밝음
    var c0=ramp[0],c1=ramp[1],c2=ramp[2],c3=ramp[3];
    var hsl0=rgb2hsl(c0), deep=hsl2hex(hsl0[0],Math.min(1,hsl0[1]*1.05),Math.min(hsl0[2],0.30)); // 진한 브랜드색
    var ink=mix(deep,'#15181c',0.5);
    var accent=best([c1,deep],c3);
    var navyGrad='linear-gradient(150deg,'+mix(deep,'#ffffff',0.14)+','+deep+')';

    var V={
      '--bg':c3,'--fg':ink,'--muted':mix(ink,c3,0.45),
      '--accent':accent,'--accent-dark':deep,'--nav-active':deep,
      '--soft':mix(c3,'#ffffff',0.5),'--line':mix(c2,'#ffffff',0.2),
      '--header-bg':deep,'--header-fg':readable(deep),'--header-active-bg':c3,'--header-active-fg':deep,'--header-line':mix(deep,'#000000',0.18),
      '--t-navy-bg':navyGrad,'--t-navy-fg':readable(deep),'--t-navy-head':readable(deep),'--t-navy-muted':mix(readable(deep),deep,0.35),'--t-navy-link':best([c2,c3,'#ffffff'],deep),'--t-navy-border':'rgba(255,255,255,.22)',
      '--t-white-bg':mix(c3,'#ffffff',0.55),'--t-white-fg':ink,'--t-white-head':deep,'--t-white-muted':mix(ink,c3,0.4),'--t-white-link':accent,'--t-white-border':mix(c2,'#ffffff',0.1),
      '--t-gray-bg':mix(c3,c2,0.45),'--t-gray-fg':ink,'--t-gray-head':deep,'--t-gray-muted':mix(ink,c3,0.4),'--t-gray-link':accent,'--t-gray-border':mix(c2,'#ffffff',0.0)
    };
    var rs=document.documentElement.style;
    for(var k in V) rs.setProperty(k,V[k]);
    document.documentElement.setAttribute('data-season',season);
  } catch(e){ /* 실패 시 CSS 기본값(남색) 유지 */ }
})();
