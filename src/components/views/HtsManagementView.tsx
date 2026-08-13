import React, { useState } from 'react';
import { HtsItem, OfficialData } from '../../types';
import { Search, Plus, ShieldAlert, X, Database } from 'lucide-react';

interface HtsManagementViewProps {
  htsItems: HtsItem[];
  onAddHtsItem: (item: Omit<HtsItem, 'id' | 'updatedAt'>) => void;
  readOnly?: boolean;
  officialData: OfficialData | null;
}

export const HtsManagementView: React.FC<HtsManagementViewProps> = ({
  htsItems,
  onAddHtsItem,
  readOnly = false,
  officialData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [htsCode, setHtsCode] = useState('');
  const [descKo, setDescKo] = useState('');
  const [descEn, setDescEn] = useState('');
  const [genDuty, setGenDuty] = useState(2.5);
  const [sec301, setSec301] = useState(25.0);
  const [category, setCategory] = useState('Body Parts & Accessories');

  const filteredItems = htsItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.htsCode.includes(searchQuery) ||
                          item.descriptionKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitNewHts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htsCode || !descKo) return;

    onAddHtsItem({
      htsCode,
      descriptionKo: descKo,
      descriptionEn: descEn || descKo,
      generalDutyRate: genDuty,
      section301Rate: sec301,
      ftaRate: 0.0,
      unit: 'PCS',
      chapter: htsCode.slice(0, 2),
      category,
    });

    setIsModalOpen(false);
    setHtsCode('');
    setDescKo('');
    setDescEn('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#002C5F]" />
            <span>미국 품목번호(HTS) 조회 및 관세율 관리</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            공식 관세율표의 변경 내용을 확인하고, 회사 품목과 연결할 미국 품목번호를 관리합니다.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="HTS 코드(예: 8708.29) 또는 품명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
            />
          </div>

          {!readOnly ? <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all shrink-0 border border-cyan-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>신규 HTS 등록</span>
          </button> : <span className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-800">기준 조회 전용</span>}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#002C5F]" /> 공식 HTS 판본 변경
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {officialData ? `${officialData.dataset.previousVersion}과 ${officialData.dataset.currentVersion}을 품목번호 기준으로 비교했습니다.` : '공식 HTS 자료를 불러오는 중입니다.'}
            </p>
          </div>
          {officialData && <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">변경 {officialData.htsChanges.length}건</span>}
        </div>
        {officialData && (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600">
                <tr><th className="py-3 px-4">품목번호</th><th className="py-3 px-4">변경</th><th className="py-3 px-4">영문 원문 설명</th><th className="py-3 px-4">변경 후 기본세율</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officialData.htsChanges.map(change => (
                  <tr key={change.htsCode} className="align-top hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#002C5F] whitespace-nowrap">{change.htsCode}</td>
                    <td className="py-3 px-4 whitespace-nowrap"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px]">{change.changeType}</span></td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 min-w-[420px]">{change.descriptionEn}</td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">{change.generalRateAfter || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'Body Parts & Accessories', 'Powertrain', 'EV Electronics', 'Engines', 'Steel Articles'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#002C5F] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? '전체 품목 카테고리' : cat}
          </button>
        ))}
      </div>

      {/* Company HTS item mapping table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">회사 품목 연결표</h3>
          <p className="text-[11px] text-slate-500 mt-1">회사 품목과 신고에 사용하는 미국 품목번호를 연결해 관리합니다. 최종 분류는 담당 관세사가 확인합니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">HTS 코드 (10자리)</th>
                <th className="py-3 px-4">품목 설명 (한글 / 영문)</th>
                <th className="py-3 px-4">카테고리</th>
                <th className="py-3 px-4 text-center">기본 관세율 (Col. 1)</th>
                <th className="py-3 px-4 text-center">Sec 301 특별관세</th>
                <th className="py-3 px-4 text-center">한-미 FTA 관세율</th>
                <th className="py-3 px-4 text-center">최종 적용 관세율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredItems.map((item) => {
                const totalDuty = item.generalDutyRate + item.section301Rate;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#002C5F] text-xs sm:text-sm">
                      {item.htsCode}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 max-w-md">
                      <p className="font-bold text-slate-900 text-xs">{item.descriptionKo}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{item.descriptionEn}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {item.generalDutyRate.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {item.section301Rate > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> +{item.section301Rate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0.0%</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-emerald-700 font-bold">
                      {item.ftaRate.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                      {totalDuty > 10 ? (
                        <span className="text-rose-600 font-black">{totalDuty.toFixed(1)}%</span>
                      ) : (
                        <span>{totalDuty.toFixed(1)}%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New HTS Item Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#002C5F]" />
                <span>신규 HTS 품목 등록</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewHts} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HTS 코드 (10자리)</label>
                <input
                  type="text"
                  placeholder="예: 8708.29.5060"
                  value={htsCode}
                  onChange={(e) => setHtsCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">품목 설명 (한글)</label>
                <input
                  type="text"
                  placeholder="예: 자동차 측면 도어 내장 강판 프레스"
                  value={descKo}
                  onChange={(e) => setDescKo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">품목 설명 (영문)</label>
                <input
                  type="text"
                  placeholder="예: Stamped Door Inner Steel Panel"
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">기본 관세율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={genDuty}
                    onChange={(e) => setGenDuty(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sec 301 관세율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sec301}
                    onChange={(e) => setSec301(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                >
                  <option value="Body Parts & Accessories">Body Parts & Accessories</option>
                  <option value="Powertrain">Powertrain</option>
                  <option value="EV Electronics">EV Electronics</option>
                  <option value="Engines">Engines</option>
                  <option value="Steel Articles">Steel Articles</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
