
import React, { useState } from 'react';
import { Device, AssetStatus } from '../types';

interface DeviceCardProps {
  device: Device;
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onAction, onEdit, onDelete, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAssigned = device.status === 'ASSIGNED';
  
  const getStatusStyles = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-50 text-status-available';
      case 'ASSIGNED': return 'bg-red-50 text-status-assigned';
      case 'PENDING': return 'bg-orange-50 text-status-pending';
      case 'REPAIR': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A' || dateStr.trim() === '') return 'Chưa có thông tin';
    
    try {
      const date = new Date(dateStr.trim());
      if (isNaN(date.getTime())) return dateStr;
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    } catch (e) {
      console.error("Lỗi định dạng ngày:", e);
      return dateStr;
    }
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-md ${isExpanded ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-slate-800 text-base truncate">{device.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-400 font-medium">ID: {device.tagId}</p>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <p className="text-xs text-primary/70 font-bold uppercase tracking-tighter">{device.type}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${getStatusStyles(device.status)}`}>
            {device.status}
          </span>
        </div>
        
        {isAssigned && device.assignedTo && (
          <div className="mb-3 px-3 py-2 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">person</span>
            <span className="text-xs font-bold text-red-700 truncate">Sử dụng: {device.assignedTo}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">settings_input_component</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Cấu hình</p>
              <p className="text-xs text-slate-700 font-medium truncate">{device.configuration || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Vị trí</p>
              <p className="text-xs text-slate-700 font-medium truncate">{device.location}</p>
            </div>
          </div>
        </div>

        <div className={`mt-4 pt-4 border-t border-slate-50 space-y-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">cable</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Phụ kiện</p>
              <p className="text-xs text-slate-700 font-medium">{device.accessory || 'Không có'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">notes</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Ghi chú</p>
              <p className="text-xs text-slate-700 font-medium italic">{device.note || 'Trống'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">history</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Cập nhật lần cuối</p>
              <p className="text-[11px] text-slate-600 font-bold">{formatDate(device.lastUpdated)}</p>
            </div>
          </div>
        </div>

        {!isExpanded && (
           <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                 Chi tiết <span className="material-symbols-outlined text-[12px]">expand_more</span>
              </span>
           </div>
        )}
      </div>
      
      {isAdmin ? (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="border-t border-slate-50 p-3 bg-slate-50/30 flex gap-2"
        >
          <button 
            onClick={() => onEdit(device)}
            className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 active:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span> Edit
          </button>
          
          {isAssigned ? (
            <button 
              onClick={() => onAction(device.id, 'RETURN')}
              className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 active:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">keyboard_return</span> Return
            </button>
          ) : (
            <button 
              onClick={() => onAction(device.id, 'ASSIGN')}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span> Assign
            </button>
          )}

          <button 
            onClick={() => onDelete(device.id)}
            className="w-10 h-10 bg-white border border-red-100 py-2 rounded-lg text-red-500 flex items-center justify-center active:bg-red-50 transition-colors shadow-sm"
            title="Xóa thiết bị"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      ) : (
        <div className="border-t border-slate-50 p-2.5 bg-slate-50/10 flex justify-center italic">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">visibility</span> View Only
          </span>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
