import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Search,
  UploadCloud,
  Zap,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Settings,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import { OfficialData, UserRole } from '../types';
import { ROLE_DEFINITIONS } from '../roleAccess';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  pendingReviewsCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  officialData?: OfficialData | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  pendingReviewsCount = 1,
  isMobileOpen = false,
  onCloseMobile,
  officialData,
}) => {
  const allMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'notices', label: '공지 / 자료실', icon: FileText },
    { id: 'hts', label: 'HTS 품목 관리', icon: Search },
    { id: 'shipments', label: '통관 신고서 관리', icon: UploadCloud },
    { id: 'analysis', label: '사전 분석 실행', icon: Zap },
    { id: 'results', label: '오분류 분석 결과', icon: BarChart3 },
    {
      id: 'reviews',
      label: '정정 검토 요청',
      icon: CheckCircle2,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    { id: 'validation', label: '자료 연결 상태', icon: TrendingUp },
    { id: 'impact', label: '관세 영향 시각화', icon: PieChart },
    { id: 'settings', label: '설정', icon: Settings },
  ];
  const roleDefinition = ROLE_DEFINITIONS[userRole];
  const menuItems = allMenuItems.filter(item => roleDefinition.tabs.includes(item.id));

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <aside className="w-64 bg-[#0A1128] text-slate-300 flex flex-col shrink-0 h-screen border-r border-slate-800/80 shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/90 bg-gradient-to-b from-[#0F1C3F] to-[#0A1128] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#002C5F] border border-cyan-500/40 rounded-xl flex items-center justify-center font-black text-cyan-400 text-lg shadow-inner">
            HG
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white font-black text-sm tracking-wide">
                HYUNDAI GLOVIS
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-semibold block leading-snug">
              미국 KD 세관 사전확인
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Active work view */}
      <div className="mx-3.5 my-3.5 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/70 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-2 truncate">
          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-200 font-medium truncate">
            {roleDefinition.label}
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {roleDefinition.shortLabel} 전용 메뉴
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md font-semibold border border-cyan-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status Box */}
      <div className="p-3.5 m-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 공식 자료
          </span>
          <span className="text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            {officialData ? `${officialData.sources.length}개 연결` : '확인 중'}
          </span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block z-30 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
