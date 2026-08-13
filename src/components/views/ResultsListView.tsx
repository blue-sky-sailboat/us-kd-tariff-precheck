import React from 'react';
import { AnalysisRun, Shipment } from '../../types';
import { BarChart3, ArrowRight, Clock } from 'lucide-react';

interface ResultsListViewProps {
  runs: AnalysisRun[];
  shipments: Shipment[];
  onSelectRun: (run: AnalysisRun) => void;
}

export const ResultsListView: React.FC<ResultsListViewProps> = ({
  runs,
  onSelectRun,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#002C5F]" />
          <span>사전 분석 결과 목록</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          실행된 신고서별 HTS 분석 실행 이력, 오분류 위험도 및 예상 추징 위험금
        </p>
      </div>

      {/* Results List Cards */}
      <div className="space-y-4">
        {runs.map((run) => (
          <div
            key={run.id}
            onClick={() => onSelectRun(run)}
            className="bg-white border border-slate-200/80 hover:border-cyan-500 rounded-2xl p-5 shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-4 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-[#002C5F]/10 text-[#002C5F] font-mono font-bold text-xs border border-[#002C5F]/20">
                  RUN {run.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                  {run.entryNumber}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {run.runDate}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-mono">
                  {run.status}
                </span>
              </div>
            </div>

            {/* Title & Summary */}
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#002C5F] transition-colors">
                {run.shipmentTitle}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {run.riskSummary}
              </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block">분석 품목 수</span>
                <span className="font-bold text-slate-800">{run.totalItemsAnalyzed}개 품목</span>
              </div>

              <div className="p-2.5 bg-cyan-50/50 rounded-xl border border-cyan-200">
                <span className="text-[10px] text-[#002C5F] block">평균 AI 신뢰도</span>
                <span className="font-bold text-[#002C5F]">{run.confidenceAverage}%</span>
              </div>

              <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200">
                <span className="text-[10px] text-rose-700 block">PSC 정정 필요</span>
                <span className="font-extrabold text-rose-700">{run.pscRequiredCount}건</span>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 block">예상 추징 위험금</span>
                <span className="font-extrabold text-amber-900">${run.potentialPenaltyRiskUsd.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                규칙 버전: {run.ruleEngineVersion}
              </span>
              <span className="text-xs font-bold text-[#002C5F] group-hover:text-blue-900 flex items-center gap-1">
                <span>다각도 분석 상세 결과 보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
