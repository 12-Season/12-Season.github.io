# LIT @ KAIST — Publications Site

KAIST LIT 연구실의 출판물(학술지 · 학술대회 · 특허) 페이지입니다.
빌드 도구 없이 동작하는 **순수 정적 사이트**로, 브라우저가 `data/`의 CSV를
직접 읽어 **국제(International) / 국내(Domestic)** 탭으로 나눠 연도별로 렌더링합니다.

## 구조

```
.
├── index.html            # 랜딩 (연구실 소개 + 3개 목록 링크, 국제/국내 건수)
├── journal.html          # 학술지 (International / Domestic 탭)
├── conferences.html      # 학술대회 (International / Domestic 탭)
├── patents.html          # 특허 (International / Domestic 탭)
├── assets/
│   ├── css/style.css     # 스타일 (드롭다운 nav, 탭 포함)
│   └── js/pubs.js        # CSV 파싱 + 연도별 렌더링 + 탭 + 검색
├── data/
│   ├── journal_international.csv     ┐
│   ├── journal_domestic.csv         │
│   ├── conference_international.csv  │  ← 데이터 (WordPress export 포맷)
│   ├── conference_domestic.csv      │
│   ├── patent_international.csv      │
│   └── patent_domestic.csv          ┘
├── .nojekyll             # Jekyll 처리 건너뛰고 정적 서빙
└── README.md
```

상단 네비게이션의 **Journal / Conferences / Patents** 에 마우스를 올리면
`International` / `Domestic` 하위 항목이 나타나고, 각 페이지 상단의 탭으로도
전환할 수 있습니다. (`journal.html#domestic` 처럼 해시로 특정 탭을 바로 열 수 있음)

## 출판물 추가 / 수정 방법

1. `data/` 안의 해당 CSV 파일(국제/국내 구분)을 새 버전으로 **교체**합니다.
   (컬럼 구조는 기존과 동일하게 유지하세요. UTF-8 인코딩, abstract처럼
   쉼표·줄바꿈이 들어가는 값은 큰따옴표로 감싸야 합니다.)
2. 변경사항을 commit & push 하면 끝입니다. 별도 빌드 과정은 없습니다.

화면에 쓰이는 주요 컬럼:

| 종류 | 핵심 컬럼 |
|------|-----------|
| journal | `title`, `author`, `journal`, `volume`, `number`, `pages`, `date`, `doi`, `abstract`, `status` |
| conference | `title`, `author`, 발표처(`booktitle` → 없으면 `note` → `organization`), `date`, `doi`, `abstract`, `status` |
| patent | `title`, `author`(발명자), `number`(출원/등록번호), `note`(출원/등록 구분), `date`, `status` |

- `status` 가 `forthcoming` 이면 **"to appear"** 배지가 붙습니다.
- `date` 가 비어 있거나 `0000-00-00` 이면 `added` 날짜로 연도를 보정합니다.
- 특허는 `note` 의 "출원"/"등록" 문구로 상태를 구분합니다.

## 로컬 미리보기

브라우저로 HTML 파일을 직접 여는 `file://` 방식은 보안정책상 CSV를 읽지
못합니다. 작은 로컬 서버를 띄워서 확인하세요.

```bash
# 이 폴더에서 실행
python -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

## 배포 (GitHub Pages)

이 저장소 이름이 `12-Season.github.io` 이므로 사용자/조직 페이지로 동작합니다.
`main` 브랜치에 push 하면 자동으로 `https://12-Season.github.io` 에 반영됩니다.
(Settings → Pages → Source = `Deploy from a branch`, `main` / `/ (root)`)

## 메모

- 랜딩 페이지(`index.html`)의 연구실 소개 문구는 주석으로 표시된 영역에서
  자유롭게 수정하세요.
- 저자 표기 중 PI(`H. Park` / `Hyuncheol Park` / `박현철`)는 자동으로
  굵게 강조됩니다. (`assets/js/pubs.js` 의 `highlightPI` 에서 조정 가능)
