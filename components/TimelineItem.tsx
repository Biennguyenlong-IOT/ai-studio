
import React from 'react';
import { HistoryEntry } from '../types';

interface TimelineItemProps {
  entry: HistoryEntry;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ entry }) => {
  const getActionConfig = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('ASSIGN')) {
      return {
        label: 'Cấp phát',
        color: 'bg-red-100 text-red-600',
        dotColor: 'bg-red-500',
        actionColor: 'text-red-600'
      };
    }
    if (act.includes('RETURN')) {
      return {
        label: 'Thu hồi',
        color: 'bg-blue-100 text-blue-600',
        dotColor: 'bg-blue-500',
        actionColor: 'text-blue-600'
      };
    }
    if (act.includes('REPAIR')) {
      return {
        label: 'Sửa chữa',
        color: 'bg-amber-100 text-amber-600',
        dotColor: 'bg-amber-500',
        actionColor: 'text-amber-600'
      };
    }
    if (act.includes('CREATE') || act.includes('ADD')) {
      return {
        label: 'Thêm mới',
        color: 'bg-green-100 text-green-600',
        dotColor: 'bg-green-500',
        actionColor: 'text-green-600'
      };
    }
    if (act.includes('DELETE')) {
      return {
        label: 'Xóa',
        color: 'bg-slate-100 text-slate-400',
        dotColor: 'bg-slate-400',
        actionColor: 'text-slate-500'
      };
    }
    return {
      label: 'Cập nhật',
      color: 'bg-slate-100 text-slate-600',
      dotColor: 'bg-slate-400',
      actionColor: 'text-primary'
    };
  };

  const config = getActionConfig(entry.action);
  
  const displayTimestamp = () => {
    if (!entry.timestamp) return 'Không rõ';
    if (entry.timestamp.includes('/') || entry.timestamp.includes(':')) return entry.timestamp;
    
    try {
      const date = new Date(entry.timestamp);
      if (isNaN(date.getTime())) return entry.timestamp;
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }).format(date);
    } catch {
      return entry.timestamp;
    }
  };

  return (
    <div className="relative pl-8 animate-slideIn">
      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-slate-50 ${config.dotColor} z-10 shadow-sm`}></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle p-4 hover:border-primary/20 transition-all">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-slate-800 truncate pr-2 uppercase">{entry.deviceName}</h3>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[14px]">schedule</span>
            <span className="text-[10px] text-slate-500 font-medium">{displayTimestamp()}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {entry.avatarUrl ? (
                <img alt={entry.performer} className="w-full h-full object-cover" src={entry.avatarUrl} />
              ) : (
                <span className="material-symbols-outlined text-[12px] text-slate-400">person</span>
              )}
            </div>
            <span className="text-[10px] text-slate-600 leading-tight">
              {/* Định dạng mới: [TARGET] ĐÃ [ACTION] BỞI [PERFORMER] */}
              <span className="font-bold text-slate-900 uppercase">{entry.target || 'KHO'}</span> 
              <span className="mx-1 text-slate-400 font-bold text-[9px]">ĐÃ</span>
              <span className={`font-black uppercase ${config.actionColor}`}>{entry.action}</span>
              <span className="mx-1 text-slate-400 font-bold text-[9px]">BỞI</span>
              <span className="font-bold text-slate-900 uppercase">{entry.performer}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
