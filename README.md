# 식품안전 법령 모니터링 시스템

식품의약품안전처(MFDS) 공식 자료를 기반으로 최신 법령·고시·입법/행정예고를 실시간 모니터링하는 품질 연구원 전용 시스템입니다.

## 기능

- **법령/고시**: 법, 시행령, 시행규칙 및 고시 변경 사항 모니터링 (일반 식품 한정)
- **입법/행정예고**: 식품 관련 고시 예정 정보 모니터링
- Gemini AI + Google Search 기반 실시간 조회 (최근 90일)
- 날짜순 자동 정렬

## 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express, tsx
- **AI**: Google Gemini API (`@google/genai`)
- **Bundler**: Vite 6

## 로컬 실행

**요구 사항**: Node.js 18 이상

1. 의존성 설치
   ```bash
   npm install
   ```

2. 환경 변수 설정 — `.env.local` 파일 생성 후 Gemini API 키 입력
   ```
   GEMINI_API_KEY=여기에_API_키_입력
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   ```
   → http://localhost:3000

## 배포

```bash
npm run build      # 프론트엔드 빌드 (dist/)
npm start          # Express 서버 실행 (PORT 환경 변수로 포트 지정 가능)
```

## 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 | 필수 |
| `PORT` | 서버 포트 (기본값: 3000) | 선택 |
