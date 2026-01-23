
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface IdentificationViewProps {
  users: User[];
  onSelect: (user: User) => void;
  isLoading: boolean;
}

const IdentificationView: React.FC<IdentificationViewProps> = ({ users, onSelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  // Updated admin password to '@nNguyen'
  const ADMIN_PASSWORD = '@nNguyen';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserClick = (user: User) => {
    if (user.role === 'ADMIN') {
      setSelectedAdmin(user);
      setError(false);
      setPassword('');
    } else {
      onSelect(user);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      if (selectedAdmin) onSelect(selectedAdmin);
    } else {
      setError(true);
      // Trigger haptic-like shake effect
      setTimeout(() => setError(false), 500);
    }
  };

  const handleBack = () => {
    setSelectedAdmin(null);
    setPassword('');
    setError(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fadeIn relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg z-10">
        {/* Branding */}
        {!selectedAdmin && (
          <div className="text-center mb-10 transition-all">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-6 animate-bounceSubtle">
              <span className="material-symbols-outlined text-white text-5xl">inventory_2</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">AssetFlow</h1>
            <p className="text-slate-500 font-medium italic">Hệ thống Quản lý Thiết bị CNTT</p>
          </div>
        )}

        {/* User Selector Container */}
        <div className={`bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 ${selectedAdmin ? 'scale-105' : 'max-h-[60vh]'}`}>
          {!selectedAdmin ? (
            <>
              <div className="p-8 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Xác nhận danh tính</h2>
                <p className="text-xs text-slate-400 font-medium mb-6">Vui lòng chọn tài khoản của bạn để tiếp tục.</p>
                
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input 
                    type="text" 
                    placeholder="Tìm tên hoặc mã nhân viên..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                     <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải danh sách...</p>
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="w-full group flex items-center gap-4 p-4 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all active:scale-[0.98] text-left"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-50">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl">account_circle</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-base leading-none">{user.name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">{user.employeeId}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">
                        {user.role === 'ADMIN' ? 'lock' : 'login'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 opacity-20">person_off</span>
                    <p className="text-sm font-medium italic">Không tìm thấy tài khoản</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Admin Password Challenge */
            <div className="p-10 text-center animate-slideIn">
              <button 
                onClick={handleBack}
                className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                 {selectedAdmin.avatarUrl ? (
                   <img src={selectedAdmin.avatarUrl} className="w-full h-full object-cover rounded-full" />
                 ) : (
                   <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary text-4xl">admin_panel_settings</span>
                   </div>
                 )}
                 <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                   <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                 </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedAdmin.name}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Yêu cầu quyền Quản trị</p>

              <form onSubmit={handleAdminLogin} className={`space-y-6 ${error ? 'animate-shake' : ''}`}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                  <input 
                    autoFocus
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu..."
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-12 text-center text-lg font-bold tracking-[0.1em] focus:ring-4 focus:ring-primary/10 transition-all ${
                      error ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-100'
                    }`}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>

                {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Mật khẩu không chính xác!</p>}

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  Xác nhận truy cập
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        {!selectedAdmin && (
          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sử dụng dữ liệu từ HR Department</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="material-symbols-outlined text-sm">security</span>
                <span className="text-[10px] font-bold uppercase">Admin Secured</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span className="text-[10px] font-bold uppercase">Cloud Sync</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-bounceSubtle {
          animation: bounceSubtle 4s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default IdentificationView;
