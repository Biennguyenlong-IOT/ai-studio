
import React, { useState } from 'react';
import { User } from '../types';

interface UsersViewProps {
  users: User[];
  isAdmin: boolean;
  isManagement: boolean;
  onDelete: (id: string) => void;
  onEditUser: (user: User) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, isAdmin, isManagement, onDelete, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Danh sách nhân sự</h2>
        <p className="text-sm text-slate-500">Quản lý tài khoản và quyền hạn hệ thống.</p>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Tìm tên hoặc mã nhân viên..."
          className="w-full bg-white border-slate-200 border rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-primary/20 transition-all shadow-subtle"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-subtle flex items-center gap-4 hover:border-primary/20 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl">account_circle</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-slate-800 truncate text-base">{user.name}</h3>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                  user.role === 'ADMIN' ? 'bg-primary text-white' : 
                  user.role === 'OPERATION' ? 'bg-orange-500 text-white' : 
                  'bg-slate-100 text-slate-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{user.employeeId}</p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Nút EDIT chỉ hiện cho ADMIN */}
              {isAdmin && (
                <button 
                  onClick={() => onEditUser(user)} 
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                  title="Sửa thông tin"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              )}
              
              {/* Nút DELETE chỉ hiện cho ADMIN */}
              {isAdmin && (
                <button 
                  onClick={() => onDelete(user.id)} 
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Xóa nhân sự"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersView;
