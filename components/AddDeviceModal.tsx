
import React, { useState, useMemo } from 'react';
import { Device } from '../types';

interface AddDeviceModalProps {
  existingTagIds: string[];
  onClose: () => void;
  onSubmit: (device: Omit<Device, 'id' | 'status' | 'lastUpdated'>) => void;
  isSaving?: boolean;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ existingTagIds, onClose, onSubmit, isSaving = false }) => {
  const [formData, setFormData] = useState({
    tagId: '',
    name: '',
    type: 'Laptop',
    configuration: '',
    accessory: '',
    note: '',
    location: '',
  });

  const [error, setError] = useState<string | null>(null);

  const isDuplicate = useMemo(() => {
    if (!formData.tagId.trim()) return false;
    return existingTagIds.some(id => id.toLowerCase() === formData.tagId.trim().toLowerCase());
  }, [formData.tagId, existingTagIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.tagId || isSaving) return;

    if (isDuplicate) {
      setError("Mã tài sản này đã tồn tại trong hệ thống!");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp max-h-[90vh] flex flex-col">
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Add New Device</h3>
            <p className="text-sm text-slate-500">Manual entry for master inventory.</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 disabled:opacity-30">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-10 sm:pb-8 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Asset Tag ID</label>
              <input 
                required
                disabled={isSaving}
                className={`w-full bg-slate-50 border rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all ${
                  isDuplicate ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-slate-100'
                }`}
                placeholder="e.g. IT-2024-001"
                type="text"
                value={formData.tagId}
                onChange={e => {
                  setFormData(prev => ({ ...prev, tagId: e.target.value }));
                  setError(null);
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Device Name</label>
              <input 
                required
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all"
                placeholder="MacBook Pro"
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>

          {isDuplicate && (
            <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold px-1 animate-pulse">
              <span className="material-symbols-outlined text-sm">warning</span>
              Mã tài sản đã tồn tại!
            </div>
          )}

          {error && !isDuplicate && (
             <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold px-1">
               <span className="material-symbols-outlined text-sm">error</span>
               {error}
             </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Device Type</label>
            <select 
              disabled={isSaving}
              className="form-select w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option>Laptop</option>
              <option>Ideahub</option>
              <option>Mini PC</option>
              <option>Workstation</option>
              <option>Mobile Phone</option>
              <option>Tablet</option>              
              <option>Peripheral</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Configuration</label>
              <input 
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                placeholder="RAM, Storage, CPU..."
                type="text"
                value={formData.configuration}
                onChange={e => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Accessory</label>
                <input 
                  disabled={isSaving}
                  className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                  placeholder="Mouse, Keyboard, Case..."
                  type="text"
                  value={formData.accessory}
                  onChange={e => setFormData(prev => ({ ...prev, accessory: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Location</label>
                <input 
                  disabled={isSaving}
                  className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                  placeholder="Storage / Floor"
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Note</label>
              <textarea 
                disabled={isSaving}
                rows={2}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 resize-none"
                placeholder="Additional notes..."
                value={formData.note}
                onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">Cancel</button>
            <button 
              type="submit" 
              disabled={isSaving || isDuplicate} 
              className={`flex-[2] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isDuplicate ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-primary text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;
