
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
  onSetup: (device: Device) => void;
  isAdmin: boolean;
  isManagement: boolean;
  onSearch: (val: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ devices, history, onViewAll, onAction, onEdit, onDelete, onSetup, isAdmin, isManagement, onSearch }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${d}, ${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');
    return { hours, mins, secs };
  };

  const time = formatTime(currentTime);

  const stats = {
    total: devices.length,
    available: devices.filter(d => d.status === 'AVAILABLE').length,
    assigned: devices.filter(d => d.status === 'ASSIGNED').length,
    pending: devices.filter(d => d.status === 'PENDING').length,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-[40px] p-6 text-white shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">{greeting}!</h1>
            <p className="text-blue-100 text-sm opacity-90 font-medium">Hệ thống đang phục vụ {isManagement ? 'điều hành' : 'tra cứu'}.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 pr-6">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">calendar_month</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight">{time.hours}</span>
                <span className="text-xl font-bold opacity-50 animate-pulse">:</span>
                <span className="text-2xl font-black tracking-tight">{time.mins}</span>
                <span className="text-sm font-bold opacity-60 ml-1">{time.secs}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSearch(localSearch); }} className="relative z-10">
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
              <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} onDelete={onDelete} onSetup={onSetup} isAdmin={isAdmin} isManagement={isManagement} />
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
