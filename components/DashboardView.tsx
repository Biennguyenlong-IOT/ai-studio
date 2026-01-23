
import React, { useState } from 'react';
import { Device, HistoryEntry } from '../types';
import DeviceCard from './DeviceCard';
import TimelineItem from './TimelineItem';

interface DashboardViewProps {
  devices: Device[];
  history: HistoryEntry[];
  onViewAll: () => void;
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  isAdmin: boolean;
  onSearch: (val: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ devices, history, onViewAll, onAction, onEdit, isAdmin, onSearch }) => {
  const [localSearch, setLocalSearch] = useState('');

  const stats = {
    total: devices.length,
    available: devices.filter(d => d.status === 'AVAILABLE').length,
    assigned: devices.filter(d => d.status === 'ASSIGNED').length,
    pending: devices.filter(d => d.status === 'PENDING').length,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearch(localSearch);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Quick Search Section */}
      <section className="bg-primary/5 p-5 rounded-[32px] border border-primary/10">
        <h2 className="text-sm font-bold text-primary mb-3 px-1">Tìm kiếm nhanh thiết bị</h2>
        <form onSubmit={handleSearchSubmit} className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">search</span>
          <input 
            type="text" 
            placeholder="Tên, mã tài sản, người dùng, vị trí..."
            className="w-full bg-white border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm font-medium"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          {isAdmin ? 'Tổng quan hệ thống' : 'Tài sản của tôi'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="devices" label="Tổng số" value={stats.total} iconColor="text-primary" />
          <StatCard icon="check_circle" label="Sẵn sàng" value={stats.available} iconColor="text-status-available" />
          <StatCard icon="person_check" label="Đang cấp" value={stats.assigned} iconColor="text-status-assigned" />
          <StatCard icon="pending" label="Đang chờ" value={stats.pending} iconColor="text-status-pending" />
        </div>
      </section>

      {/* Featured Inventory */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? 'Thiết bị gần đây' : 'Thiết bị của tôi'}
          </h2>
          <button onClick={onViewAll} className="text-primary text-xs font-bold hover:underline">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {devices.length > 0 ? (
            devices.slice(0, 3).map(device => (
              <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} isAdmin={isAdmin} />
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">no_devices</span>
              <p className="text-sm text-slate-400 font-medium">Chưa có thiết bị nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? 'Lịch sử hoạt động' : 'Lịch sử tài sản của tôi'}
          </h2>
          <button className="text-primary text-xs font-bold hover:underline">Chi tiết</button>
        </div>
        <div className="relative ml-2">
          {history.length > 0 && <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200"></div>}
          <div className="space-y-6">
            {history.length > 0 ? (
              history.slice(0, 10).map(entry => (
                <TimelineItem key={entry.id} entry={entry} />
              ))
            ) : (
              <p className="text-xs text-slate-400 italic ml-6">Chưa có hoạt động nào gần đây.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: number; iconColor: string }> = ({ icon, label, value, iconColor }) => (
  <div className="bg-white p-4 rounded-xl shadow-subtle border border-slate-100">
    <div className="flex items-center gap-2 mb-1">
      <span className={`material-symbols-outlined ${iconColor} text-[20px]`}>{icon}</span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
    <div className="text-xl font-bold text-slate-800">{value}</div>
  </div>
);

export default DashboardView;
