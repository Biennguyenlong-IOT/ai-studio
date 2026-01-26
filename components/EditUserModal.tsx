
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (user: User) => void;
  isSaving?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSubmit, isSaving = false }) => {
  const [formData, setFormData] = useState<User>({ ...user });

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.employeeId || isSaving) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sửa thông tin nhân sự</h3>
            <p className="text-sm text-slate-500">Cập nhật quyền hạn và hồ sơ.</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-10 sm:pb-8 space-y-4 pt-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Mã nhân viên (Cố định)</label>
            <input 
              required
              disabled
              className="w-full bg-slate-100 border-slate-100 rounded-xl text-sm text-slate-500 py-3 px-4 cursor-not-allowed font-mono"
              type="text"
              value={formData.employeeId}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Họ và tên</label>
            <input 
              required
              disabled={isSaving}
              className="w-full bg-slate-50 border-slate-100 rounded-xl text-sm text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
              placeholder="Nguyen Van A"
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Vai trò hệ thống</label>
            <select 
              disabled={isSaving}
              className="form-select w-full bg-slate-50 border-slate-100 rounded-xl text-sm font-bold text-slate-800 focus:ring-primary/20 focus:border-primary py-3 px-4"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            >
              <option value="STAFF">Staff (Nhân viên)</option>
              <option value="OPERATION">Operation (Điều hành)</option>
              <option value="ADMIN">Admin (Quản trị viên)</option>
            </select>
            <p className="mt-2 text-[10px] text-slate-400 italic font-medium px-1">
              * Lưu ý: Thay đổi vai trò sẽ ảnh hưởng trực tiếp đến quyền truy cập của người này.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">Hủy</button>
            <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-primary text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Cập nhật nhân sự'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
