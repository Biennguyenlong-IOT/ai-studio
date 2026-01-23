
import React, { useState } from 'react';
import { User } from '../types';

interface AssignUserModalProps {
  users: User[];
  onClose: () => void;
  onSubmit: (user: User) => void;
  isSaving?: boolean;
}

const AssignUserModal: React.FC<AssignUserModalProps> = ({ users, onClose, onSubmit, isSaving = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assign Device</h3>
            <p className="text-sm text-slate-500">Select a user to assign this asset.</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search users..."
              className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => onSubmit(user)}
              disabled={isSaving}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left active:scale-[0.98] disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{user.employeeId}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
              <p className="text-xs">No users found.</p>
            </div>
          )}
        </div>

        {isSaving && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Assigning...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignUserModal;
