
import React, { useState } from 'react';
import { Device } from '../types';
import DeviceCard from './DeviceCard';

interface DevicesViewProps {
  devices: Device[];
  onAction: (id: string, action: 'ASSIGN' | 'RETURN') => void;
  onEdit: (device: Device) => void;
  isAdmin: boolean;
}

const DevicesView: React.FC<DevicesViewProps> = ({ devices, onAction, onEdit, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');

  const filteredDevices = devices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.assignedTo && d.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'All' || d.type === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'Laptop', 'Mobile Phone', 'Tablet', 'Workstation', 'Peripheral'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          {isAdmin ? 'Device Inventory' : 'My Devices'}
        </h2>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'Track and manage all hardware assets.' : 'Assets assigned to your profile.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder={isAdmin ? "Search by name, ID or user..." : "Search your devices..."}
            className="w-full bg-white border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
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
          <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} isAdmin={isAdmin} />
        ))}
        {filteredDevices.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-2">search_off</span>
            <p>{isAdmin ? 'No devices found matching your search.' : 'You have no assets in this category.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesView;
