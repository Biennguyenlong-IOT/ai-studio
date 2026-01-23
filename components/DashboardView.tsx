
import React from 'react';
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
}

const DashboardView: React.FC<DashboardViewProps> = ({ devices, history, onViewAll, onAction, onEdit, isAdmin }) => {
  const stats = {
    total: devices.length,
    available: devices.filter(d => d.status === 'AVAILABLE').length,
    assigned: devices.filter(d => d.status === 'ASSIGNED').length,
    pending: devices.filter(d => d.status === 'PENDING').length,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Section */}
      <section>
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          {isAdmin ? 'Dashboard Overview' : 'My Assets Overview'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="devices" label="Total" value={stats.total} iconColor="text-primary" />
          <StatCard icon="check_circle" label="Available" value={stats.available} iconColor="text-status-available" />
          <StatCard icon="person_check" label="Assigned" value={stats.assigned} iconColor="text-status-assigned" />
          <StatCard icon="pending" label="Pending" value={stats.pending} iconColor="text-status-pending" />
        </div>
      </section>

      {/* Featured Inventory */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? 'Recent Inventory' : 'My Devices'}
          </h2>
          <button onClick={onViewAll} className="text-primary text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {devices.length > 0 ? (
            devices.slice(0, 3).map(device => (
              <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} isAdmin={isAdmin} />
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">no_devices</span>
              <p className="text-sm text-slate-400 font-medium">No assets assigned to you.</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? 'History Timeline' : 'My Asset History'}
          </h2>
          <button className="text-primary text-xs font-bold hover:underline">Full Log</button>
        </div>
        <div className="relative ml-2">
          {history.length > 0 && <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200"></div>}
          <div className="space-y-6">
            {history.length > 0 ? (
              history.slice(0, 10).map(entry => (
                <TimelineItem key={entry.id} entry={entry} />
              ))
            ) : (
              <p className="text-xs text-slate-400 italic ml-6">No recent activity found.</p>
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
