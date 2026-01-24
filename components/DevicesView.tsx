
import React, { useState } from 'react';
import { Device } from '../types';
import DeviceCard from './DeviceCard';

interface DevicesViewProps {
  devices: Device[];
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const DevicesView: React.FC<DevicesViewProps> = ({ devices, onAction, onEdit, onDelete, isAdmin, searchTerm, setSearchTerm }) => {
  const [filter, setFilter] = useState<string>('All');

  const filteredDevices = devices.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      d.name.toLowerCase().includes(searchLower) || 
      d.tagId.toLowerCase().includes(searchLower) ||
      (d.assignedTo && d.assignedTo.toLowerCase().includes(searchLower)) ||
      d.location.toLowerCase().includes(searchLower);
    
    const matchesFilter = filter === 'All' || d.type === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'Laptop', 'Ideahub', 'Mini PC', 'Mobile Phone', 'Tablet', 'Workstation', 'Peripheral'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          {isAdmin ? 'Danh mục thiết bị' : 'Thiết bị của tôi'}
        </h2>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'Theo dõi và quản lý tất cả tài sản phần cứng.' : 'Các tài sản được cấp phát cho bạn.'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder={isAdmin ? "Tìm theo tên, ID, người dùng hoặc vị trí..." : "Tìm kiếm trong thiết bị của bạn..."}
            className="w-full bg-white border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />
        ))}
        {filteredDevices.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl opacity-20">search_off</span>
            </div>
            <p className="font-medium">{isAdmin ? 'Không tìm thấy thiết bị phù hợp.' : 'Bạn không có tài sản nào trong mục này.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesView;
