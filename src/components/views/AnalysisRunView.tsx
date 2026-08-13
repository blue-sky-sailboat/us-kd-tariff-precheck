import React, { useState } from 'react';
import { Shipment } from '../../types';
import { Zap, Play, RefreshCw, Settings2 } from 'lucide-react';

interface AnalysisRunViewProps {
  shipments: Shipment[];
  onRunAnalysis: (shipmentId: string, confidenceThreshold: number) => void;
  onNavigate: (tab: string) => void;
}

export const AnalysisRunView: React.FC<AnalysisRunViewProps> = ({
  shipments,
  onRunAnalysis,
  onNavigate,
}) => {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(
    shipments[0]?.id || ''
  );
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [section301Check, setSection301Check] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const targetShipment = shipments.find((s) => s.id === selectedShipmentId);

  const handleStartAnalysis = () => {
    if (!selectedShipmentId) return;
    setIsAnalyzing(true);
    setCurrentStep(1);

    setTimeout(() => setCurrentStep(2), 600);
    setTimeout(() => setCurrentStep(3), 1200);
    setTimeout(() => setCurrentStep(4), 1800);

    setTimeout(() => {
      setIsAnalyzing(false);
      onRunAnalysis(selectedShipmentId, confidenceThreshold);
      onNavigate('results');
    }, 2400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#002C5F]" />
          <span>사전 분석 실행</span>
        </h2>
        <p className="text-xs text-slate-500">
          등록한 신고 자료를 미국 관세율표 판본과 대조해 품목번호, 관세율, 추가 확인이 필요한 항목을 찾습니다.
        </p>
      </div>

      {/* Analysis Options Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <span>1. 분석 대상 통관 신고서 선택</span>
            <span className="text-[11px] text-[#002C5F] font-mono font-bold">CBP 7501 Form</span>
          </h3>

          <select
            value={selectedShipmentId}
            onChange={(e) => setSelectedShipmentId(e.target.value)}
            disabled={isAnalyzing}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.entryNumber}] {s.shipmentTitle} (품목 {s.itemsCount}개, 가액 ${s.totalValueUsd.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Shipment Summary Box */}
        {targetShipment && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>수입신고인: {targetShipment.importerOfRecord}</span>
              <span className="text-[#002C5F]">입항항구: {targetShipment.portOfEntry}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>신고 관세액: ${targetShipment.declaredTotalDutyUsd.toLocaleString()}</span>
              <span>선적일자: {targetShipment.importDate}</span>
            </div>
          </div>
        )}

        {/* Analysis Parameters */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#002C5F]" />
            <span>2. 분석 기준 설정</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                품목번호 확인 신뢰도 기준 ({confidenceThreshold}%)
              </label>
              <input
                type="range"
                min="60"
                max="98"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                disabled={isAnalyzing}
                className="w-full accent-[#002C5F] cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                기준보다 낮은 품목은 담당자 확인 목록에 포함됩니다.
              </p>
            </div>

            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">미국 추가관세(Section 301) 확인</label>
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={section301Check}
                  onChange={(e) => setSection301Check(e.target.checked)}
                  disabled={isAnalyzing}
                  className="w-4 h-4 rounded text-[#002C5F] border-slate-300 focus:ring-[#002C5F]"
                />
                <span className="font-bold">입력된 품목의 추가관세 표시를 함께 확인</span>
              </label>
            </div>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {isAnalyzing && (
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#002C5F]">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-600 animate-spin" />
                <span>등록 자료를 비교하고 있습니다...</span>
              </span>
              <span>{currentStep * 25}%</span>
            </div>

            <div className="w-full bg-cyan-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#002C5F] h-full transition-all duration-500 ease-out"
                style={{ width: `${currentStep * 25}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-[#002C5F] pt-1">
              <div className={currentStep >= 1 ? 'font-bold text-[#002C5F]' : 'opacity-40'}>
                1. 서류 텍스트 파싱
              </div>
              <div className={currentStep >= 2 ? 'font-bold text-[#002C5F]' : 'opacity-40'}>
                2. HTS 마스터 매칭
              </div>
              <div className={currentStep >= 3 ? 'font-bold text-[#002C5F]' : 'opacity-40'}>
                3. 관세 조건 비교
              </div>
              <div className={currentStep >= 4 ? 'font-bold text-[#002C5F]' : 'opacity-40'}>
                4. 확인 항목 정리
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || !selectedShipmentId}
            className="flex items-center space-x-2 px-6 py-3 bg-[#002C5F] hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all border border-cyan-400/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isAnalyzing ? '분석 실행 중...' : '사전 분석 시작하기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
