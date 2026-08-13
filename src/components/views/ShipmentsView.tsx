import React, { useRef, useState } from 'react';
import { Shipment } from '../../types';
import { UploadCloud, FileSpreadsheet, ArrowRight, Plus } from 'lucide-react';

interface ShipmentsViewProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  onNavigate: (tab: string) => void;
  onAddNewShipment: (shipment: Shipment) => void;
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  onSelectShipment,
  onNavigate,
  onAddNewShipment,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadMessage('현재는 CSV 파일을 등록할 수 있습니다. 파일 형식을 확인해 주세요.');
      return;
    }
    setUploading(true);
    setUploadMessage('');
    try {
      const records = parseCsv(await file.text());
      if (!records.length) throw new Error('CSV에 등록할 품목 행이 없습니다.');
      const first = records[0];
      const now = new Date();
      const items = records.map((row, index) => {
        const declaredValueUsd = toNumber(row.declaredValueUsd || row.valueUsd || row.enteredValue);
        const dutyRateDeclared = toNumber(row.dutyRateDeclared || row.dutyRate);
        return {
          id: `item-${now.getTime()}-${index + 1}`,
          itemNumber: row.itemNumber || row.lineNumber || `LINE-${String(index + 1).padStart(3, '0')}`,
          partNameKo: row.partNameKo || row.partName || row.description || '품목명 확인 필요',
          partNameEn: row.partNameEn || row.descriptionEn || row.partName || row.description || '',
          declaredHtsCode: row.declaredHtsCode || row.htsCode || '',
          declaredValueUsd,
          quantity: toNumber(row.quantity) || 1,
          dutyRateDeclared,
          dutyRateCalculated: dutyRateDeclared,
          dutyDifferenceUsd: 0,
          riskLevel: 'low' as const,
          pscRequired: false,
        };
      });
      const totalValueUsd = items.reduce((sum, item) => sum + item.declaredValueUsd, 0);
      const declaredTotalDutyUsd = items.reduce((sum, item) => sum + item.declaredValueUsd * item.dutyRateDeclared / 100, 0);
      const newShipment: Shipment = {
        id: `shipment-${now.getTime()}`,
        entryNumber: first.entryNumber || `확인중-${now.getTime()}`,
        shipmentTitle: first.shipmentTitle || file.name.replace(/\.csv$/i, ''),
        importerOfRecord: first.importerOfRecord || first.ior || '수입신고 책임자 확인 필요',
        brokerFiler: first.brokerFiler || first.broker || '관세사 확인 필요',
        carrier: first.carrier || '-',
        portOfEntry: first.portOfEntry || '-',
        exportDate: first.exportDate || '',
        importDate: first.importDate || '',
        status: 'uploaded',
        itemsCount: items.length,
        totalValueUsd,
        declaredTotalDutyUsd,
        calculatedTotalDutyUsd: declaredTotalDutyUsd,
        riskLevel: 'low',
        uploadedBy: '현재 사용자',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        items,
      };
      onAddNewShipment(newShipment);
      setUploadMessage(`${file.name}에서 품목 ${items.length}개를 등록했습니다.`);
    } catch (error: any) {
      setUploadMessage(error?.message || '파일을 읽지 못했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#002C5F]" />
            <span>통관 신고서 업로드 및 관리</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            수입신고 준비자료 또는 상업송장의 CSV를 등록해 품목별 신고 내용을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#002C5F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all disabled:opacity-50 shrink-0 border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>{uploading ? '파일을 읽는 중...' : 'CSV 파일 선택'}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        className={`p-8 border-2 border-dashed rounded-2xl text-center space-y-3 transition-all cursor-pointer ${
          isDragOver ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#002C5F]/10 text-[#002C5F] flex items-center justify-center mx-auto border border-[#002C5F]/20">
          <FileSpreadsheet className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-800">
            신고서 서류 드래그 & 드롭 또는 파일 선택
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            지원 형식: CSV · 첫 행의 열 이름을 기준으로 선적 정보와 품목을 구분합니다.
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            내 컴퓨터에서 파일 찾기
          </button>
          <a
            href="/선적자료_등록양식.csv"
            download
            onClick={(event) => event.stopPropagation()}
            className="ml-2 px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl border border-slate-300 transition-colors inline-block"
          >
            등록 양식 받기
          </a>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      {uploadMessage && <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">{uploadMessage}</div>}

      {/* Shipments Master Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs space-y-3 p-5">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          등록된 통관 신고서 목록 ({shipments.length}건)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">Entry Number (신고번호)</th>
                <th className="py-3 px-4">신고서 명칭 및 선적 정보</th>
                <th className="py-3 px-4">수입신고인 (IOR)</th>
                <th className="py-3 px-4 text-center">품목 수</th>
                <th className="py-3 px-4 text-right">총 신고 가액</th>
                <th className="py-3 px-4 text-center">진행 상태</th>
                <th className="py-3 px-4 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#002C5F]">
                    {s.entryNumber}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">{s.shipmentTitle}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      입항: {s.portOfEntry} | 선사: {s.carrier}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                    {s.importerOfRecord}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                    {s.itemsCount}개
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${s.totalValueUsd.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {s.status === 'review_required' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        검토 필요
                      </span>
                    )}
                    {s.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        승인 완료
                      </span>
                    )}
                    {s.status === 'uploaded' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        신규 업로드
                      </span>
                    )}
                    {s.status === 'analyzing' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 animate-pulse">
                        분석 중
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          onSelectShipment(s);
                          onNavigate('results');
                        }}
                        className="px-2.5 py-1 bg-[#002C5F]/10 hover:bg-[#002C5F]/20 text-[#002C5F] font-bold text-[11px] rounded-lg border border-[#002C5F]/20 transition-colors flex items-center space-x-1"
                      >
                        <span>상세/분석</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function toNumber(value?: string) {
  if (!value) return 0;
  const parsed = Number(value.replace(/[$,%\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim()); field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field.trim()); field = '';
      if (row.some(cell => cell !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(cell => cell !== '')) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map(header => header.replace(/^\uFEFF/, '').trim());
  return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}
