import React from 'react';
import { Shipment, AnalysisRun, RiskLevel } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Zap, FileText, UploadCloud, Search, Activity } from 'lucide-react';

interface DashboardViewProps {
  shipments: Shipment[];
  runs: AnalysisRun[];
  onNavigate: (tab: string) => void;
  onSelectShipment: (shipment: Shipment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  shipments,
  runs,
  onNavigate,
  onSelectShipment,
}) => {
  const totalShipments = shipments.length;
  const highRiskCount = shipments.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
  const pscRequiredCount = shipments.reduce((acc, s) => acc + s.items.filter(i => i.pscRequired).length, 0);
  const pendingReviewCount = shipments.filter(s => s.status === 'review_required' || s.status === 'analyzing').length;
  const totalShipmentValue = shipments.reduce((sum, shipment) => sum + shipment.totalValueUsd, 0);

  const totalDutyDiscrepancyUsd = shipments.reduce((acc, s) => {
    const calc = s.calculatedTotalDutyUsd || 0;
    const decl = s.declaredTotalDutyUsd || 0;
    return acc + Math.max(0, calc - decl);
  }, 0);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">매우 높음</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">높음</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">보통</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">낮음</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Notice */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#001E42] via-[#002C5F] to-[#0A192F] text-white shadow-lg border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>미국 공식 관세 공지와 HTS 판본을 기준으로 확인</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            미국 KD 수출품목 사전확인 및 관세 영향 분석
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-normal">
            수출 선적 전 미국 품목번호(HTS), 추가관세 대상 여부와 신고 내용 수정 필요성을 확인해 통관 지연과 관세 차이를 줄입니다.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all border border-cyan-300/30"
          >
            <Zap className="w-4 h-4 text-cyan-200" />
            <span>사전 분석 실행</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">전체 사전분석 신고서</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalShipments}건</div>
          <p className="text-[11px] text-slate-500 font-mono">신고서 총 품목 가액: ${totalShipmentValue.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">품목번호 고위험 선적</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{highRiskCount}건</div>
          <p className="text-[11px] text-rose-600 font-bold">추가 확인이 필요한 선적 건수</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">신고 내용 수정 검토 품목</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{pscRequiredCount}개 품목</div>
          <p className="text-[11px] text-amber-700 font-mono font-bold">예상 관세 차액: +${totalDutyDiscrepancyUsd.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">검토 요청 대기</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingReviewCount}건</div>
          <p className="text-[11px] text-slate-500">KD담당자 / 수입전담자 협업 진행 중</p>
        </div>
      </div>

      {/* KD Export Workflow Pipeline */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
          <span className="text-slate-900 font-black">KD 수출통관 사전확인 업무 흐름</span>
          <span className="text-xs font-semibold text-slate-400">자료 등록부터 담당자 확인까지</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">1단계</div>
            <div className="font-bold text-xs text-slate-900">신고서 업로드</div>
            <div className="text-[10px] text-slate-500">CSV 품목자료 읽기</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">2단계</div>
            <div className="font-bold text-xs text-slate-900">품목번호 확인</div>
            <div className="text-[10px] text-slate-500">신고값과 연결표 대조</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">3단계</div>
            <div className="font-bold text-xs text-slate-900">공식 판본 비교</div>
            <div className="text-[10px] text-slate-500">공지·관세율 변경 확인</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-blue-700 uppercase">4단계</div>
            <div className="font-bold text-xs text-slate-900">담당자 검토</div>
            <div className="text-[10px] text-slate-500">신고 수정 필요사항 확인</div>
          </div>
          <div className="p-3 bg-[#002C5F]/10 border border-[#002C5F]/30 rounded-xl text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-[#002C5F] uppercase">5단계</div>
            <div className="font-bold text-xs text-[#002C5F]">제출 자료 준비</div>
            <div className="text-[10px] text-slate-600">관세사 최종 확인</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8: Recent Shipments */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">최근 사전확인 통관 신고서</h3>
              <p className="text-xs text-slate-500">신고서별 HTS 오분류 위험도 및 예상 관세 차액</p>
            </div>
            <button
              onClick={() => onNavigate('shipments')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center space-x-1"
            >
              <span>전체보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {shipments.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onSelectShipment(s);
                  onNavigate('results');
                }}
                className="p-4 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl cursor-pointer transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#002C5F] bg-[#002C5F]/10 border border-[#002C5F]/20 px-2 py-0.5 rounded">
                      {s.entryNumber}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5 group-hover:text-[#002C5F] transition-colors">
                      {s.shipmentTitle}
                    </h4>
                  </div>
                  {getRiskBadge(s.riskLevel)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">수입신고인 (IOR)</span>
                    <span className="font-semibold text-slate-800 truncate block">{s.importerOfRecord}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">입항항구</span>
                    <span className="font-semibold text-slate-800 block">{s.portOfEntry}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">신고 관세액</span>
                    <span className="font-semibold text-slate-800 block">${s.declaredTotalDutyUsd.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">AI 검증 산출액</span>
                    <span className="font-bold text-rose-600 block">
                      ${(s.calculatedTotalDutyUsd || s.declaredTotalDutyUsd).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4: Recent Analysis Runs & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">빠른 실행 메뉴</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('shipments')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <UploadCloud className="w-4 h-4 text-[#002C5F]" />
                  <span>신고서 파일 업로드</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('hts')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <Search className="w-4 h-4 text-[#002C5F]" />
                  <span>HTS 관세율 10자리 검색</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('impact')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-300 rounded-xl transition-all text-xs font-bold text-slate-800"
              >
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-4 h-4 text-[#002C5F]" />
                  <span>관세 인상 영향 시각화</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent AI Analysis Runs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">최근 AI 분석 실행 이력</h3>
            <div className="space-y-2.5">
              {runs.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#002C5F]">{r.id}</span>
                    <span className="text-[10px] text-slate-500">{r.runDate}</span>
                  </div>
                  <p className="font-bold text-slate-800 truncate">{r.shipmentTitle}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>평균 신뢰도: <strong className="text-cyan-700 font-bold">{r.confidenceAverage}%</strong></span>
                    <span className="text-rose-600 font-bold">PSC 정정 {r.pscRequiredCount}건</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
