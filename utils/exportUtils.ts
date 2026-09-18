import { Device, AssignmentRecord, User } from '../types';

export interface DeviceExportRow {
  stt: number;
  tagId: string;
  name: string;
  type: string;
  status: string;
  recipientName: string;
  recipientEmpId: string;
  assignedDate: string;
  assignedTimestamp: string;
  performer: string;
  assignedAccessories: string;
  assignedOtherAccessory: string;
  assignedNotes: string;
  configuration: string;
  location: string;
  deviceAccessory: string;
  deviceNote: string;
  lastUpdated: string;
}

export function formatAssignmentDate(dateStr?: string): string {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'AVAILABLE': return 'Sẵn sàng';
    case 'ASSIGNED': return 'Đang sử dụng';
    case 'PENDING': return 'Chờ duyệt';
    case 'REPAIR': return 'Sửa chữa';
    default: return status || 'Không rõ';
  }
}

export function prepareDeviceExportData(
  devices: Device[],
  assignments: AssignmentRecord[],
  users: User[]
): DeviceExportRow[] {
  return devices.map((d, index) => {
    // Tìm bản ghi cấp phát mới nhất cho thiết bị này
    const matchedAssignment = assignments.find(a => 
      a.tagId && d.tagId && a.tagId.trim().toLowerCase() === d.tagId.trim().toLowerCase()
    );

    // Tra cứu mã nhân viên nếu chưa có trong assignment
    let empId = matchedAssignment?.employeeId || '';
    if (!empId && d.assignedTo) {
      const u = users.find(user => 
        user.name.trim().toLowerCase() === d.assignedTo?.trim().toLowerCase() ||
        user.employeeId.trim().toLowerCase() === d.assignedTo?.trim().toLowerCase()
      );
      if (u) empId = u.employeeId;
    }

    const isCurrentlyAssigned = d.status === 'ASSIGNED';

    return {
      stt: index + 1,
      tagId: d.tagId || '',
      name: d.name || '',
      type: d.type || '',
      status: getStatusText(d.status),
      recipientName: isCurrentlyAssigned 
        ? (matchedAssignment?.userName || d.assignedTo || 'Chưa cập nhật') 
        : 'Kho / Chưa cấp',
      recipientEmpId: isCurrentlyAssigned ? empId : '',
      assignedDate: isCurrentlyAssigned ? formatAssignmentDate(matchedAssignment?.date) : '',
      assignedTimestamp: isCurrentlyAssigned ? formatDateTime(matchedAssignment?.timestamp) : '',
      performer: isCurrentlyAssigned ? (matchedAssignment?.performer || '') : '',
      assignedAccessories: isCurrentlyAssigned 
        ? (matchedAssignment?.accessories?.length ? matchedAssignment.accessories.join(', ') : (d.accessory || '')) 
        : '',
      assignedOtherAccessory: isCurrentlyAssigned ? (matchedAssignment?.otherAccessory || '') : '',
      assignedNotes: isCurrentlyAssigned ? (matchedAssignment?.notes || '') : '',
      configuration: d.configuration || '',
      location: d.location || '',
      deviceAccessory: d.accessory || '',
      deviceNote: d.note || '',
      lastUpdated: formatDateTime(d.lastUpdated)
    };
  });
}

const EXPORT_HEADERS = [
  'STT',
  'Mã thiết bị (Tag ID)',
  'Tên thiết bị',
  'Loại thiết bị',
  'Trạng thái hiện tại',
  'Người đang sử dụng',
  'Mã nhân viên người nhận',
  'Ngày cấp phát dự kiến',
  'Thời gian cấp phát (Hệ thống)',
  'Người thực hiện cấp phát',
  'Phụ kiện đi kèm khi cấp',
  'Phụ kiện khác khi cấp',
  'Ghi chú cấp phát',
  'Cấu hình thiết bị',
  'Vị trí',
  'Phụ kiện tiêu chuẩn',
  'Ghi chú thiết bị',
  'Cập nhật lần cuối'
];

function escapeCSV(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  return `"${str.replace(/"/g, '""')}"`;
}

export function downloadDevicesCSV(
  data: DeviceExportRow[],
  filenamePrefix: string = 'Bao_cao_thiet_bi_AssetFlow'
) {
  const rows = data.map(item => [
    item.stt,
    item.tagId,
    item.name,
    item.type,
    item.status,
    item.recipientName,
    item.recipientEmpId,
    item.assignedDate,
    item.assignedTimestamp,
    item.performer,
    item.assignedAccessories,
    item.assignedOtherAccessory,
    item.assignedNotes,
    item.configuration,
    item.location,
    item.deviceAccessory,
    item.deviceNote,
    item.lastUpdated
  ]);

  const csvLines = [
    EXPORT_HEADERS.map(escapeCSV).join(','),
    ...rows.map(r => r.map(escapeCSV).join(','))
  ];

  // \uFEFF Byte Order Mark để Microsoft Excel mở UTF-8 có dấu tiếng Việt không bị lỗi font
  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateSuffix = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateSuffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyDevicesToClipboard(data: DeviceExportRow[]): boolean {
  try {
    const rows = data.map(item => [
      item.stt,
      item.tagId,
      item.name,
      item.type,
      item.status,
      item.recipientName,
      item.recipientEmpId,
      item.assignedDate,
      item.assignedTimestamp,
      item.performer,
      item.assignedAccessories,
      item.assignedOtherAccessory,
      item.assignedNotes,
      item.configuration,
      item.location,
      item.deviceAccessory,
      item.deviceNote,
      item.lastUpdated
    ]);

    const tsvContent = [
      EXPORT_HEADERS.join('\t'),
      ...rows.map(r => r.map(c => String(c).replace(/[\t\r\n]/g, ' ')).join('\t'))
    ].join('\r\n');

    navigator.clipboard.writeText(tsvContent);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
