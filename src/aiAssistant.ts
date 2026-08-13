import { OfficialData, Shipment, UserRole } from './types';
import { ROLE_DEFINITIONS } from './roleAccess';

export interface AssistantContext {
  role: UserRole;
  screenName: string;
  shipment: Shipment | null;
  officialData: OfficialData | null;
}

export function buildAiPrompt(question: string, context: AssistantContext) {
  const shipment = context.shipment;
  return `당신은 미국 수입통관과 한국산 KD 자동차 부품의 HTS 사전검토를 돕는 실무 AI입니다.
한국어로 간결하게 답하고, 반드시 1) 확인된 사실 2) 위험 또는 불확실성 3) 다음 조치 순서로 작성하세요.
법적 최종판단으로 단정하지 말고 제공된 자료 밖의 품목번호나 관세율을 만들어내지 마세요.

사용자 역할: ${ROLE_DEFINITIONS[context.role].label}
현재 화면: ${context.screenName}
선택 선적: ${shipment ? JSON.stringify({ entryNumber: shipment.entryNumber, title: shipment.shipmentTitle, status: shipment.status, totalValueUsd: shipment.totalValueUsd, items: shipment.items }) : '없음'}
공식 자료: ${context.officialData ? JSON.stringify({ dataset: context.officialData.dataset, sources: context.officialData.sources, htsChanges: context.officialData.htsChanges }) : '없음'}

질문: ${question}`;
}

export function buildGuidedAnswer(question: string, context: AssistantContext) {
  const shipment = context.shipment;
  const normalized = question.toLowerCase();
  const sources = context.officialData?.sources.map(source => `${source.nameKo} — ${source.url}`) || [];

  if (shipment && (normalized.includes('위험') || normalized.includes('분석') || normalized.includes('선적'))) {
    const risky = shipment.items.filter(item => item.riskLevel === 'high' || item.riskLevel === 'critical' || item.pscRequired);
    const mismatch = shipment.items.filter(item => item.recommendedHtsCode && item.recommendedHtsCode !== item.declaredHtsCode);
    const dutyGap = shipment.items.reduce((sum, item) => sum + (item.dutyDifferenceUsd || 0), 0);
    return `확인된 사실\n• ${shipment.entryNumber}에는 ${shipment.itemsCount}개 품목, 신고가액 $${shipment.totalValueUsd.toLocaleString()}이 등록되어 있습니다.\n• 고위험·PSC 확인 품목은 ${risky.length}개, 추천 HTS와 신고 HTS가 다른 품목은 ${mismatch.length}개입니다.\n• 현재 계산된 관세 차액 합계는 $${dutyGap.toLocaleString()}입니다.\n\n위험 또는 불확실성\n• 품명과 신고 데이터만으로 법적 품목분류를 확정할 수 없습니다. 재질·용도·도면·원산지 증빙 확인이 필요합니다.\n\n다음 조치\n1. 오분류 분석 결과에서 차이가 있는 품목을 엽니다.\n2. 근거 문서와 부품 사양을 대조합니다.\n3. 필요하면 정정 검토 요청을 생성합니다.`;
  }

  if (normalized.includes('psc') || normalized.includes('수정') || normalized.includes('정정')) {
    return `확인된 사실\n• PSC는 이미 접수된 미국 수입신고의 요약정보를 정정하는 후속 절차입니다. 이 화면에서는 실제 CBP 제출이 아니라 정정 후보와 준비 상태를 관리합니다.\n\n위험 또는 불확실성\n• 제출 가능 기간과 대상 여부는 신고 상태 및 CBP 절차를 별도로 확인해야 합니다.\n\n다음 조치\n1. 분석 결과에서 신고 HTS와 추천 HTS 차이를 확인합니다.\n2. 검토 요청에 판정 근거와 증빙을 첨부합니다.\n3. 미국 통관 담당자가 승인 후 ‘PSC 수정자료 완료’로 처리합니다.`;
  }

  if (normalized.includes('301') || normalized.includes('추가관세') || normalized.includes('관세')) {
    const changes = context.officialData?.htsChanges.filter(change => change.htsCode.startsWith('9903.')) || [];
    return `확인된 사실\n• 연결 자료에는 9903류 추가관세 관련 변경 ${changes.length}건이 포함되어 있습니다. 한국산 적용 여부는 기본 HTS, 원산지, 수입일과 예외 조항을 함께 봐야 합니다.\n\n위험 또는 불확실성\n• 특정 품목의 실제 세율은 현재 질문만으로 확정할 수 없습니다.\n\n다음 조치\n1. 대상 신고서와 품목을 선택합니다.\n2. 기본 HTS와 9903 추가분류를 함께 확인합니다.\n3. 시행일과 원산지 증빙을 대조한 뒤 미국 통관 담당자가 최종 검증합니다.`;
  }

  return `현재 질문을 역할과 화면 맥락에 맞춰 정리했습니다.\n\n확인된 사실\n• 현재 역할은 ${ROLE_DEFINITIONS[context.role].label}이며, ${context.screenName} 화면을 보고 있습니다.\n• 연결된 공식 자료는 ${context.officialData?.sources.length || 0}개입니다.\n\n위험 또는 불확실성\n• 생성형 AI가 연결되지 않은 상태에서는 업로드 자료와 내장 규칙으로만 답하므로 자유 질의의 해석 범위가 제한됩니다.\n\n다음 조치\n• 패널의 ‘개인 AI 연결’에 Gemini API 키를 넣으면 현재 선적과 공식 자료를 포함한 생성형 AI 답변을 받을 수 있습니다.\n• 또는 “선적 위험 분석”, “추가관세 확인”, “PSC 정정 절차”처럼 질문해 주세요.`;
}

export function getSourceLabels(data: OfficialData | null) {
  return data?.sources.map(source => `${source.nameKo} — ${source.url}`) || [];
}
