
import React, { useState, useEffect } from 'react';
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

const AnalogClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Tính toán góc quay chính xác
  const sDegree = (seconds / 60) * 360;
  const mDegree = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hDegree = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="relative w-24 h-24 rounded-full border-[3px] border-white shadow-inner flex items-center justify-center bg-white/20 backdrop-blur-sm">
      {/* Vạch giờ (Dots) */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-0.5 h-1.5 bg-white/50 rounded-full" 
          style={{ transform: `rotate(${i * 30}deg) translateY(-36px)` }}
        />
      ))}
      
      {/* Container kim đồng hồ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Kim Giờ - Màu xanh lá */}
        <div 
          className="absolute inset-0 flex justify-center items-start" 
          style={{ transform: `rotate(${hDegree}deg)` }}
        >
          <div className="w-1.5 h-7 bg-green-500 rounded-full mt-5 shadow-sm" />
        </div>

        {/* Kim Phút - Màu xanh lá */}
        <div 
          className="absolute inset-0 flex justify-center items-start" 
          style={{ transform: `rotate(${mDegree}deg)` }}
        >
          <div className="w-1 h-9 bg-green-400 rounded-full mt-3 shadow-sm" />
        </div>

        {/* Kim Giây - Màu trắng */}
        <div 
          className="absolute inset-0 flex justify-center items-start" 
          style={{ transform: `rotate(${sDegree}deg)` }}
        >
          <div className="w-[1px] h-10 bg-white mt-2 shadow-sm" />
        </div>
      </div>
      
      {/* Tâm đồng hồ (Center Point) */}
      <div className="absolute w-2.5 h-2.5 bg-white rounded-full border-2 border-green-500 shadow-sm z-10" />
    </div>
  );
};

const MiniCalendar: React.FC = () => {
  const now = new Date();
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white/50 flex flex-col items-center justify-center min-w-[100px]">
      <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{monthNames[now.getMonth()]}</span>
      <span className="text-3xl font-black text-slate-800 leading-none">{now.getDate()}</span>
      <span className="text-[10px] font-bold text-slate-400 mt-1">{days[now.getDay()]}, {now.getFullYear()}</span>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({ devices, history, onViewAll, onAction, onEdit, isAdmin, onSearch }) => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearch(localSearch);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Command Center Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 rounded-[40px] p-6 text-white shadow-2xl shadow-primary/20">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight mb-1">{greeting}!</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90">Hôm nay hệ thống của bạn hoạt động ổn định.</p>
          </div>
          <div className="flex items-center gap-4">
            <MiniCalendar />
            <AnalogClock />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative z-10 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
          <input 
            type="text" 
            placeholder="Tìm nhanh: Tên, mã tài sản, người dùng..."
            className="w-full bg-white/95 border-none rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 focus:ring-4 focus:ring-white/20 shadow-xl font-medium transition-all group-focus-within:bg-white"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>
      </section>

      {/* Stats Section with improved design */}
      <section>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          {isAdmin ? 'Chỉ số hệ thống' : 'Tài sản cá nhân'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="inventory_2" label="Tổng tài sản" value={stats.total} color="bg-blue-50 text-blue-600" />
          <StatCard icon="verified" label="Sẵn sàng" value={stats.available} color="bg-green-50 text-green-600" />
          <StatCard icon="assignment_ind" label="Đang cấp" value={stats.assigned} color="bg-red-50 text-red-600" />
          <StatCard icon="hourglass_empty" label="Đang chờ" value={stats.pending} color="bg-orange-50 text-orange-600" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Inventory */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               {isAdmin ? 'Thiết bị mới cập nhật' : 'Thiết bị của tôi'}
            </h2>
            <button onClick={onViewAll} className="text-primary text-xs font-bold hover:underline">Tất cả</button>
          </div>
          <div className="space-y-4">
            {devices.length > 0 ? (
              devices.slice(0, 3).map(device => (
                <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} isAdmin={isAdmin} />
              ))
            ) : (
              <div className="bg-white p-12 rounded-[32px] border border-dashed border-slate-200 text-center">
                <span className="material-symbols-outlined text-slate-200 text-5xl mb-3">inventory</span>
                <p className="text-sm text-slate-400 font-medium italic">Danh sách trống</p>
              </div>
            )}
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               {isAdmin ? 'Nhật ký hoạt động' : 'Lịch sử tài sản'}
            </h2>
          </div>
          <div className="relative ml-2">
            {history.length > 0 && <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100"></div>}
            <div className="space-y-6">
              {history.length > 0 ? (
                history.slice(0, 6).map(entry => (
                  <TimelineItem key={entry.id} entry={entry} />
                ))
              ) : (
                <div className="bg-slate-50/50 p-12 rounded-[32px] border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 font-medium">Chưa có hoạt động nào.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-3xl shadow-subtle border border-slate-100 flex items-center gap-4 group hover:border-primary/20 transition-all hover:shadow-lg">
    <div className={`w-12 h-12 rounded-2xl ${color.split(' ')[0]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <span className={`material-symbols-outlined text-[24px] ${color.split(' ')[1]}`}>{icon}</span>
    </div>
    <div>
      <div className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

export default DashboardView;
