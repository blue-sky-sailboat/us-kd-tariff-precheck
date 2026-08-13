import React from 'react';
import { PieChart, ShieldAlert } from 'lucide-react';
import { Shipment } from '../../types';

interface ImpactVisualizationViewProps {
  shipments: Shipment[];
}

export const ImpactVisualizationView: React.FC<ImpactVisualizationViewProps> = ({ shipments }) => {
  const totalDutyDeclaredUsd = shipments.reduce((acc, s) => acc + s.declaredTotalDutyUsd, 0);
  const totalDutyCalculatedUsd = shipments.reduce((acc, s) => acc + (s.calculatedTotalDutyUsd || s.declaredTotalDutyUsd), 0);
  const totalDifferenceUsd = totalDutyCalculatedUsd - totalDutyDeclaredUsd;
  const impactGroups = new Map<string, { chapter: string; declaredDuty: number; difference: number; items: number }>();
  shipments.flatMap(shipment => shipment.items).forEach(item => {
    const chapter = item.declaredHtsCode.slice(0, 2) || '미정';
    const current = impactGroups.get(chapter) || { chapter, declaredDuty: 0, difference: 0, items: 0 };
    current.declaredDuty += item.declaredValueUsd * item.dutyRateDeclared / 100;
    current.difference += item.dutyDifferenceUsd || 0;
    current.items += 1;
    impactGroups.set(chapter, current);
  });
  const chapterImpact = Array.from(impactGroups.values()).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  const maxImpact = Math.max(...chapterImpact.map(group => Math.abs(group.difference)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#002C5F]" />
          <span>관세 변경 영향 보기</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          등록된 선적 자료를 바탕으로 품목별 관세 차이와 업무상 확인이 필요한 영역을 보여줍니다.
        </p>
      </div>

      {/* Financial Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500">신고된 관세 총액</span>
          <div className="text-2xl font-extrabold text-slate-900">${totalDutyDeclaredUsd.toLocaleString()} USD</div>
          <p className="text-[10px] text-slate-500">등록된 선적 자료 합계</p>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/30 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-rose-800">검토 결과 예상 관세 총액</span>
          <div className="text-2xl font-extrabold text-rose-600">${totalDutyCalculatedUsd.toLocaleString()} USD</div>
          <p className="text-[10px] text-rose-700">품목별 계산 관세율 합계</p>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/30 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-xs font-bold text-amber-900">예상 관세 차이</span>
          <div className="text-2xl font-extrabold text-amber-900">+${totalDifferenceUsd.toLocaleString()} USD</div>
          <p className="text-[10px] text-amber-800 font-bold">신고 내용 수정 검토가 필요한 예상 금액</p>
        </div>
      </div>

      {/* Visual Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7: Category Impact Bar Visualizer */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>품목번호 장별 관세 차이</span>
            <span className="text-xs text-[#002C5F] font-bold">등록 자료 기준</span>
          </h3>

          <div className="space-y-3 text-xs">
            {chapterImpact.length ? chapterImpact.map((group, index) => (
              <div key={group.chapter} className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex justify-between gap-4 font-bold text-slate-900">
                  <span>{index + 1}. HTS 제{group.chapter}류 · {group.items}개 품목</span>
                  <span className={group.difference > 0 ? 'text-rose-600' : group.difference < 0 ? 'text-emerald-700' : 'text-slate-600'}>
                    {group.difference > 0 ? '+' : ''}${group.difference.toLocaleString()} USD
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className={group.difference > 0 ? 'bg-rose-500 h-full' : group.difference < 0 ? 'bg-emerald-500 h-full' : 'bg-slate-400 h-full'} style={{ width: `${group.difference === 0 ? 4 : Math.max(8, Math.abs(group.difference) / maxImpact * 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">신고 관세 ${group.declaredDuty.toLocaleString()} · 계산값과의 차이</p>
              </div>
            )) : <p className="text-slate-500">표시할 선적 품목이 없습니다.</p>}
          </div>
        </div>

        {/* Right 5: Top Risk Mitigation Actions */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>관세 위험 완화 권고 대책</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="font-bold text-rose-900 block text-xs">
                1. 수입신고 내용 수정 가능 여부 확인
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                신고 상태와 정산 여부에 따라 수정 절차가 달라질 수 있습니다. 관세사가 미국 세관 시스템(ACE)에서 가능한 조치와 기한을 확인합니다.
              </p>
            </div>

            <div className="p-3.5 bg-cyan-50/60 border border-cyan-200 rounded-xl space-y-1">
              <span className="font-bold text-[#002C5F] block text-xs">
                2. 한미 자유무역협정 원산지 자료 확인
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                품목별 원산지 기준, 부품명세서(BOM), 공급자 확인서와 원산지증명서가 서로 일치하는지 확인합니다. 협정세율 적용 가능 여부는 원산지 담당자가 판정합니다.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block text-xs">
                3. 필요한 경우 미국 세관 사전심사 검토
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                모호한 EV 배터리 케이싱의 경우 CBP 사전심사(Ruling)를 신청하여 공식 인정 서신을 확보합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
