export type UserRole = 'kd_manager' | 'import_filer' | 'reviewer';


export type ShipmentStatus = 'uploaded' | 'analyzing' | 'review_required' | 'approved' | 'psc_filed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface HtsItem {
  id: string;
  htsCode: string; // 10-digit e.g., "8708.29.5060"
  descriptionKo: string;
  descriptionEn: string;
  generalDutyRate: number; // e.g., 2.5 (%)
  section301Rate: number; // e.g., 25.0 (%)
  ftaRate: number; // e.g., 0.0 (%)
  unit: string; // e.g., "PCS", "KG"
  chapter: string; // e.g., "87"
  category: string; // e.g., "Body Parts & Accessories"
  updatedAt: string;
}

export interface LineItem {
  id: string;
  itemNumber: string;
  partNameKo: string;
  partNameEn: string;
  declaredHtsCode: string;
  recommendedHtsCode?: string;
  confidenceScore?: number; // 0 ~ 100
  declaredValueUsd: number;
  quantity: number;
  dutyRateDeclared: number;
  dutyRateCalculated?: number;
  dutyDifferenceUsd?: number;
  riskLevel: RiskLevel;
  ruleCitation?: string; // e.g., "CBP Ruling HQ H293812 / 19 CFR 152.12"
  pscRequired: boolean;
  notes?: string;
}

export interface Shipment {
  id: string;
  entryNumber: string; // e.g., "CBP-2026-884920"
  shipmentTitle: string;
  importerOfRecord: string; // IOR Name e.g., "Glovis America Inc."
  brokerFiler: string; // e.g., "US Customs Broker LLC"
  carrier: string;
  portOfEntry: string; // e.g., "Los Angeles, CA (2704)"
  exportDate: string;
  importDate: string;
  status: ShipmentStatus;
  itemsCount: number;
  totalValueUsd: number;
  declaredTotalDutyUsd: number;
  calculatedTotalDutyUsd?: number;
  riskLevel: RiskLevel;
  items: LineItem[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  titleKo: string;
  titleEn: string;
  category: 'CBP Notice' | 'Tariff Rate Change' | 'Customs Directive' | 'Federal Register';
  summaryKo: string;
  contentEn: string;
  effectiveDate: string;
  federalRegisterUrl?: string;
  pdfUrl?: string;
  publicationDate?: string;
  documentNumber?: string;
  citation?: string;
  sourceFile?: string;
  impactLevel: 'high' | 'medium' | 'low';
  isImportant: boolean;
  createdAt: string;
}

export interface HtsChange {
  htsCode: string;
  changeType: '추가' | '삭제' | '내용 변경';
  descriptionEn: string;
  generalRateBefore: string;
  generalRateAfter: string;
  specialRateBefore: string;
  specialRateAfter: string;
  additionalDutiesBefore: string;
  additionalDutiesAfter: string;
  changedFields: string[];
}

export interface OfficialSource {
  id: string;
  nameKo: string;
  publisher: string;
  url: string;
  localFile: string;
  purpose: string;
  language: string;
}

export interface OfficialDataset {
  previousVersion: string;
  currentVersion: string;
  previousRowCount: number;
  currentRowCount: number;
  changeCount: number;
  comparisonBasis: string;
}

export interface OfficialData {
  generatedAt: string;
  aiConfigured: boolean;
  dataset: OfficialDataset;
  sources: OfficialSource[];
  notices: Notice[];
  htsChanges: HtsChange[];
}

export interface AnalysisRun {
  id: string;
  shipmentId: string;
  shipmentTitle: string;
  entryNumber: string;
  runDate: string;
  status: 'completed' | 'failed' | 'running';
  totalItemsAnalyzed: number;
  mismatchedItemsCount: number;
  pscRequiredCount: number;
  confidenceAverage: number;
  potentialDutySavingsUsd: number;
  potentialPenaltyRiskUsd: number;
  riskSummary: string;
  ruleEngineVersion: string;
  authorEmail: string;
}

export interface ReviewRequest {
  id: string;
  shipmentId: string;
  entryNumber: string;
  partName: string;
  declaredHts: string;
  suggestedHts: string;
  requestedBy: string;
  requestedRole: UserRole;
  reviewerEmail?: string;
  status: 'pending' | 'approved' | 'rejected' | 'psc_filed';
  reasonKo: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedActions?: { label: string; action: string }[];
}
