
import React, { useState } from 'react';
import { AssignmentRecord } from '../types';

interface EditAssignmentModalProps {
  assignment: AssignmentRecord;
  onClose: () => void;
  onSubmit: (id: string, date: string, accessories: string[], otherAccessory: string, notes: string) => void;
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

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ assignment, onClose, onSubmit, isSaving = false }) => {
  const [date, setDate] = useState(assignment.date.split('T')[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(assignment.accessories || []);
  const [otherAccessory, setOtherAccessory] = useState(assignment.otherAccessory || '');
  const [notes, setNotes] = useState(assignment.notes || '');

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = () => {
    onSubmit(assignment.id, date, selectedAccessories, otherAccessory, notes);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-slideUp flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Chỉnh sửa cấp phát</h3>
            <p className="text-sm text-slate-500">Cập nhật thông tin cấp phát cho {assignment.deviceName}</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-slate-400 hover:text-slate-600 p-2 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày cấp phát dự kiến</label>
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
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              Cập nhật
            </button>
          </div>
        </div>

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

export default EditAssignmentModal;
