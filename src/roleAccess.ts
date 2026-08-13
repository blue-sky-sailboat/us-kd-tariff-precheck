import { UserRole } from './types';

export interface RoleDefinition {
  label: string;
  shortLabel: string;
  accent: string;
  tabs: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  kd_manager: {
    label: '한국 수출 관리 담당자',
    shortLabel: '수출 관리',
    accent: 'bg-blue-50 text-blue-900 border-blue-200',
    tabs: ['dashboard', 'notices', 'hts', 'shipments', 'analysis', 'results', 'result_detail', 'reviews', 'impact', 'settings'],
  },
  import_filer: {
    label: '미국 통관 담당자',
    shortLabel: '미국 통관',
    accent: 'bg-sky-50 text-sky-900 border-sky-200',
    tabs: ['dashboard', 'notices', 'shipments', 'results', 'result_detail', 'reviews', 'impact', 'settings'],
  },
  reviewer: {
    label: '원산지·품목 검토자',
    shortLabel: '전문 검토',
    accent: 'bg-blue-100 text-blue-950 border-blue-300',
    tabs: ['dashboard', 'notices', 'hts', 'results', 'result_detail', 'reviews', 'validation', 'settings'],
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
