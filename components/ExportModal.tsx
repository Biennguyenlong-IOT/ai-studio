import React, { useState, useMemo } from 'react';
import { Device, AssignmentRecord, User } from '../types';
import { 
  prepareDeviceExportData, 
  downloadDevicesCSV, 
  copyDevicesToClipboard 
} from '../utils/exportUtils';

interface ExportModalProps {
  devices: Device[];
  filteredDevices?: Device[];
  assignments: AssignmentRecord[];
  users: User[];
  onClose: () => void;
}

type ExportScope = 'all' | 'filtered' | 'assigned' | 'available' | 'other';

const ExportModal: React.FC<ExportModalProps> = ({
  devices,
  filteredDevices,
  assignments,
  users,
  onClose
}) => {
  const [scope, setScope] = useState<ExportScope>(
    filteredDevices && filteredDevices.length !== devices.length ? 'filtered' : 'all'
  );
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    return {
      all: devices.length,
      filtered: filteredDevices ? filteredDevices.length : devices.length,
      assigned: devices.filter(d => d.status === 'ASSIGNED').length,
      available: devices.filter(d => d.status === 'AVAILABLE').length,
      other: devices.filter(d => d.status === 'PENDING' || d.status === 'REPAIR').length
    };
  }, [devices, filteredDevices]);

  const targetDevices = useMemo(() => {
    switch (scope) {
      case 'filtered':
        return filteredDevices || devices;
      case 'assigned':
        return devices.filter(d => d.status === 'ASSIGNED');
      case 'available':
        return devices.filter(d => d.status === 'AVAILABLE');
      case 'other':
        return devices.filter(d => d.status === 'PENDING' || d.status === 'REPAIR');
      case 'all':
      default:
        return devices;
    }
  }, [scope, devices, filteredDevices]);

  const exportRows = useMemo(() => {
    return prepareDeviceExportData(targetDevices, assignments, users);
  }, [targetDevices, assignments, users]);

  const handleDownload = () => {
    const scopeLabel = scope === 'all' ? 'Tat_ca' : scope === 'assigned' ? 'Da_cap_phat' : scope === 'available' ? 'San_sang' : 'Danh_sach_loc';
    downloadDevicesCSV(exportRows, `Bao_cao_thiet_bi_${scopeLabel}`);
  };

  const handleCopy = () => {
    const success = copyDevicesToClipboard(exportRows);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">table_view</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xuất dữ liệu thiết bị</h3>
              <p className="text-xs text-slate-500">Báo cáo tình trạng, cấp phát & thông số thiết bị</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Scope Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Phạm vi xuất dữ liệu ({targetDevices.length} thiết bị)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  scope === 'all' 
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">apps</span>
                  <span className="text-xs font-bold">Tất cả thiết bị</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {counts.all}
                </span>
              </button>

              {filteredDevices && (
                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    scope === 'filtered' 
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">filter_alt</span>
                    <span className="text-xs font-bold">Đang lọc</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {counts.filtered}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setScope('assigned')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  scope === 'assigned' 
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs font-bold">Đang cấp phát</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                  {counts.assigned}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('available')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  scope === 'available' 
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-500' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-bold">Sẵn sàng (Kho)</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  {counts.available}
                </span>
              </button>
            </div>
          </div>

          {/* Included Fields Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">checklist</span>
              <span>Dữ liệu bao gồm trong file xuất:</span>
            </div>
            <ul className="text-slate-600 space-y-1.5 pl-6 list-disc">
              <li>
                <span className="font-semibold text-slate-800">Trạng thái thiết bị:</span> Sẵn sàng, Đang sử dụng, Chờ duyệt, Sửa chữa
              </li>
              <li>
                <span className="font-semibold text-slate-800">Thông tin cấp phát:</span> Cấp cho ai (Họ tên), Mã nhân viên, Ngày cấp phát, Thời gian cấp hệ thống, Phụ kiện đi kèm, Phụ kiện khác & Ghi chú cấp
              </li>
              <li>
                <span className="font-semibold text-slate-800">Thông tin chi tiết thiết bị:</span> Mã Tag ID, Tên thiết bị, Loại thiết bị, Cấu hình chi tiết, Vị trí hiện tại, Phụ kiện ban đầu & Ghi chú
              </li>
            </ul>
          </div>

          {/* Preview snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Xem trước mẫu ({Math.min(3, targetDevices.length)}/{targetDevices.length} dòng)
              </label>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-x-auto text-[11px] bg-white">
              <table className="w-full text-left divide-y divide-slate-100 whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th className="px-3 py-2">Tag ID</th>
                    <th className="px-3 py-2">Tên thiết bị</th>
                    <th className="px-3 py-2">Trạng thái</th>
                    <th className="px-3 py-2">Người đang dùng</th>
                    <th className="px-3 py-2">Ngày cấp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {exportRows.slice(0, 3).map((r) => (
                    <tr key={r.tagId + r.stt} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-mono font-bold text-primary">{r.tagId}</td>
                      <td className="px-3 py-2 font-medium max-w-[140px] truncate">{r.name}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Đang sử dụng' ? 'bg-red-50 text-red-600' :
                          r.status === 'Sẵn sàng' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.recipientName || '-'}</td>
                      <td className="px-3 py-2 text-slate-500">{r.assignedDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Đã sao chép vào Clipboard!' : 'Sao chép bảng (Excel)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex-[1.5] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Tải file Excel / CSV ({targetDevices.length})</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExportModal;
