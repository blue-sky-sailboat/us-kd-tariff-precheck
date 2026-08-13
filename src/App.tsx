import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AiCopilotPanel } from './components/AiCopilotPanel';

// Views
import { DashboardView } from './components/views/DashboardView';
import { NoticesView } from './components/views/NoticesView';
import { HtsManagementView } from './components/views/HtsManagementView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { AnalysisRunView } from './components/views/AnalysisRunView';
import { ResultsListView } from './components/views/ResultsListView';
import { ResultDetailView } from './components/views/ResultDetailView';
import { ReviewsView } from './components/views/ReviewsView';
import { ValidationDashboardView } from './components/views/ValidationDashboardView';
import { ImpactVisualizationView } from './components/views/ImpactVisualizationView';
import { SettingsView } from './components/views/SettingsView';
import { LoginModal } from './components/views/LoginModal';

// Initial work data used only when the server has no saved records yet.
import {
  initialHtsItems,
  initialShipments,
  initialAnalysisRuns,
  initialReviews,
  initialCopilotMessages,
} from './data/mockData';
import bundledOfficialData from '../data/official-data.json';

import { UserRole, Shipment, HtsItem, Notice, AnalysisRun, ReviewRequest, CopilotMessage, LineItem, OfficialData } from './types';
import { can, canAccessTab } from './roleAccess';
import { buildAiPrompt, buildGuidedAnswer, getSourceLabels } from './aiAssistant';

const GEMINI_INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta2/interactions';
const GEMINI_MODEL = 'gemini-3.6-flash';

function getInteractionText(interaction: any): string {
  if (typeof interaction?.output_text === 'string') return interaction.output_text;

  return (interaction?.steps || [])
    .filter((step: any) => step?.type === 'model_output')
    .flatMap((step: any) => step?.content || [])
    .filter((content: any) => content?.type === 'text' && typeof content.text === 'string')
    .map((content: any) => content.text)
    .join('\n');
}

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = window.localStorage.getItem('work-view');
    return savedRole === 'import_filer' || savedRole === 'reviewer' ? savedRole : 'kd_manager';
  });
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [personalAiKey, setPersonalAiKey] = useState(() => window.sessionStorage.getItem('gemini-api-key') || '');

  // Data State
  const [htsItems, setHtsItems] = useState<HtsItem[]>(initialHtsItems);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [runs, setRuns] = useState<AnalysisRun[]>(initialAnalysisRuns);
  const [reviews, setReviews] = useState<ReviewRequest[]>(initialReviews);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(initialCopilotMessages);
  const [officialData, setOfficialData] = useState<OfficialData | null>(null);
  const [dataMessage, setDataMessage] = useState('공식 자료를 불러오는 중입니다.');
  const hydratedRef = useRef(false);
  const apiAvailableRef = useRef(true);

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(initialShipments[0]);
  const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(initialAnalysisRuns[0]);

  useEffect(() => {
    window.localStorage.setItem('work-view', userRole);
    if (!canAccessTab(userRole, activeTab)) setActiveTab('dashboard');
  }, [userRole]);

  const navigateTo = (tab: string) => {
    setActiveTab(canAccessTab(userRole, tab) ? tab : 'dashboard');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data/bootstrap');
        if (!response.ok) throw new Error('자료 연결에 실패했습니다.');
        const data = await response.json() as OfficialData & {
          userState?: {
            htsItems: HtsItem[];
            shipments: Shipment[];
            runs: AnalysisRun[];
            reviews: ReviewRequest[];
          } | null;
        };

        setOfficialData(data);
        setNotices(data.notices);
        if (data.userState) {
          setHtsItems(data.userState.htsItems);
          setShipments(data.userState.shipments);
          setRuns(data.userState.runs);
          setReviews(data.userState.reviews);
          setSelectedShipment(data.userState.shipments[0] || null);
          setSelectedRun(data.userState.runs[0] || null);
        }
        setDataMessage(`${data.sources.length}개 공식 자료와 HTS 변경 ${data.dataset.changeCount}건을 불러왔습니다.`);
        hydratedRef.current = true;
      } catch (error) {
        console.info('Server data is unavailable; using the bundled public demo data.', error);
        apiAvailableRef.current = false;
        const staticData = bundledOfficialData as OfficialData;
        setOfficialData(staticData);
        setNotices(staticData.notices);

        const savedState = window.localStorage.getItem('kd-tariff-demo-state');
        if (savedState) {
          try {
            const data = JSON.parse(savedState) as {
              htsItems: HtsItem[];
              shipments: Shipment[];
              runs: AnalysisRun[];
              reviews: ReviewRequest[];
            };
            setHtsItems(data.htsItems);
            setShipments(data.shipments);
            setRuns(data.runs);
            setReviews(data.reviews);
            setSelectedShipment(data.shipments[0] || null);
            setSelectedRun(data.runs[0] || null);
          } catch (storageError) {
            console.error('Saved browser data could not be restored.', storageError);
          }
        }

        setDataMessage(`${staticData.sources.length}개의 공식 자료와 HTS 변경 ${staticData.dataset.changeCount}건을 정적 데모 데이터로 불러왔습니다.`);
        hydratedRef.current = true;
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const timer = window.setTimeout(async () => {
      const state = { htsItems, shipments, runs, reviews };
      window.localStorage.setItem('kd-tariff-demo-state', JSON.stringify(state));
      if (!apiAvailableRef.current) return;

      try {
        await fetch('/api/data/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
      } catch (error) {
        console.error('작업 데이터 저장 실패', error);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [htsItems, shipments, runs, reviews]);

  // Handle Copilot Messages
  const handleSendCopilotMessage = async (text: string) => {
    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCopilotMessages(prev => [...prev, userMsg]);

    try {
      const assistantContext = { role: userRole, screenName: activeTab, shipment: selectedShipment, officialData };
      let reply = '';
      let sources = getSourceLabels(officialData);

      if (apiAvailableRef.current) {
        const res = await fetch('/api/genai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, context: assistantContext }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'AI 도우미 요청을 처리하지 못했습니다.');
        reply = data.reply || '답변을 생성하지 못했습니다.';
        sources = data.sources || sources;
      } else if (personalAiKey) {
        const res = await fetch(GEMINI_INTERACTIONS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': personalAiKey,
          },
          body: JSON.stringify({
            model: GEMINI_MODEL,
            input: buildAiPrompt(text, assistantContext),
            store: false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || '개인 AI 연결을 확인해 주세요.');
        reply = getInteractionText(data) || '답변을 생성하지 못했습니다.';
      } else {
        reply = buildGuidedAnswer(text, assistantContext);
      }

      const aiReply: CopilotMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
      };

      setCopilotMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: CopilotMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: err?.message || 'AI 도우미에 연결하지 못했습니다. 설정을 확인해 주세요.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCopilotMessages(prev => [...prev, errorMsg]);
    }
  };

  // Run Analysis Handler
  const handleRunAnalysis = (shipmentId: string, confidenceThreshold: number) => {
    if (!can(userRole, 'runAnalysis')) return;
    const shipment = shipments.find(s => s.id === shipmentId);
    if (!shipment) return;

    const reviewItems = shipment.items.filter(item =>
      item.pscRequired ||
      (item.recommendedHtsCode && item.recommendedHtsCode !== item.declaredHtsCode) ||
      (item.confidenceScore ?? 100) < confidenceThreshold
    );
    const confidenceValues = shipment.items.map(item => item.confidenceScore).filter((value): value is number => value !== undefined);
    const confidenceAverage = confidenceValues.length
      ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
      : 0;
    const dutyDifferences = shipment.items.map(item => item.dutyDifferenceUsd || 0);
    const potentialPenaltyRiskUsd = dutyDifferences.filter(value => value > 0).reduce((sum, value) => sum + value, 0);
    const potentialDutySavingsUsd = Math.abs(dutyDifferences.filter(value => value < 0).reduce((sum, value) => sum + value, 0));

    const newRun: AnalysisRun = {
      id: `run-${Math.floor(10000 + Math.random() * 90000)}`,
      shipmentId: shipment.id,
      shipmentTitle: shipment.shipmentTitle,
      entryNumber: shipment.entryNumber,
      runDate: new Date().toLocaleString(),
      status: 'completed',
      totalItemsAnalyzed: shipment.itemsCount,
      mismatchedItemsCount: reviewItems.length,
      pscRequiredCount: reviewItems.filter(item => item.pscRequired).length,
      confidenceAverage: Number(confidenceAverage.toFixed(1)),
      potentialDutySavingsUsd,
      potentialPenaltyRiskUsd,
      riskSummary: reviewItems.length
        ? `${reviewItems.length}개 품목은 신고 품목번호, 관세율 또는 확인 신뢰도를 다시 검토해야 합니다.`
        : '현재 입력 자료에서 추가 검토 기준에 해당하는 품목이 없습니다.',
      ruleEngineVersion: officialData ? `${officialData.dataset.previousVersion} → ${officialData.dataset.currentVersion}` : 'HTS 비교 규칙',
      authorEmail: userRole === 'import_filer' ? '미국 통관 담당자' : userRole === 'reviewer' ? '원산지 검토 담당자' : '수출 관리 담당자',
    };

    setRuns(prev => [newRun, ...prev]);
    setSelectedShipment(shipment);
    setSelectedRun(newRun);
  };

  // Handle Review Request Creation (SCR-10)
  const handleRequestReview = (item: LineItem, reason: string) => {
    if (!selectedShipment || !can(userRole, 'requestReview')) return;

    const newReview: ReviewRequest = {
      id: `rev-${Math.floor(100 + Math.random() * 900)}`,
      shipmentId: selectedShipment.id,
      entryNumber: selectedShipment.entryNumber,
      partName: item.partNameKo,
      declaredHts: `${item.declaredHtsCode} (${item.dutyRateDeclared}%)`,
      suggestedHts: `${item.recommendedHtsCode || item.declaredHtsCode} (${(item.dutyRateCalculated || item.dutyRateDeclared)}%)`,
      requestedBy: userRole === 'import_filer' ? '미국 통관 담당자' : userRole === 'reviewer' ? '원산지 검토 담당자' : '수출 관리 담당자',
      requestedRole: userRole,
      status: 'pending',
      reasonKo: reason,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setReviews(prev => [newReview, ...prev]);
  };

  // Handle Review Status Updates
  const handleUpdateReviewStatus = (reviewId: string, newStatus: 'approved' | 'rejected' | 'psc_filed', comment?: string) => {
    if (!can(userRole, 'resolveReview')) return;
    if (newStatus === 'psc_filed' && !can(userRole, 'completePsc')) return;
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? { ...r, status: newStatus, comment: comment || r.comment, updatedAt: new Date().toLocaleString() }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        userRole={userRole}
        pendingReviewsCount={reviews.filter(r => r.status === 'pending').length}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        officialData={officialData}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          userRole={userRole}
          setUserRole={setUserRole}
          copilotOpen={copilotOpen}
          setCopilotOpen={setCopilotOpen}
          unreadCount={reviews.filter(r => r.status === 'pending').length}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className={`flex-1 p-6 lg:p-8 overflow-y-auto transition-all ${copilotOpen ? 'mr-0 lg:mr-96' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                shipments={shipments}
                runs={runs}
                userRole={userRole}
                onNavigate={navigateTo}
                onSelectShipment={(s) => {
                  setSelectedShipment(s);
                  const matchingRun = runs.find(r => r.shipmentId === s.id);
                  if (matchingRun) setSelectedRun(matchingRun);
                }}
              />
            )}

            {activeTab === 'notices' && (
              <NoticesView notices={notices} officialData={officialData} dataMessage={dataMessage} />
            )}

            {activeTab === 'hts' && (
              <HtsManagementView
                htsItems={htsItems}
                officialData={officialData}
                onAddHtsItem={(newItem) => {
                  if (!can(userRole, 'manageHts')) return;
                  const created: HtsItem = {
                    ...newItem,
                    id: `hts-${Date.now()}`,
                    updatedAt: new Date().toISOString().split('T')[0],
                  };
                  setHtsItems(prev => [created, ...prev]);
                }}
                readOnly={!can(userRole, 'manageHts')}
              />
            )}

            {activeTab === 'shipments' && (
              <ShipmentsView
                shipments={shipments}
                onSelectShipment={(s) => {
                  setSelectedShipment(s);
                  const matchingRun = runs.find(r => r.shipmentId === s.id);
                  if (matchingRun) setSelectedRun(matchingRun);
                }}
                onNavigate={navigateTo}
                onAddNewShipment={(s) => {
                  if (!can(userRole, 'upload')) return;
                  setShipments(prev => [s, ...prev]);
                  setSelectedShipment(s);
                }}
                canUpload={can(userRole, 'upload')}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisRunView
                shipments={shipments}
                onRunAnalysis={handleRunAnalysis}
                onNavigate={navigateTo}
              />
            )}

            {activeTab === 'results' && (
              <ResultsListView
                runs={runs}
                shipments={shipments}
                onSelectRun={(run) => {
                  setSelectedRun(run);
                  const s = shipments.find(sh => sh.id === run.shipmentId);
                  if (s) setSelectedShipment(s);
                  navigateTo('result_detail');
                }}
              />
            )}

            {activeTab === 'result_detail' && (
              <ResultDetailView
                run={selectedRun}
                shipment={selectedShipment}
                onBack={() => navigateTo('results')}
                onRequestReview={handleRequestReview}
                onNavigate={navigateTo}
                canRequestReview={can(userRole, 'requestReview')}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsView
                reviews={reviews}
                onUpdateReviewStatus={handleUpdateReviewStatus}
                userRole={userRole}
              />
            )}

            {activeTab === 'validation' && (
              <ValidationDashboardView officialData={officialData} dataMessage={dataMessage} />
            )}

            {activeTab === 'impact' && (
              <ImpactVisualizationView shipments={shipments} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                userRole={userRole}
                setUserRole={setUserRole}
                officialData={officialData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Right AI Copilot Panel */}
      <AiCopilotPanel
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        messages={copilotMessages}
        onSendMessage={handleSendCopilotMessage}
        aiMode={apiAvailableRef.current ? 'server' : personalAiKey ? 'personal' : 'guided'}
        onConnectPersonalAi={(apiKey) => {
          window.sessionStorage.setItem('gemini-api-key', apiKey);
          setPersonalAiKey(apiKey);
        }}
        onDisconnectPersonalAi={() => {
          window.sessionStorage.removeItem('gemini-api-key');
          setPersonalAiKey('');
        }}
        activeContext={{
          screenName: activeTab,
          shipment: selectedShipment,
        }}
      />

      {/* Login Modal (SCR-01) */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        userRole={userRole}
        setUserRole={setUserRole}
      />
    </div>
  );
}

export default function App() {
  return <MainLayout />;
}
