
import React, { useState } from 'react';
import { Device } from '../types';

interface AddDeviceModalProps {
  onClose: () => void;
  onSubmit: (device: Omit<Device, 'id' | 'status' | 'lastUpdated'>) => void;
  isSaving?: boolean;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose, onSubmit, isSaving = false }) => {
  const [formData, setFormData] = useState({
    tagId: '',
    name: '',
    type: 'Laptop',
    configuration: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.tagId || isSaving) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp">
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

        <form onSubmit={handleSubmit} className="px-6 pb-10 sm:pb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Asset Tag ID</label>
              <input 
                required
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all"
                placeholder="e.g. IT-2024-001"
                type="text"
                value={formData.tagId}
                onChange={e => setFormData(prev => ({ ...prev, tagId: e.target.value }))}
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

          <div className="grid grid-cols-1 gap-4">
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
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Location</label>
              <input 
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                placeholder="Office Floor / Storage Area"
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-primary text-white flex items-center justify-center gap-2">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;
