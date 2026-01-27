
import React, { useState, useEffect } from 'react';
import { Device, SetupData } from '../types';

interface SetupModalProps {
  device: Device;
  existingSetup?: SetupData;
  onClose: () => void;
  onSubmit: (setup: Omit<SetupData, 'id' | 'lastUpdated'>) => void;
  isSaving?: boolean;
}

const SetupModal: React.FC<SetupModalProps> = ({ device, existingSetup, onClose, onSubmit, isSaving = false }) => {
  const [formData, setFormData] = useState({
    tagId: device.tagId,
    win: false,
    unikey: false,
    printer: false,
    snmp: false,
    welink: false,
    welinkMeeting: false,
    codeFormat: `AF-${device.tagId}-ST`,
    qrFormat: `QR-${device.tagId}-ST`,
  });

  useEffect(() => {
    if (existingSetup) {
      setFormData({
        tagId: existingSetup.tagId,
        win: existingSetup.win,
        unikey: existingSetup.unikey,
        printer: existingSetup.printer,
        snmp: existingSetup.snmp,
        welink: existingSetup.welink,
        welinkMeeting: existingSetup.welinkMeeting,
        codeFormat: existingSetup.codeFormat,
        qrFormat: existingSetup.qrFormat,
      });
    }
  }, [existingSetup]);

  // Update QR_Format whenever CodeFormat changes
  const handleCodeChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      codeFormat: val,
      qrFormat: `QR-${val}`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onSubmit(formData);
  };

  const checkboxes = [
    { key: 'win', label: 'Windows Activated', icon: 'window' },
    { key: 'unikey', label: 'Unikey installed', icon: 'keyboard' },
    { key: 'printer', label: 'Printer mapped', icon: 'print' },
    { key: 'snmp', label: 'SNMP configured', icon: 'settings_remote' },
    { key: 'welink', label: 'Welink installed', icon: 'chat' },
    { key: 'welinkMeeting', label: 'Welink Meeting', icon: 'videocam' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp max-h-[90vh] flex flex-col">
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Device Setup</h3>
            <p className="text-sm text-slate-500">Configuring software & labels for <b>{device.name}</b></p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-10 sm:pb-8 pt-4 space-y-6 overflow-y-auto">
          {/* Read-only Asset ID */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Asset Tag ID</label>
            <div className="w-full bg-slate-100 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-500 font-mono">
              {device.tagId}
            </div>
          </div>

          {/* Software Checkboxes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">Software Checklist</label>
            <div className="grid grid-cols-2 gap-3">
              {checkboxes.map(item => (
                <label key={item.key} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  (formData as any)[item.key] ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                }`}>
                  <input 
                    type="checkbox"
                    className="hidden"
                    checked={(formData as any)[item.key]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    disabled={isSaving}
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    (formData as any)[item.key] ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <span className={`text-xs font-bold ${(formData as any)[item.key] ? 'text-primary' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Code & QR Formats */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Code Format</label>
              <input 
                required
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 border rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all"
                placeholder="AF-TAGID-ST"
                type="text"
                value={formData.codeFormat}
                onChange={e => handleCodeChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">QR Data Format (Generated)</label>
              <div className="relative">
                <input 
                  disabled
                  className="w-full bg-slate-100 border-slate-100 border rounded-xl text-sm text-slate-500 py-3 px-4 cursor-not-allowed italic"
                  type="text"
                  value={formData.qrFormat}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">qr_code_2</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">Cancel</button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-primary text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (existingSetup ? 'Update Setup' : 'Save Setup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
