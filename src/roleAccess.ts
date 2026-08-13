import { UserRole } from './types';

export interface RoleDefinition {
  label: string;
  shortLabel: string;
  mission: string;
  accent: string;
  tabs: string[];
  capabilities: string[];
  restrictions: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  kd_manager: {
    label: '한국 수출 관리 담당자',
    shortLabel: '수출 관리',
    mission: '선적 자료를 등록하고 사전 분석을 실행한 뒤 검토가 필요한 품목을 전달합니다.',
    accent: 'bg-blue-50 text-blue-900 border-blue-200',
    tabs: ['dashboard', 'notices', 'hts', 'shipments', 'analysis', 'results', 'result_detail', 'reviews', 'impact', 'settings'],
    capabilities: ['신고서 CSV 등록', 'HTS 기준 품목 관리', '사전 분석 실행', '정정 검토 요청'],
    restrictions: ['승인·반려 및 PSC 완료 처리는 할 수 없습니다.'],
  },
  import_filer: {
    label: '미국 통관 담당자',
    shortLabel: '미국 통관',
    mission: '수입 신고 내용을 검증하고 검토 요청을 승인·반려하거나 PSC 준비를 완료합니다.',
    accent: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    tabs: ['dashboard', 'notices', 'shipments', 'results', 'result_detail', 'reviews', 'impact', 'settings'],
    capabilities: ['신고서 조회', '분석 결과 검증', '검토 승인·반려', 'PSC 수정자료 완료 처리'],
    restrictions: ['신고서 업로드·사전 분석·HTS 기준 등록은 할 수 없습니다.'],
  },
  reviewer: {
    label: '원산지·품목 검토자',
    shortLabel: '전문 검토',
    mission: '품목번호와 원산지 증빙을 독립적으로 검토하고 승인 또는 재검토 의견을 남깁니다.',
    accent: 'bg-violet-50 text-violet-900 border-violet-200',
    tabs: ['dashboard', 'notices', 'hts', 'results', 'result_detail', 'reviews', 'validation', 'settings'],
    capabilities: ['HTS 기준 조회', '분석 근거 검토', '원산지 확인', '승인·재검토 의견'],
    restrictions: ['신고서 등록·분석 실행·PSC 완료 처리는 할 수 없습니다.'],
  },
};

export function canAccessTab(role: UserRole, tab: string) {
  return ROLE_DEFINITIONS[role].tabs.includes(tab);
}

export function can(role: UserRole, capability: 'upload' | 'runAnalysis' | 'manageHts' | 'requestReview' | 'resolveReview' | 'completePsc') {
  if (role === 'kd_manager') return ['upload', 'runAnalysis', 'manageHts', 'requestReview'].includes(capability);
  if (role === 'import_filer') return ['resolveReview', 'completePsc'].includes(capability);
  return capability === 'resolveReview';
}
