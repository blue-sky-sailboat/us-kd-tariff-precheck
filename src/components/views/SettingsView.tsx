import React from 'react';
import { Settings, User, Database, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import { OfficialData, UserRole } from '../../types';

interface SettingsViewProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  officialData: OfficialData | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userRole, setUserRole, officialData }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#002C5F]" />
          <span>설정</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">담당 업무에 맞는 화면과 데이터 연결 상태를 확인합니다.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#002C5F]" /> 업무 화면
        </h3>
        <p className="text-xs text-slate-600">선택한 화면은 메뉴의 업무 관점을 바꿉니다. 모든 담당자가 같은 선적·공지·검토 자료를 함께 사용합니다.</p>
        <select
          value={userRole}
          onChange={(event) => setUserRole(event.target.value as UserRole)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="kd_manager">수출 관리 — 선적 등록·분석 진행</option>
          <option value="import_filer">미국 통관 — 신고 내용·수정 필요사항 검토</option>
          <option value="reviewer">원산지 검토 — 원산지 정보·증빙 확인</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#002C5F]" /> 관세 자료
        </h3>
        <StatusRow
          ready={Boolean(officialData)}
          title="공식 공지와 미국 관세율표"
          description={officialData ? `${officialData.sources.length}개 자료, HTS 변경 ${officialData.dataset.changeCount}건을 사용하고 있습니다.` : '자료를 불러오는 중이거나 서버 연결을 확인해야 합니다.'}
        />
        <StatusRow
          ready={Boolean(officialData?.aiConfigured)}
          title="AI 관세 도우미"
          description={officialData?.aiConfigured ? '질문 응답 기능을 사용할 수 있습니다.' : '사용하려면 서버 환경에 GEMINI_API_KEY를 설정해야 합니다.'}
        />
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed">
        미국 세관 시스템(ACE) 제출은 이 서비스에서 직접 처리하지 않습니다. 검토 결과를 바탕으로 관세사가 제출 자료를 준비하고, 실제 신고 시스템에서 최종 제출합니다.
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ ready: boolean; title: string; description: string }> = ({ ready, title, description }) => (
  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
    {ready ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
    <div><p className="font-bold text-xs text-slate-900">{title}</p><p className="text-[11px] text-slate-500 mt-1">{description}</p></div>
  </div>
);
