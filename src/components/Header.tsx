import React from 'react';
import { LogIn, Bell, Sparkles, Globe, Menu } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  unreadCount?: number;
  onOpenLoginModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userRole,
  setUserRole,
  copilotOpen,
  setCopilotOpen,
  unreadCount = 2,
  onOpenLoginModal,
  onToggleMobileMenu,
}) => {
  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return '대시보드';
      case 'notices':
        return '공지 및 자료실';
      case 'hts':
        return 'HTS 품목 관리';
      case 'shipments':
        return '통관 신고서 관리';
      case 'analysis':
        return '사전 분석 실행';
      case 'results':
        return '오분류 분석 결과';
      case 'result_detail':
        return 'HTS 상세 검증 결과';
      case 'reviews':
        return '정정 검토 요청 목록';
      case 'validation':
        return '자료 연결 상태';
      case 'impact':
        return '관세 영향 시각화';
      case 'settings':
        return '설정';
      default:
        return '대시보드';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Toggle & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
          title="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-slate-400 hidden md:inline tracking-wide">
          미국 KD 세관 사전확인
        </span>
        <span className="text-slate-300 hidden md:inline">/</span>
        <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          {getBreadcrumbTitle(activeTab)}
        </h1>

        {/* Connected official dataset indicator */}
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          공식 관세 자료 사용
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* User Role Switcher */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold">업무 화면:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-2xs"
          >
            <option value="kd_manager">수출 관리</option>
            <option value="import_filer">미국 통관</option>
            <option value="reviewer">원산지 검토</option>
          </select>
        </div>

        {/* Language Indicator */}
        <div className="hidden lg:flex items-center space-x-1 text-xs text-slate-600 font-semibold px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>KR / EN</span>
        </div>

        {/* AI Copilot Toggle Button */}
        <button
          onClick={() => setCopilotOpen(!copilotOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
            copilotOpen
              ? 'bg-[#002C5F] text-white shadow-blue-200 border border-cyan-400/40'
              : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
          }`}
          title="AI 관세 Copilot 토글"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onOpenLoginModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-2xs transition-all border border-cyan-400/30"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>로그인</span>
        </button>
      </div>
    </header>
  );
};
