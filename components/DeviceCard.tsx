
import React, { useState } from 'react';
import { Device, AssetStatus } from '../types';

interface DeviceCardProps {
  device: Device;
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  isManagement: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onAction, onEdit, onDelete, isAdmin, isManagement }) => {
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

  return (
    <div onClick={() => setIsExpanded(!isExpanded)} className={`bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden flex flex-col transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-slate-800 text-base truncate">{device.name}</h3>
            <p className="text-xs text-slate-400">ID: {device.tagId} • <span className="text-primary font-bold uppercase">{device.type}</span></p>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${getStatusStyles(device.status)}`}>{device.status}</span>
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
            <p className="text-[10px] text-slate-400 uppercase font-bold">Cập nhật: {device.lastUpdated}</p>
          </div>
        )}
      </div>
      
      {isManagement ? (
        <div onClick={(e) => e.stopPropagation()} className="border-t border-slate-50 p-3 bg-slate-50/30 flex gap-2">
          {/* Nút EDIT chỉ hiện cho ADMIN */}
          {isAdmin && (
            <button onClick={() => onEdit(device)} className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
            </button>
          )}
          
          {/* Nút ASSIGN/RETURN hiện cho cả ADMIN và OPERATION */}
          {isAssigned ? (
            <button onClick={() => onAction(device.id, 'RETURN')} className="flex-1 bg-white border border-slate-200 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">keyboard_return</span> Thu hồi
            </button>
          ) : (
            <button onClick={() => onAction(device.id, 'ASSIGN')} className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person_add</span> Cấp phát
            </button>
          )}

          {/* Nút DELETE chỉ hiện cho ADMIN khi là PENDING */}
          {isAdmin && device.status === 'PENDING' && (
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
