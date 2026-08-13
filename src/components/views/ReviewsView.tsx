import React, { useState } from 'react';
import { ReviewRequest, UserRole } from '../../types';
import { CheckCircle2, XCircle, MessageSquare, ShieldCheck } from 'lucide-react';

interface ReviewsViewProps {
  reviews: ReviewRequest[];
  onUpdateReviewStatus: (reviewId: string, newStatus: 'approved' | 'rejected' | 'psc_filed', comment?: string) => void;
  userRole: UserRole;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  onUpdateReviewStatus,
  userRole,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

  const filteredReviews = reviews.filter(r => selectedStatus === 'all' || r.status === selectedStatus);

  const handleAction = (reviewId: string, status: 'approved' | 'rejected' | 'psc_filed') => {
    const comment = commentInput[reviewId] || '';
    onUpdateReviewStatus(reviewId, status, comment);
    setCommentInput(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#002C5F]" />
          <span>검토 및 확인 요청 목록</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          수출 담당자, 미국 통관 담당자와 원산지 담당자가 품목번호와 신고 수정 필요사항을 함께 검토합니다.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
        {userRole === 'kd_manager' && '수출 관리 화면: 요청 내용과 진행 상태를 확인합니다. 최종 확인 처리는 미국 통관 또는 원산지 검토 화면에서 진행합니다.'}
        {userRole === 'import_filer' && '미국 통관 화면: 신고 품목번호와 관세율을 확인하고, 실제 신고 시스템에 사용할 수정 자료의 준비 상태를 관리합니다.'}
        {userRole === 'reviewer' && '원산지 검토 화면: 원산지 기준과 증빙 내용을 확인한 뒤 승인 또는 재검토 의견을 남깁니다.'}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: '전체 요청' },
          { id: 'pending', label: '검토 대기 (Pending)' },
          { id: 'approved', label: '승인 완료 (Approved)' },
          { id: 'rejected', label: '반려/재검토 (Rejected)' },
          { id: 'psc_filed', label: '수정 자료 준비 완료' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedStatus === tab.id
                ? 'bg-[#002C5F] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#002C5F]/10 text-[#002C5F] font-mono font-bold text-xs border border-[#002C5F]/20">
                  {rev.id}
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  신고번호: {rev.entryNumber}
                </span>
              </div>

              <div>
                {rev.status === 'pending' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    검토 대기중
                  </span>
                )}
                {rev.status === 'approved' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    승인 완료
                  </span>
                )}
                {rev.status === 'rejected' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    반려
                  </span>
                )}
                {rev.status === 'psc_filed' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    수정 자료 준비 완료
                  </span>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono font-bold">대상 품명</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{rev.partName}</p>
                <p className="text-[11px] text-slate-500 font-medium">요청자: {rev.requestedBy}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>기존 신고:</span>
                  <span className="font-semibold text-rose-600 line-through">{rev.declaredHts}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold">
                  <span>정정 추천 HTS:</span>
                  <span className="text-[#002C5F]">{rev.suggestedHts}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#002C5F] text-[11px]">검토 요청 사유:</span>
              <p className="text-slate-700 leading-relaxed font-medium">{rev.reasonKo}</p>
            </div>

            {/* Existing Comments */}
            {rev.comment && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs space-y-1 font-mono">
                <span className="font-bold text-slate-700 text-[10px] flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-500" /> 수입전담자 검토 의견:
                </span>
                <p className="text-slate-800 font-medium">{rev.comment}</p>
              </div>
            )}

            {/* Action Buttons for Pending Status */}
            {rev.status === 'pending' && userRole !== 'kd_manager' && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <input
                  type="text"
                  placeholder="검토 의견 및 코멘트 입력 (선택사항)..."
                  value={commentInput[rev.id] || ''}
                  onChange={(e) => setCommentInput({ ...commentInput, [rev.id]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium"
                />

                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleAction(rev.id, 'rejected')}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>반려</span>
                  </button>

                  <button
                    onClick={() => handleAction(rev.id, 'approved')}
                    className="px-3.5 py-1.5 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1 border border-cyan-400/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{userRole === 'reviewer' ? '원산지 확인' : '검토 승인'}</span>
                  </button>

                  {userRole === 'import_filer' && <button
                    onClick={() => handleAction(rev.id, 'psc_filed')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>신고 수정 자료 준비 완료</span>
                  </button>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
