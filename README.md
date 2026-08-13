# 미국 KD 수출품목 사전확인 플랫폼

미국으로 수출하는 KD 품목의 관세 공지, 미국 품목번호(HTS) 변경, 선적별 관세 영향을 한곳에서 확인하는 웹 서비스입니다.

공개 데모: https://blue-sky-sailboat.github.io/us-kd-tariff-precheck/

## 연결된 자료

- Federal Register 문서 2025-21940의 제목·게시일·시행일·공식 원문
- USITC HTS 2025 Revision 31과 Revision 32의 품목번호별 변경 15건
- CBP 한미 관세 이행 안내의 공식 링크와 사용 목적
- 사용자가 등록한 선적 CSV와 분석·검토 결과의 서버 저장 파일

공식 자료 묶음은 `data/official-data.json`에 있으며, `scripts/build_official_data.py`를 실행하면 작업공간의 `03_데이터` 원본에서 다시 생성됩니다.

## 실행 방법

1. Node.js에서 `npm install`을 실행합니다.
2. AI 관세 도우미를 사용하려면 `.env.local`에 `GEMINI_API_KEY`를 설정합니다.
3. `npm run dev`를 실행합니다.
4. 브라우저에서 `http://localhost:3000`을 엽니다.

## 공개 데모 범위

GitHub Pages 버전은 서버 없이 실행되는 정적 데모입니다. 공식 자료와 샘플 선적 데이터는 앱에 포함되어 있으며, 사용자가 변경한 작업 상태는 해당 브라우저에만 저장됩니다. AI 관세 도우미의 실제 API 호출과 서버 공동 저장은 로컬 또는 별도 서버 배포에서만 사용할 수 있습니다.

AI 연결 정보가 없으면 임의의 답변을 보여주지 않고 설정이 필요하다고 안내합니다. 미국 세관 시스템(ACE) 제출은 직접 수행하지 않으며, 관세사의 최종 확인과 실제 제출 절차가 필요합니다.
