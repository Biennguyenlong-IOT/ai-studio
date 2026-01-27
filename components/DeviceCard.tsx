
import React, { useState } from 'react';
import { Device, AssetStatus } from '../types';

interface DeviceCardProps {
  device: Device;
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  onSetup: (device: Device) => void;
  isAdmin: boolean;
  isManagement: boolean;
  hasSetup?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onAction, onEdit, onDelete, onSetup, isAdmin, isManagement, hasSetup = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAssigned = device.status === 'ASSIGNED';
  const isAvailable = device.status === 'AVAILABLE';
  
  const getStatusStyles = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-50 text-status-available';
      case 'ASSIGNED': return 'bg-red-50 text-status-assigned';
      case 'PENDING': return 'bg-orange-50 text-status-pending';
      case 'REPAIR': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Sẵn sàng';
      case 'ASSIGNED': return 'Đang sử dụng';
      case 'PENDING': return 'Chờ duyệt';
      case 'REPAIR': return 'Sửa chữa';
      default: return status;
    }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className={`bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden flex flex-col transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-slate-800 text-base truncate">{device.name}</h3>
            <p className="text-xs text-slate-400">ID: {device.tagId} • <span className="text-primary font-bold uppercase">{device.type}</span></p>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${getStatusStyles(device.status)}`}>{getStatusLabel(device.status)}</span>
        </div>
        
        {isAssigned && device.assignedTo && (
          <div className="mb-3 px-3 py-2 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-500">person</span>
            <span className="text-xs font-bold text-red-700 truncate">Sử dụng: {device.assignedTo}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
             <span className="material-symbols-outlined text-[16px] text-slate-400">settings_input_component</span>
             <span className="truncate">{device.configuration || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
             <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
             <span>{device.location}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2 animate-fadeIn">
            <p className="text-xs text-slate-500"><b>Phụ kiện:</b> {device.accessory || 'Không'}</p>
            <p className="text-xs text-slate-500"><b>Ghi chú:</b> {device.note || 'Trống'}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="material-symbols-outlined text-[14px] text-slate-400">update</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cập nhật: {formatDateTime(device.lastUpdated)}</p>
            </div>
            {isAvailable && !hasSetup && (
               <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  CẦN THIẾT LẬP PHẦN MỀM TRƯỚC KHI CẤP PHÁT
               </div>
            )}
          </div>
        )}
      </div>
      
      {isManagement ? (
        <div onClick={(e) => e.stopPropagation()} className="border-t border-slate-50 p-3 bg-slate-50/30 flex flex-wrap gap-2">
          {isAdmin && (
            <button onClick={() => onEdit(device)} className="flex-1 min-w-[70px] bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
            </button>
          )}

          {/* CHỈ ADMIN mới thấy nút Setup */}
          {isAdmin && isAvailable && (
            <button onClick={() => onSetup(device)} className="flex-1 min-w-[70px] bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[16px]">settings_suggest</span> Setup
            </button>
          )}
          
          {isAssigned ? (
            <button onClick={() => onAction(device.id, 'RETURN')} className="flex-1 min-w-[70px] bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[16px]">keyboard_return</span> Thu hồi
            </button>
          ) : (isAvailable && hasSetup) ? (
            <button onClick={() => onAction(device.id, 'ASSIGN')} className="flex-1 min-w-[70px] bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-600 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">person_add</span> Cấp phát
            </button>
          ) : isAvailable ? (
             <div className="flex-1 min-w-[70px] bg-slate-100 border border-slate-200 py-2 rounded-lg text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1 cursor-help" title="Cần hoàn tất Setup trước">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span> Chờ Setup
            </div>
          ) : (
            <div className="flex-1 min-w-[70px] bg-slate-100 border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-400 flex items-center justify-center gap-1 cursor-not-allowed">
              <span className="material-symbols-outlined text-[16px]">lock</span> {device.status === 'PENDING' ? 'Chờ' : 'Sửa'}
            </div>
          )}

          {isAdmin && (device.status === 'PENDING' || device.status === 'AVAILABLE') && (
            <button onClick={() => onDelete(device.id)} className="w-10 h-10 bg-white border border-red-100 rounded-lg text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border-t border-slate-50 p-2.5 bg-slate-50/10 flex justify-center italic text-[10px] text-slate-400 uppercase font-bold">
           View Only
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
