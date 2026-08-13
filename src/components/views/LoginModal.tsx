import React from 'react';
import { X } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  userRole,
  setUserRole,
}) => {
  if (!isOpen) return null;

  const selectView = (role: UserRole) => {
    setUserRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-white text-sm">
              KD
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                업무 화면 선택
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                담당 업무에 맞는 화면을 선택하세요
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            어떤 업무를 담당하시나요?
          </label>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              type="button"
              onClick={() => selectView('kd_manager')}
              className={`p-3 rounded-xl border text-left transition-all ${
                userRole === 'kd_manager'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 font-bold text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">수출 관리</div>
              <p className="text-[10px] text-slate-500 font-normal">
                선적 자료를 등록하고 품목별 관세 영향을 확인합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectView('import_filer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                userRole === 'import_filer'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 font-bold text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">미국 통관</div>
              <p className="text-[10px] text-slate-500 font-normal">
                수입신고 내용과 미국 품목번호, 수정 필요사항을 검토합니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectView('reviewer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                userRole === 'reviewer'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 font-bold text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold">원산지 검토</div>
              <p className="text-[10px] text-slate-500 font-normal">
                원산지 판정에 필요한 품목 정보와 증빙 확인사항을 살펴봅니다.
              </p>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
          화면 선택은 메뉴 구성을 이해하기 쉽게 바꾸며, 같은 업무 자료를 함께 사용합니다.
        </p>
      </div>
    </div>
  );
};
