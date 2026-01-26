
import React, { useState, useEffect } from 'react';
import { Device, HistoryEntry, AssetStatus } from '../types';
import DeviceCard from './DeviceCard';
import TimelineItem from './TimelineItem';

interface DashboardViewProps {
  devices: Device[];
  history: HistoryEntry[];
  onViewAll: () => void;
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  isManagement: boolean;
  onSearch: (val: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ devices, history, onViewAll, onAction, onEdit, onDelete, isAdmin, isManagement, onSearch }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const stats = {
    total: devices.length,
    available: devices.filter(d => d.status === 'AVAILABLE').length,
    assigned: devices.filter(d => d.status === 'ASSIGNED').length,
    pending: devices.filter(d => d.status === 'PENDING').length,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-[40px] p-6 text-white shadow-2xl">
        <h1 className="text-2xl font-black mb-1">{greeting}!</h1>
        <p className="text-blue-100 text-sm mb-6 opacity-90">Hệ thống đang phục vụ {isManagement ? 'điều hành' : 'tra cứu'}.</p>
        <form onSubmit={(e) => { e.preventDefault(); onSearch(localSearch); }} className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
          <input 
            type="text" 
            placeholder="Tìm: Tên, mã, trạng thái (Sẵn sàng...)"
            className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 border-none focus:ring-4 focus:ring-white/20 transition-all shadow-xl"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
        </form>
      </section>

      <section>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">{isManagement ? 'Chỉ số hệ thống' : 'Tài sản cá nhân'}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="inventory_2" label="Tổng tài sản" value={stats.total} color="bg-blue-50 text-blue-600" />
          <StatCard icon="verified" label="Sẵn sàng" value={stats.available} color="bg-green-50 text-green-600" onClick={() => onSearch('Sẵn sàng')} />
          <StatCard icon="assignment_ind" label="Đang cấp" value={stats.assigned} color="bg-red-50 text-red-600" onClick={() => onSearch('Đang sử dụng')} />
          <StatCard icon="hourglass_empty" label="Đang chờ" value={stats.pending} color="bg-orange-50 text-orange-600" onClick={() => onSearch('Chờ duyệt')} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thiết bị tiêu biểu</h2>
            <button onClick={onViewAll} className="text-primary text-xs font-bold">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {devices.slice(0, 3).map(device => (
              <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} isManagement={isManagement} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nhật ký mới nhất</h2>
          <div className="space-y-6">
            {history.slice(0, 5).map(entry => <TimelineItem key={entry.id} entry={entry} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: number; color: string; onClick?: () => void }> = ({ icon, label, value, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded-3xl shadow-subtle border border-slate-100 flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:border-primary/30 hover:shadow-lg active:scale-95' : ''}`}
  >
    <div className={`w-12 h-12 rounded-2xl ${color.split(' ')[0]} flex items-center justify-center`}>
      <span className={`material-symbols-outlined ${color.split(' ')[1]}`}>{icon}</span>
    </div>
    <div>
      <div className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

export default DashboardView;
