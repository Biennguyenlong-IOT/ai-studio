
import React, { useState } from 'react';
import { User, Device } from '../types';

interface AssignUserModalProps {
  device: Device;
  users: User[];
  onClose: () => void;
  onSubmit: (data: { 
    user: User; 
    date: string; 
    accessories: string[]; 
    otherAccessory: string; 
    notes: string 
  }) => void;
  isSaving?: boolean;
}

const ACCESSORY_OPTIONS = [
  'Balo',
  'Sạc',
  'Tai nghe',
  'Chuột',
  'Matedock',
  'Type-C to Lan'
];

const AssignUserModal: React.FC<AssignUserModalProps> = ({ device, users, onClose, onSubmit, isSaving = false }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [otherAccessory, setOtherAccessory] = useState('');
  const [notes, setNotes] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setStep(2);
  };

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    onSubmit({
      user: selectedUser,
      date,
      accessories: selectedAccessories,
      otherAccessory,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {step === 1 ? 'Chọn người nhận' : 'Thông tin cấp phát'}
            </h3>
            <p className="text-sm text-slate-500">
              {step === 1 ? 'Chọn nhân viên để bàn giao thiết bị.' : `Cấp phát ${device.name} cho ${selectedUser?.name}`}
            </p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="px-6 py-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input 
                  type="text" 
                  placeholder="Tìm nhân viên..."
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
                  onClick={() => handleUserSelect(user)}
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
                  <p className="text-xs">Không tìm thấy nhân viên.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày cấp phát</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:ring-primary/20 focus:border-primary transition-all"
                value={date}
                onChange={e => setDate(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phụ kiện đi kèm</label>
              <div className="grid grid-cols-2 gap-2">
                {ACCESSORY_OPTIONS.map(acc => (
                  <label key={acc} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedAccessories.includes(acc) ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={selectedAccessories.includes(acc)}
                      onChange={() => toggleAccessory(acc)}
                      disabled={isSaving}
                    />
                    <span className="material-symbols-outlined text-[20px]">
                      {selectedAccessories.includes(acc) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span className="text-xs font-medium">{acc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phụ kiện khác</label>
              <input 
                type="text"
                placeholder="Nhập phụ kiện khác nếu có..."
                className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:ring-primary/20 focus:border-primary transition-all"
                value={otherAccessory}
                onChange={e => setOtherAccessory(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ghi chú</label>
              <textarea 
                placeholder="Nhập ghi chú cấp phát..."
                rows={3}
                className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 px-4 text-sm focus:ring-primary/20 focus:border-primary transition-all resize-none"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Quay lại
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                Xác nhận cấp phát
              </button>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Đang lưu...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignUserModal;
