
import React, { useState } from 'react';
import { Device } from '../types';
import DeviceCard from './DeviceCard';

interface DevicesViewProps {
  devices: Device[];
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  isManagement: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const DevicesView: React.FC<DevicesViewProps> = ({ devices, onAction, onEdit, onDelete, isAdmin, isManagement, searchTerm, setSearchTerm }) => {
  const [filter, setFilter] = useState<string>('All');

  const filteredDevices = devices.filter(d => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(s) || d.tagId.toLowerCase().includes(s) || (d.assignedTo && d.assignedTo.toLowerCase().includes(s));
    const matchesFilter = filter === 'All' || d.type === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'Laptop', 'Ideahub', 'Mini PC', 'Mobile Phone', 'Tablet', 'Workstation', 'Peripheral'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Danh mục thiết bị</h2>
        <p className="text-sm text-slate-500">{isManagement ? 'Quản lý toàn bộ tài sản hệ thống.' : 'Xem các tài sản được cấp phát cho bạn.'}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, ID, người dùng..."
            className="w-full bg-white border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === cat ? 'bg-primary text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} isManagement={isManagement} />
        ))}
      </div>
    </div>
  );
};

export default DevicesView;
