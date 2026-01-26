
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'PENDING' | 'REPAIR';
export type UserRole = 'ADMIN' | 'OPERATION' | 'STAFF';

export interface Device {
  id: string;
  tagId: string;
  name: string;
  type: string;
  location: string;
  configuration: string;
  accessory?: string;
  note?: string;
  status: AssetStatus;
  assignedTo?: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface HistoryEntry {
  id: string;
  deviceId: string;
  deviceName: string;
  action: string; // Cho phép nhận giá trị thô từ cột Action của Sheet
  timestamp: string;
  performer: string;
  target?: string;
  avatarUrl?: string;
}

export type TabType = 'dashboard' | 'devices' | 'users' | 'settings';
