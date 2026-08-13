import React from 'react';
import { Database, ExternalLink, FileCheck2, GitCompareArrows, Bot } from 'lucide-react';
import { OfficialData } from '../../types';

interface ValidationDashboardViewProps {
  officialData: OfficialData | null;
  dataMessage: string;
}

export const ValidationDashboardView: React.FC<ValidationDashboardViewProps> = ({ officialData, dataMessage }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#002C5F]" />
          <span>자료 연결 상태</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          분석에 사용하는 공식 공지와 미국 관세율표의 출처, 판본, 반영 범위를 확인합니다.
        </p>
      </div>

      <div className={`p-4 rounded-2xl border text-xs font-bold ${officialData ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
        {dataMessage}
      </div>

      {officialData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Metric icon={<FileCheck2 className="w-4 h-4" />} label="연결된 공식 자료" value={`${officialData.sources.length}개`} note="공지·HTS·세관 안내" />
            <Metric icon={<GitCompareArrows className="w-4 h-4" />} label="판본 비교" value={`${officialData.dataset.previousVersion.replace('HTS 2025 ', '')} → ${officialData.dataset.currentVersion.replace('HTS 2025 ', '')}`} note="직전판과 최신판" />
            <Metric icon={<Database className="w-4 h-4" />} label="품목번호가 있는 행" value={officialData.dataset.currentRowCount.toLocaleString()} note="최신 HTS 판본" />
            <Metric icon={<Bot className="w-4 h-4" />} label="AI 도우미" value={officialData.aiConfigured ? '사용 가능' : '설정 필요'} note={officialData.aiConfigured ? '질문 응답 연결됨' : 'API 키를 설정하세요'} />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">공식 자료와 사용 위치</h3>
              <p className="text-[11px] text-slate-500 mt-1">영문 원문은 그대로 두고, 화면 설명과 요약은 한국어로 제공합니다.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600">
                  <tr><th className="py-3 px-4">자료</th><th className="py-3 px-4">기관</th><th className="py-3 px-4">화면에서 사용하는 곳</th><th className="py-3 px-4">언어</th><th className="py-3 px-4">원문</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {officialData.sources.map(source => (
                    <tr key={source.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{source.nameKo}</td>
                      <td className="py-3 px-4 text-slate-600">{source.publisher}</td>
                      <td className="py-3 px-4 text-slate-600">{source.purpose}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{source.language}</td>
                      <td className="py-3 px-4"><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#002C5F] font-bold hover:underline">보기 <ExternalLink className="w-3 h-3" /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
            <b>확인 원칙:</b> 이 화면은 변경 가능성이 있는 품목을 찾는 데 사용합니다. 실제 신고 품목번호, 원산지 자격, 적용 세율과 신고 수정 여부는 수입신고 책임자와 관세사가 원문 및 개별 서류로 최종 확인해야 합니다.
          </div>
        </>
      )}
    </div>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string; note: string }> = ({ icon, label, value, note }) => (
  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">{icon}{label}</span>
    <div className="text-xl font-extrabold text-[#002C5F]">{value}</div>
    <p className="text-[10px] text-slate-500">{note}</p>
  </div>
);
