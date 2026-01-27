
import React, { useState } from 'react';
import { SetupData } from '../types';

interface SetupViewProps {
  setups: SetupData[];
  onEdit: (tagId: string) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ setups, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSetups = setups.filter(s => 
    s.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.codeFormat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch { return isoString; }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Cấu hình thiết lập</h2>
        <p className="text-sm text-slate-500">Danh sách các thiết bị đã được thiết lập phần mềm & tem nhãn.</p>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Tìm theo Tag ID hoặc Code Format..."
          className="w-full bg-white border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-primary/20 shadow-subtle border transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">SW Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Code Format</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">QR</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Update</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSetups.map(setup => (
                <tr key={setup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800 font-mono">{setup.tagId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      <StatusDot active={setup.win} label="W" />
                      <StatusDot active={setup.unikey} label="U" />
                      <StatusDot active={setup.printer} label="P" />
                      <StatusDot active={setup.snmp} label="SNMP" />
                      <StatusDot active={setup.welink} label="WL" />
                      <StatusDot active={setup.welinkMeeting} label="WMT" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-bold font-mono bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{setup.codeFormat}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl overflow-hidden p-1 shadow-sm flex items-center justify-center group hover:scale-150 transition-transform cursor-zoom-in relative z-10 hover:z-50 bg-white">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(setup.codeFormat)}`} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(setup.lastUpdated)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onEdit(setup.tagId)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSetups.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">settings_suggest</span>
                    <p className="text-slate-400 italic">Chưa có dữ liệu thiết lập nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusDot: React.FC<{ active: boolean; label: string }> = ({ active, label }) => (
  <div 
    title={label}
    className={`px-1.5 h-6 min-w-[24px] rounded-md flex items-center justify-center text-[8px] font-black border transition-all ${
      active ? 'bg-green-500 text-white border-green-600 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200'
    }`}
  >
    {label}
  </div>
);

export default SetupView;
