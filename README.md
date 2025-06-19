# 면접 질문지 생성 시스템

OpenAI API를 연동하여 사용자(사내 인사담당자)가 면접 시 필요한 직무별/지원자별 질문지 생성을 지원하는 시스템입니다.

## 주요 기능

### 입력 항목
- **직무** (필수): 12개 직무 중 선택
  - 경영·전략, 제품·서비스 기획, 연구·개발(R&D)/엔지니어링
  - 생산·운영/프로젝트 딜리버리, 품질·안전/규제 대응, 영업·BizDev
  - 마케팅·브랜드, 고객지원·CX, 재무·회계
  - 인사·총무/조직문화, IT 인프라·보안, 법무·컴플라이언스

- **경력** (필수): 신입 또는 경력 선택
- **기업형태** (필수): 공기업, 사기업, 공공기관 중 선택
- **이력서** (선택): PDF 또는 이미지 파일 업로드

### 출력 결과
- **공통 질문**: 직무·경력·기업형태를 반영한 4개 질문 (각 3개 후속질문 포함)
- **개별 질문**: 이력서 기반 6개 맞춤 질문 (각 3개 후속질문 및 이력서 근거 포함)

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4
- **파일 처리**: 
  - PDF: pdf-parse
  - 이미지 OCR: Tesseract.js
- **배포**: Vercel

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

루트 디렉터리에 `.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 4. 빌드 및 배포

```bash
npm run build
npm start
```

## Vercel 배포

1. Vercel에 프로젝트를 연결
2. 환경 변수에 `OPENAI_API_KEY` 설정
3. 자동 배포 완료

## 사용 방법

1. **폼 작성**: 직무, 경력, 기업형태를 선택하고 필요시 이력서 파일을 업로드
2. **질문 생성**: "면접 질문 생성" 버튼 클릭
3. **결과 확인**: 생성된 공통질문과 개별질문을 확인
4. **활용**: 인쇄, 다운로드 또는 새로 작성 가능

## 파일 업로드 제한

- **지원 형식**: PDF, PNG, JPG, JPEG
- **최대 크기**: 10MB
- **OCR 지원**: 한국어 + 영어

## 관리자 페이지

시스템 프롬프트를 웹 인터페이스에서 관리할 수 있는 관리자 페이지가 제공됩니다.

### 접근 방법
- 사용자 페이지 우상단 "관리자 페이지" 버튼 클릭
- 직접 URL: `http://localhost:3000/admin`
- 테스트 환경이므로 별도 인증 없이 바로 접근 가능

### 페이지 간 이동
- **사용자 페이지**: 면접 질문 생성 기능
- **관리자 페이지**: 시스템 프롬프트 편집 기능
- 각 페이지 상단에 상대방 페이지로 이동하는 버튼 제공

### 기능
- **기본 프롬프트**: 시스템의 전체적인 동작을 제어하는 기본 프롬프트 편집
- **직무별 프롬프트**: 12개 직무별 세부 프롬프트 편집
- **경력별 프롬프트**: 신입/경력별 프롬프트 편집
- **기업형태별 프롬프트**: 공기업/사기업/공공기관별 프롬프트 편집
- **출력 형식**: JSON 출력 스키마 편집

### 데이터 저장
- 프롬프트 데이터는 `data/prompts.json` 파일에 저장됩니다
- 변경사항은 실시간으로 반영됩니다

## API 구조

### POST /api/generate

**요청**:
- `position`: 직무
- `experience`: 경력  
- `companyType`: 기업형태
- `resume`: 이력서 파일 (선택)

**응답**:
```json
{
  "commonQuestions": [
    {
      "question": "공통질문",
      "followUps": ["후속질문1", "후속질문2", "후속질문3"]
    }
  ],
  "individualQuestions": [
    {
      "question": "개별질문",
      "resumeSource": "이력서 근거",
      "followUps": ["후속질문1", "후속질문2", "후속질문3"]
    }
  ]
}
```

### GET /api/prompts

시스템 프롬프트를 조회합니다.

**응답**:
```json
{
  "basePrompt": "기본 시스템 프롬프트",
  "positionPrompts": {
    "경영·전략": "경영전략 프롬프트",
    "제품·서비스 기획": "제품기획 프롬프트"
  },
  "experiencePrompts": {
    "신입": "신입 프롬프트",
    "경력": "경력 프롬프트"
  },
  "companyTypePrompts": {
    "공기업": "공기업 프롬프트",
    "사기업": "사기업 프롬프트",
    "공공기관": "공공기관 프롬프트"
  },
  "outputFormat": "JSON 출력 형식"
}
```

### PUT /api/prompts

시스템 프롬프트를 업데이트합니다.

**요청**:
```json
{
  "basePrompt": "수정된 기본 프롬프트",
  "positionPrompts": { ... },
  "experiencePrompts": { ... },
  "companyTypePrompts": { ... },
  "outputFormat": "수정된 출력 형식"
}
```

## 프로젝트 구조

```
├── app/
│   ├── admin/
│   │   └── page.tsx             # 관리자 페이지
│   ├── api/
│   │   ├── generate/route.ts    # OpenAI API 호출
│   │   └── prompts/route.ts     # 프롬프트 CRUD API
│   ├── globals.css              # 글로벌 스타일
│   ├── layout.tsx               # 앱 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/
│   ├── PromptEditor.tsx         # 프롬프트 편집기
│   ├── QuestionnaireForm.tsx    # 입력 폼
│   └── QuestionnaireResult.tsx  # 결과 표시
├── data/
│   └── prompts.json             # 프롬프트 데이터 저장
├── types/
│   └── index.ts                 # TypeScript 타입 정의
├── utils/
│   ├── fileProcessor.ts         # 파일 처리 유틸리티
│   └── prompts.ts               # 시스템 프롬프트 관리
└── README.md
```

## 라이선스

이 프로젝트는 사내 인사담당자용 도구로 개발되었습니다. 