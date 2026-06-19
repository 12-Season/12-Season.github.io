# LIT @ KAIST — Publications Site

KAIST LIT 연구실의 출판물(학술지 · 학술대회 · 특허) 페이지입니다.
빌드 도구 없이 동작하는 **순수 정적 사이트**로, 브라우저가 `data/`의 CSV를
직접 읽어 연도별로 렌더링합니다.

## 구조

```
.
├── index.html            # 랜딩 (연구실 소개 + 3개 목록 링크)
├── journal.html          # 학술지 논문 목록
├── conferences.html      # 학술대회 논문 목록
├── patents.html          # 특허 목록
├── assets/
│   ├── css/style.css     # 스타일
│   └── js/pubs.js        # CSV 파싱 + 연도별 렌더링 + 검색
├── data/
│   ├── journal.csv       # ← 학술지 데이터 (WordPress export 포맷)
│   ├── conference.csv    # ← 학술대회 데이터
│   └── patent.csv        # ← 특허 데이터
└── README.md
```

## 출판물 추가 / 수정 방법

1. `data/` 안의 해당 CSV 파일을 새 버전으로 **교체**합니다.
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

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source** 를 `Deploy from a branch` 로 설정
3. Branch 를 `main` / 폴더 `/ (root)` 로 지정 후 저장
4. 잠시 뒤 `https://12-Season.github.io` 에서 사이트가 게시됩니다.

## 메모

- 랜딩 페이지(`index.html`)의 연구실 소개 문구는 주석으로 표시된 영역에서
  자유롭게 수정하세요.
- 저자 표기 중 PI(`H. Park` / `Hyuncheol Park` / `박현철`)는 자동으로
  굵게 강조됩니다. (`assets/js/pubs.js` 의 `highlightPI` 에서 조정 가능)
