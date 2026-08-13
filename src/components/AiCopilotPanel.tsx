import React, { useState } from 'react';
import { Sparkles, X, Send, BookOpen, ShieldCheck, RefreshCw, MessageSquare, KeyRound, Trash2 } from 'lucide-react';
import { CopilotMessage, Shipment, HtsItem } from '../types';

interface AiCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  onSendMessage: (text: string) => void | Promise<void>;
  aiMode: 'server' | 'personal' | 'guided';
  onConnectPersonalAi: (apiKey: string) => void;
  onDisconnectPersonalAi: () => void;
  activeContext?: {
    screenName: string;
    shipment?: Shipment | null;
    htsItem?: HtsItem | null;
  };
}

export const AiCopilotPanel: React.FC<AiCopilotPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  aiMode,
  onConnectPersonalAi,
  onDisconnectPersonalAi,
  activeContext,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    setLoading(true);
    try {
      await onSendMessage(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs lg:hidden z-40 transition-opacity"
        onClick={onClose}
      />

      <aside className="w-full sm:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-screen fixed right-0 top-0 z-50 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-[#002C5F] text-white flex items-center justify-between shrink-0 border-b border-cyan-500/20">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              AI 관세 도우미
            </h3>
            <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {aiMode === 'guided' ? '자료 분석 모드' : aiMode === 'personal' ? '개인 Gemini 연결됨' : '서버 AI 연결됨'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="border-b border-slate-200 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-black text-slate-800">
              {aiMode === 'guided' ? '생성형 AI를 연결하면 자유 질문이 가능합니다.' : '생성형 AI 사용 가능'}
            </p>
            <p className="text-[9px] text-slate-500">키는 이 브라우저 탭에만 보관되며 저장소에 업로드되지 않습니다.</p>
          </div>
          {aiMode === 'personal' ? (
            <button onClick={onDisconnectPersonalAi} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700">
              <Trash2 className="h-3 w-3" /> 연결 해제
            </button>
          ) : aiMode === 'guided' ? (
            <button onClick={() => setShowConnection(value => !value)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#002C5F] px-2.5 py-1.5 text-[10px] font-bold text-white">
              <KeyRound className="h-3 w-3" /> 개인 AI 연결
            </button>
          ) : null}
        </div>
        {showConnection && aiMode === 'guided' && (
          <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (!apiKey.trim()) return; onConnectPersonalAi(apiKey.trim()); setApiKey(''); setShowConnection(false); }}>
            <input type="password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="Gemini API 키 입력" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] focus:border-cyan-500 focus:outline-none" />
            <button type="submit" disabled={!apiKey.trim()} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-black text-white disabled:opacity-40">연결</button>
          </form>
        )}
      </div>

      {/* Screen Context Banner */}
      {activeContext && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex items-center justify-between shrink-0">
          <div className="truncate">
            <span className="font-bold text-slate-900 block text-[11px]">
              맥락: {activeContext.screenName}
            </span>
            {activeContext.shipment && (
              <span className="text-[10px] text-slate-500 font-mono block truncate">
                {activeContext.shipment.entryNumber} ({activeContext.shipment.shipmentTitle})
              </span>
            )}
            {activeContext.htsItem && (
              <span className="text-[10px] text-[#002C5F] font-mono font-bold block">
                HTS {activeContext.htsItem.htsCode} ({activeContext.htsItem.category})
              </span>
            )}
          </div>
          <span className="px-2 py-0.5 rounded bg-[#002C5F]/10 text-[#002C5F] text-[10px] font-bold border border-[#002C5F]/20 shrink-0">
            화면 정보 포함
          </span>
        </div>
      )}

      {/* Quick Prompts / Recommendations */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 shrink-0 space-y-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-[#002C5F]" /> 자주 묻는 질문
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSendMessage("Section 301 관세율 적용 대상 품목을 찾아주세요.")}
            className="text-[11px] bg-white border border-slate-200 hover:border-cyan-500 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left truncate max-w-full font-medium"
          >
            ⚡ 추가관세 영향 확인
          </button>
          <button
            onClick={() => onSendMessage("HTS 8708.29호 미 세관(CBP) 주요 판례 근거는?")}
            className="text-[11px] bg-white border border-slate-200 hover:border-cyan-500 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left truncate max-w-full font-medium"
          >
            📜 HTS 8708.29 확인 근거
          </button>
          <button
            onClick={() => onSendMessage("Post Summary Correction(PSC) 제출 절차 가이드")}
            className="text-[11px] bg-white border border-slate-200 hover:border-cyan-500 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left truncate max-w-full font-medium"
          >
            ⚖️ 신고 내용 수정 절차
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#002C5F] text-white shadow-2xs font-medium'
                  : 'bg-slate-100 border border-slate-200 text-slate-800'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] space-y-1">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#002C5F]" /> 법률/규정 근거 원문:
                  </span>
                  <ul className="list-disc pl-3 text-slate-600 space-y-0.5 font-mono">
                    {msg.sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#002C5F] bg-cyan-50 p-2.5 rounded-lg border border-cyan-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600" />
            <span>연결된 자료와 화면 정보를 확인하고 있습니다...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="KD 부품명, HTS 관세 질문을 입력하세요..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 bg-[#002C5F] hover:bg-blue-900 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center font-mono">
          답변의 근거와 추가 확인사항을 함께 안내합니다.
        </p>
      </div>
    </aside>
  </>
  );
};
