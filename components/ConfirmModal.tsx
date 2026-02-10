
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'primary' | 'warning';
  isSaving?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = 'Xác nhận', 
  cancelLabel = 'Hủy', 
  onConfirm, 
  onCancel, 
  type = 'primary',
  isSaving = false
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-200';
      case 'warning': return 'bg-orange-500 hover:bg-orange-600 shadow-orange-200';
      default: return 'bg-primary hover:bg-blue-600 shadow-primary/30';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return 'delete_forever';
      case 'warning': return 'warning';
      default: return 'help';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-orange-500 bg-orange-50';
      default: return 'text-primary bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-slideUp">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${getIconColor()} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <span className="material-symbols-outlined text-3xl">{getIcon()}</span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${getColors()}`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : confirmLabel}
            </button>
            <button 
              onClick={onCancel}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
