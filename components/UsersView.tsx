
import React, { useState } from 'react';
import { User } from '../types';

interface UsersViewProps {
  users: User[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

const UsersView: React.FC<UsersViewProps> = ({ users, isAdmin, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Users Directory</h2>
        <p className="text-sm text-slate-500">Manage employees and asset assignments.</p>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Search by name or employee ID..."
          className="w-full bg-white border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl">account_circle</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                  user.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-tight">ID: {user.employeeId}</p>
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => onDelete(user.id)}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50"
                title="Xóa người dùng"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
            
            {!isAdmin && (
               <button className="text-slate-200 p-2 cursor-default">
                 <span className="material-symbols-outlined">more_vert</span>
               </button>
            )}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-2 opacity-20">person_off</span>
            <p className="text-sm font-medium italic">Không tìm thấy người dùng phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersView;
