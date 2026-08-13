import React, { useState } from 'react';
import { Notice, OfficialData } from '../../types';
import { FileText, Search, ExternalLink, AlertCircle, BookOpen, ChevronRight, X, Database } from 'lucide-react';

interface NoticesViewProps {
  notices: Notice[];
  officialData: OfficialData | null;
  dataMessage: string;
}

export const NoticesView: React.FC<NoticesViewProps> = ({ notices, officialData, dataMessage }) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = notices.filter(n => {
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch = n.titleKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.summaryKo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#002C5F]" />
            <span>미국 관세 공지 및 참고자료</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            미국 연방 관보와 세관 자료의 한국어 요약, 시행일, 공식 원문을 함께 확인합니다.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="공지 제목, HTS 규정 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
          />
        </div>
      </div>

      <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${officialData ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 shrink-0" />
          <span className="font-bold">{dataMessage}</span>
        </div>
        {officialData && (
          <span className="text-[11px]">
            기준: {officialData.dataset.previousVersion} → {officialData.dataset.currentVersion}
          </span>
        )}
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'Federal Register', 'CBP Notice', 'Tariff Rate Change', 'Customs Directive'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#002C5F] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? '전체 공지 (All)' : cat}
          </button>
        ))}
      </div>

      {/* Notices Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedNotice(n)}
            className="bg-white border border-slate-200/80 hover:border-cyan-500 rounded-2xl p-5 shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#002C5F]/10 text-[#002C5F] border border-[#002C5F]/20">
                    {n.category}
                  </span>
                  {n.isImportant && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> 필독 규정
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">시행일자: {n.effectiveDate}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#002C5F] transition-colors">
                  {n.titleKo}
                </h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-3xl">
                  {n.titleEn}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#002C5F] transition-colors shrink-0" />
            </div>

            {/* Korean summary */}
            <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#002C5F] text-[11px] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" /> 한국어 핵심 요약
              </span>
              <p className="text-slate-700 text-xs leading-relaxed font-medium">{n.summaryKo}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800 space-y-5 p-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#002C5F]/10 text-[#002C5F] border border-[#002C5F]/20">
                  {selectedNotice.category} 상세
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                  {selectedNotice.titleKo}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  {selectedNotice.titleEn}
                </p>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Korean summary */}
            <div className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-1.5">
              <h4 className="font-bold text-xs text-[#002C5F] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-600" /> 한국어 핵심 요약
              </h4>
              <p className="text-xs text-[#002C5F] leading-relaxed font-medium">
                {selectedNotice.summaryKo}
              </p>
            </div>

            {(selectedNotice.documentNumber || selectedNotice.citation || selectedNotice.publicationDate) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><b>문서번호</b><br />{selectedNotice.documentNumber || '-'}</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><b>공식 인용</b><br />{selectedNotice.citation || '-'}</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200"><b>게시일</b><br />{selectedNotice.publicationDate || '-'}</div>
              </div>
            )}

            {/* Detailed Content */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <BookOpen className="w-4 h-4 text-slate-500" /> Federal Register / CBP 원문 규정
              </h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedNotice.contentEn}
              </div>
            </div>

            {/* Federal Register Link */}
            {selectedNotice.federalRegisterUrl && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={selectedNotice.federalRegisterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#002C5F] hover:underline"
                >
                  <span>미 정부 Federal Register 원문 공시 보기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
