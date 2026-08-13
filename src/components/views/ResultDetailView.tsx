import React, { useState } from 'react';
import { AnalysisRun, Shipment, LineItem } from '../../types';
import { ArrowLeft, ShieldAlert, CheckCircle2, Sparkles, BookOpen, Send, Check } from 'lucide-react';

interface ResultDetailViewProps {
  run: AnalysisRun | null;
  shipment: Shipment | null;
  onBack: () => void;
  onRequestReview: (item: LineItem, reason: string) => void;
  onNavigate: (tab: string) => void;
}

export const ResultDetailView: React.FC<ResultDetailViewProps> = ({
  run,
  shipment,
  onBack,
  onRequestReview,
  onNavigate,
}) => {
  const [selectedItem, setSelectedItem] = useState<LineItem | null>(
    shipment?.items[1] || shipment?.items[0] || null
  );
  const [reviewReason, setReviewReason] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  if (!shipment) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-xs text-slate-500 font-mono">선택된 사전 분석 결과가 없습니다.</p>
        <button onClick={onBack} className="mt-3 px-4 py-2 bg-[#002C5F] text-white rounded-xl text-xs font-bold">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleSendRequest = () => {
    if (!selectedItem) return;
    onRequestReview(selectedItem, reviewReason || 'Section 301 가산관세 적용 및 HTS 오분류 정정검토 요청');
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      onNavigate('reviews');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>분석 결과 목록으로 돌아가기</span>
          </button>

          <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-mono font-bold border border-rose-200">
            다각도 정밀 관세분석
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#002C5F] bg-[#002C5F]/10 border border-[#002C5F]/20 px-2 py-0.5 rounded-lg">
              Entry No: {shipment.entryNumber}
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {shipment.shipmentTitle}
            </h1>
          </div>

          <div className="text-right font-mono text-xs text-slate-600">
            <p>수입신고인: <strong className="text-slate-900">{shipment.importerOfRecord}</strong></p>
            <p>신고일자: {shipment.importDate}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Item Table & Detail Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7: HTS Diff Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>신고서 품목별 HTS Diff 및 오분류 판정</span>
            <span className="text-xs text-slate-500 font-mono font-normal">
              총 {shipment.items.length}개 품목
            </span>
          </h3>

          <div className="space-y-3">
            {shipment.items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const hasDiff = item.declaredHtsCode !== item.recommendedHtsCode;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-50/40 border-cyan-500 ring-2 ring-cyan-500/20 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {item.itemNumber}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                        {item.partNameKo}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {item.partNameEn}
                      </p>
                    </div>

                    {item.pscRequired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> PSC 정정필요
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 적격
                      </span>
                    )}
                  </div>

                  {/* HTS Code Comparison (Diff) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2 bg-white border border-slate-200 rounded-xl">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">기존 신고 HTS</span>
                      <span className={`font-bold block ${hasDiff ? 'text-rose-600 line-through' : 'text-slate-800'}`}>
                        {item.declaredHtsCode} ({item.dutyRateDeclared.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="p-2 bg-cyan-50/80 border border-cyan-200 rounded-xl">
                      <span className="text-[9px] text-[#002C5F] block uppercase font-bold">AI 추천 HTS</span>
                      <span className="font-bold text-[#002C5F] block">
                        {item.recommendedHtsCode || item.declaredHtsCode} ({(item.dutyRateCalculated || item.dutyRateDeclared).toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Difference amount */}
                  {item.dutyDifferenceUsd && item.dutyDifferenceUsd > 0 ? (
                    <div className="text-[11px] font-mono text-rose-700 font-extrabold text-right pt-0.5">
                      관세 차액 (추가 부담금): +${item.dutyDifferenceUsd.toLocaleString()} USD
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5: Legal Rationale & Review Request Action */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-5">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-[#002C5F] bg-[#002C5F]/10 border border-[#002C5F]/20 px-2 py-0.5 rounded-lg">
                  선택 품목: {selectedItem.itemNumber}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedItem.partNameKo}
                </h3>
              </div>

              {/* AI Confidence & Ruling Rationale */}
              <div className="p-3.5 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#002C5F] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" /> AI 판정 신뢰도
                  </span>
                  <span className="text-xs font-extrabold font-mono text-[#002C5F]">
                    {selectedItem.confidenceScore}% Match
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  {selectedItem.notes || '미 세관 최근 가산관세 규정 개정안에 따른 HTS 8708호 세번 재분류 대상입니다.'}
                </div>
              </div>

              {/* Legal Citation Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" /> 미 세관 CBP 법적 근거 인용 (Legal Citation)
                </h4>
                <p className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                  {selectedItem.ruleCitation || 'CBP Ruling HQ H301192 / 19 CFR § 152.11'}
                </p>
              </div>

              {/* Duty Financial Matrix */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 font-mono text-xs">
                <h4 className="font-bold text-slate-900 font-sans text-xs">예상 관세액 비교</h4>
                <div className="flex justify-between text-slate-600">
                  <span>신고 가액 (Declared Value):</span>
                  <span className="font-semibold text-slate-900">${selectedItem.declaredValueUsd.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>기존 신고 관세율:</span>
                  <span>{selectedItem.dutyRateDeclared.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1.5">
                  <span>AI 검증 산출 관세율:</span>
                  <span>{(selectedItem.dutyRateCalculated || selectedItem.dutyRateDeclared).toFixed(1)}%</span>
                </div>
              </div>

              {/* Request Review Form (SCR-10) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-xs text-slate-900">
                  수입전담자 / 검토자 정정 검토 요청
                </h4>
                <textarea
                  rows={2}
                  placeholder="검토 요청 사유 및 의견을 입력하세요..."
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                />

                <button
                  onClick={handleSendRequest}
                  disabled={requestSent}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all border border-cyan-400/30"
                >
                  {requestSent ? (
                    <>
                      <Check className="w-4 h-4 text-cyan-300" />
                      <span>검토 요청이 전송되었습니다!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>수입전담자에게 HTS 정정 검토 요청 보내기</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono text-center py-8">
              좌측 목록에서 검토할 품목을 선택하세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
