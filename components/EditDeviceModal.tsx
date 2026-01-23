
import React, { useState, useEffect } from 'react';
import { Device, AssetStatus } from '../types';

interface EditDeviceModalProps {
  device: Device;
  onClose: () => void;
  onSubmit: (device: Device) => void;
  isSaving?: boolean;
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ device, onClose, onSubmit, isSaving = false }) => {
  const [formData, setFormData] = useState<Device>({ ...device });

  useEffect(() => {
    setFormData({ ...device });
  }, [device]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.tagId || isSaving) return;
    onSubmit(formData);
  };

  const statusOptions: { value: AssetStatus; label: string; color: string }[] = [
    { value: 'AVAILABLE', label: 'Available', color: 'text-status-available' },
    { value: 'ASSIGNED', label: 'Assigned', color: 'text-status-assigned' },
    { value: 'PENDING', label: 'Pending', color: 'text-status-pending' },
    { value: 'REPAIR', label: 'Repairing', color: 'text-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp">
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Chỉnh sửa thiết bị</h3>
            <p className="text-sm text-slate-500">Cập nhật thông số kỹ thuật và chi tiết phần cứng.</p>
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
                disabled
                className="w-full bg-slate-100 border-slate-100 rounded-xl text-sm text-slate-500 py-3 px-4 cursor-not-allowed"
                type="text"
                value={formData.tagId}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Trạng thái (Status)</label>
              <select 
                disabled={isSaving}
                className={`form-select w-full bg-slate-50 border-slate-100 rounded-xl text-sm font-bold focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all ${
                  statusOptions.find(opt => opt.value === formData.status)?.color
                }`}
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as AssetStatus }))}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="font-sans font-medium text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Tên thiết bị</label>
            <input 
              required
              disabled={isSaving}
              className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4 transition-all"
              placeholder="Ví dụ: MacBook Pro 2023"
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Loại thiết bị</label>
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
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Cấu hình</label>
              <input 
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                placeholder="RAM, SSD, CPU..."
                type="text"
                value={formData.configuration}
                onChange={e => setFormData(prev => ({ ...prev, configuration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Vị trí</label>
              <input 
                disabled={isSaving}
                className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
                placeholder="Phòng IT / Kho / Tầng 2"
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">Hủy</button>
            <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-primary text-white flex items-center justify-center gap-2">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;
