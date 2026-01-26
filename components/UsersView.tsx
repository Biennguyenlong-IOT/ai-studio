
import React, { useState } from 'react';
import { User } from '../types';

interface UsersViewProps {
  users: User[];
  isAdmin: boolean;
  isManagement: boolean;
  onDelete: (id: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, isAdmin, isManagement, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Danh sách nhân sự</h2>
        <p className="text-sm text-slate-500">Quản lý tài khoản và cấp phát thiết bị.</p>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Tìm tên hoặc mã nhân viên..."
          className="w-full bg-white border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-primary/20 transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl">account_circle</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${user.role === 'ADMIN' ? 'bg-primary text-white' : user.role === 'OPERATION' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{user.role}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">ID: {user.employeeId}</p>
            </div>
            
            {/* Chỉ hiện nút xóa cho ADMIN thực thụ */}
            {isAdmin && (
              <button onClick={() => onDelete(user.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersView;
