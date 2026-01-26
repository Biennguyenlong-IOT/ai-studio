
import React, { useState } from 'react';
import { Device, AssetStatus } from '../types';
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
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Sẵn sàng';
      case 'ASSIGNED': return 'Đang sử dụng';
      case 'PENDING': return 'Chờ duyệt';
      case 'REPAIR': return 'Sửa chữa';
      default: return status;
    }
  };

  const filteredDevices = devices.filter(d => {
    const s = searchTerm.toLowerCase();
    const statusLabel = getStatusLabel(d.status).toLowerCase();
    
    // Mở rộng logic tìm kiếm: Tên, ID, Người dùng, Trạng thái, Vị trí
    const matchesSearch = 
      d.name.toLowerCase().includes(s) || 
      d.tagId.toLowerCase().includes(s) || 
      (d.assignedTo && d.assignedTo.toLowerCase().includes(s)) ||
      statusLabel.includes(s) ||
      d.status.toLowerCase().includes(s) ||
      d.location.toLowerCase().includes(s);

    const matchesCategory = categoryFilter === 'All' || d.type === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Laptop', 'Ideahub', 'Mini PC', 'Mobile Phone', 'Tablet', 'Workstation', 'Peripheral'];
  const statuses: {id: string; label: string; color: string}[] = [
    { id: 'All', label: 'Tất cả trạng thái', color: 'bg-slate-100 text-slate-600' },
    { id: 'AVAILABLE', label: 'Sẵn sàng', color: 'bg-green-100 text-green-700' },
    { id: 'ASSIGNED', label: 'Đang dùng', color: 'bg-red-100 text-red-700' },
    { id: 'PENDING', label: 'Chờ duyệt', color: 'bg-orange-100 text-orange-700' },
    { id: 'REPAIR', label: 'Sửa chữa', color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Danh mục thiết bị</h2>
        <p className="text-sm text-slate-500">{isManagement ? 'Quản lý toàn bộ tài sản hệ thống.' : 'Xem các tài sản được cấp phát cho bạn.'}</p>
      </div>

      <div className="space-y-4">
        {/* Search Bar - Cập nhật placeholder */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, ID, người dùng, trạng thái, vị trí..."
            className="w-full bg-white border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-primary/20 shadow-subtle border transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Loại:</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategoryFilter(cat)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả loại' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tình trạng:</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {statuses.map(st => (
                <button 
                  key={st.id} 
                  onClick={() => setStatusFilter(st.id)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    statusFilter === st.id 
                      ? 'bg-slate-800 text-white shadow-lg' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    st.id === 'AVAILABLE' ? 'bg-green-500' : 
                    st.id === 'ASSIGNED' ? 'bg-red-500' : 
                    st.id === 'PENDING' ? 'bg-orange-500' : 
                    st.id === 'REPAIR' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}></div>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map(device => (
            <DeviceCard key={device.id} device={device} onAction={onAction} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} isManagement={isManagement} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
           <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">inventory_2</span>
           <p className="text-slate-400 font-medium italic">Không tìm thấy thiết bị nào phù hợp</p>
           <button onClick={() => {setSearchTerm(''); setCategoryFilter('All'); setStatusFilter('All');}} className="mt-4 text-primary text-xs font-bold underline">Xóa tất cả bộ lọc</button>
        </div>
      )}
    </div>
  );
};

export default DevicesView;
