# LIT @ KAIST — 연구실 웹사이트

KAIST 정보전송연구실(LIT) 웹사이트입니다. **빌드 도구 없이 동작하는 순수 정적 사이트**로,
브라우저가 `data/`의 CSV/MD를 직접 읽어 렌더링합니다. GitHub Pages로 배포됩니다.

> 대부분의 콘텐츠는 **관리자 페이지(`admin.html`)에서 직접** 추가·수정·삭제할 수 있습니다.
> (아래 [관리자 페이지로 수정하기](#관리자-페이지로-수정하기-권장) 참고)

---

## 1. 페이지 구성

| 페이지 | 내용 | 데이터 소스 |
|---|---|---|
| `index.html` | 홈 (히어로 슬라이드, 연구분야 토글, 최근 소식+갤러리) | `data/news.csv`, `data/album.csv` |
| `about.html` | 연구실 소개 (소개·비전, 현황, 연구 분야, 대표 성과) | HTML 내 직접 작성 |
| `people.html` | 구성원 (Faculty / Members / Alumni 탭) | `data/faculty(_ko).md`, `data/people_*.csv` |
| `journal.html` / `conferences.html` / `patents.html` | 출판물 (International / Domestic 탭) | `data/*_international.csv`, `data/*_domestic.csv` |
| `projects.html` | 연구 과제 (Current / Past 탭) | `data/projects.csv` |
| `news.html` | 소식/게시판 (한·영) | `data/news.csv` |
| `album.html` | 앨범 (연도별, 라이트박스) | `data/album.csv` + `assets/img/album/` |
| `contact.html` | 연락처·오시는 길·모집 안내 (지도 포함) | HTML 내 직접 작성 |
| `admin.html` | 관리자 (토큰 기반 데이터 편집) | — |

```
assets/
├── css/style.css        # 전체 스타일
├── js/
│   ├── pubs.js          # 출판물 렌더링 + CSV 파서(공용)
│   ├── people.js        # People 페이지 + faculty MD 렌더
│   ├── album.js         # 앨범 + 라이트박스
│   ├── news.js          # 뉴스 + 뉴스 페이지 내 간단 관리자
│   ├── projects.js      # 연구 과제
│   ├── about.js         # About 동적 인원수
│   ├── home.js          # 홈 연구분야 토글 + 갤러리
│   ├── i18n.js          # 한/영 전환
│   ├── reveal.js        # 스크롤 애니메이션 + 헤더 스크롤 처리
│   ├── hero.js          # 홈 히어로 슬라이드
│   └── admin.js         # 통합 관리자 엔진
├── img/                 # 이미지 (people / album / research / 로고 등)
└── favicon.svg
data/                    # CSV/MD 데이터 (사실상의 DB)
```

---

## 2. 관리자 페이지로 수정하기 (권장)

`https://<사이트주소>/admin.html` 접속 → **GitHub 토큰** 입력 → 탭에서 추가·수정·삭제.
변경은 GitHub에 자동 커밋되고 **1~2분 뒤 사이트에 반영**됩니다.

관리 대상 탭: **Members · Alumni · Album · Publications · News · Projects**
- 사진은 폼에서 **직접 업로드**(자동으로 폭 1600px로 리사이즈).
- Members에는 **"→ Alumni" 이동** 버튼이 있어 졸업 처리(사진까지 이동)가 됩니다.

### GitHub 토큰 발급 (최초 1회)
1. GitHub → **Settings → Developer settings → Fine-grained tokens → Generate new token**
2. **Repository access**: 이 저장소만 선택
3. **Permissions → Contents: Read and write**
4. 생성된 `github_pat_…` 를 admin 페이지에 입력 → "✓ 쓰기 권한 확인됨" 이 뜨면 OK

> ⚠️ 토큰은 **비밀번호와 같습니다.** 브라우저(localStorage)에만 저장되며 사이트엔 올라가지 않습니다.
> 공용/공용 PC에서는 "토큰 기억"을 끄세요. 유출되면 GitHub에서 즉시 **Revoke** 하세요.
> 여러 명이 편집하려면, 저장소 **Settings → Collaborators** 로 초대(Write)하고 각자 본인 토큰을 쓰는 것을 권장합니다.

---

## 3. CSV / MD 직접 편집 (대안)

`data/` 파일을 직접 고치고 commit & push 해도 됩니다. **UTF-8**로 저장하고,
쉼표·줄바꿈이 들어가는 값은 큰따옴표로 감싸세요.

### 데이터별 주요 컬럼
| 파일 | 핵심 컬럼 |
|---|---|
| `people_members.csv` | `name_korean`,`name_english`,`직함`,`학위`(박사/석사/연구원/방문연구원),`관심분야`,`email`,`homepage`,`scholar`,`github`,`cv`,`photo_path` |
| `people_alumni.csv` | …`학위`(박사/석사/교환학생),`졸업논문`,`current_position`,`photo_path` |
| `journal/conference/patent_*.csv` | `title`,`author`,`journal`/`booktitle`,`volume`,`number`,`pages`,`date`,`doi`,`abstract`,`status`,`note` |
| `album.csv` | `date`,`year`,`title`,`content`,`status`(publish/draft),`thumbnail_file`,`image_files`(`|`로 구분) |
| `news.csv` | `date`,`year`,`forum`,`title`,`title_en`,`content`,`content_en`,`links`,`status` |
| `projects.csv` | `status`(current/past),`title`,`title_en`,`period`,`agency`,`role`,`description`,`description_en`,`url` |

- 출판물 `status` 가 `forthcoming` 이면 **"forthcoming"** 배지가 붙습니다.
- 사진 경로(`photo_path`, `thumbnail_file` 등)는 **`.jpg`** 로 유지하세요(브라우저 호환).
- Faculty 소개는 CSV가 아니라 **`data/faculty.md`(영) / `data/faculty_ko.md`(한)** 를 편집합니다.
  `---` 로 구분된 3부분(헤더 / 요약 / 전문) 형식을 유지하세요.
- About·Contact 본문은 각 HTML 안의 `data-ko`/`data-en` 속성을 직접 고칩니다.

---

## 4. 다국어 (한/영)

- 화면 우상단 **언어 토글** 버튼으로 전환. 선택은 브라우저에 저장됩니다.
- 번역이 필요한 요소에 `data-ko` / `data-en` 속성을 답니다. (입력창은 `data-ko-placeholder` 등)
- 뉴스·프로젝트는 CSV의 `*_en` 컬럼이 영어판입니다.

---

## 5. 로컬 미리보기

`file://` 직접 열기는 CSV를 못 읽습니다. 작은 서버를 띄우세요.
```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

---

## 6. 배포 (GitHub Pages)

저장소 이름이 `<계정>.github.io` 이므로 사용자/조직 페이지로 동작합니다.
`main` 브랜치에 push 하면 자동 반영됩니다. (Settings → Pages → Source = `main` / `/(root)`)

- **다른 계정으로 이전 시**: 저장소를 `<새계정>.github.io` 로 만들면 admin이 호스트명에서
  저장소를 **자동 감지**하므로 코드 수정이 필요 없습니다.
- **커스텀 도메인(예: lit.kaist.ac.kr)** 사용 시에만 `assets/js/admin.js` 상단의
  `REPO_OVERRIDE` 에 `"owner/repo"` 를 적어주세요.

---

## 7. 캐시 / 이미지 메모

- CSS·JS는 `?v=YYYYMMDDx` 쿼리로 캐시를 관리합니다. **CSS나 JS를 수정해 배포할 때는
  모든 HTML의 `?v=` 값을 새 값으로 바꿔야** 방문자에게 최신 파일이 적용됩니다.
  (데이터 CSV/MD는 `no-store`라 버전 안 바꿔도 바로 반영됩니다.)
- 이미지 권장: 히어로 ~1920px, 앨범/일반 ~1600px, 인물 세로형. 관리자 업로드는 자동 리사이즈됩니다.
- 큰 원본을 직접 넣을 땐 `sips -Z 1600 파일.jpg` 등으로 줄여 올리세요.

---

## 8. 주의사항

- 프로젝트 폴더가 **iCloud Drive(데스크톱) 동기화** 위치에 있으면 `… 2.jpg` 같은 복제본이
  생길 수 있습니다. 가능하면 동기화 밖 폴더에 두세요.
- 출판물 저자 중 PI(`Hyuncheol Park` / `박현철`)는 자동으로 굵게 강조됩니다
  (`assets/js/pubs.js` 의 `highlightPI`).
