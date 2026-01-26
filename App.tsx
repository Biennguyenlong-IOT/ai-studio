
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TabType, Device, HistoryEntry, AssetStatus, User } from './types';
import DashboardView from './components/DashboardView';
import DevicesView from './components/DevicesView';
import UsersView from './components/UsersView';
import Navigation from './components/Navigation';
import AddDeviceModal from './components/AddDeviceModal';
import AddUserModal from './components/AddUserModal';
import AssignUserModal from './components/AssignUserModal';
import EditDeviceModal from './components/EditDeviceModal';
import EditUserModal from './components/EditUserModal';
import IdentificationView from './components/IdentificationView';

const GOOGLE_SCRIPT_APP_URL = 'https://script.google.com/macros/s/AKfycbywRpgG-YElFth55EkcjLYQgH4bepTf_yMYsVI9X2ktgf9hABt6sxxa-D7Tj2ySf7Q1/exec'.trim();

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [assigningDevice, setAssigningDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string; isNetworkError?: boolean } | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isOperation = currentUser?.role === 'OPERATION';
  const isManagement = isAdmin || isOperation;

  const existingTagIds = useMemo(() => devices.map(d => d.tagId), [devices]);

  const visibleDevices = useMemo(() => {
    if (!currentUser) return [];
    if (isManagement) return devices;
    return devices.filter(d => 
      d.assignedTo === currentUser.name || 
      d.assignedTo === currentUser.employeeId
    );
  }, [devices, currentUser, isManagement]);

  const visibleHistory = useMemo(() => {
    if (!currentUser) return [];
    if (isManagement) return history;
    const deviceIds = new Set(visibleDevices.map(d => d.tagId));
    return history.filter(h => 
      deviceIds.has(h.deviceId) || 
      h.target === currentUser.name || 
      h.target === currentUser.employeeId
    );
  }, [history, visibleDevices, currentUser, isManagement]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${GOOGLE_SCRIPT_APP_URL}?action=GET_DATA&cb=${Date.now()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setDevices((data.devices || []).map((d: any, index: number) => {
        const id = d.id || `dev-${d.tagid || index}`;
        return {
          id: id.startsWith('dev-') ? id : `dev-${id}`,
          tagId: d.tagid || 'N/A',
          name: d.name || 'Không tên',
          type: d.type || 'Khác',
          location: d.location || 'Chưa rõ',
          configuration: d.configuration || '',
          accessory: d.accessory || '',
          note: d.note || '',
          status: (d.status?.toString().toUpperCase() as AssetStatus) || 'AVAILABLE',
          assignedTo: d.assignedto || undefined,
          lastUpdated: d.lastupdated || new Date().toISOString()
        };
      }));

      setUsers((data.users || []).map((u: any, index: number) => {
        const id = u.id || `user-${u.employeeid || index}`;
        return {
          id: id.startsWith('user-') ? id : `user-${id}`,
          name: u.name || 'Unknown User',
          employeeId: u.employeeid || 'N/A',
          role: (u.role?.toString().toUpperCase() as any) || 'STAFF',
          avatarUrl: u.avatarurl || undefined
        };
      }));

      setHistory((data.history || []).map((h: any, index: number) => {
        const id = h.id || `hist-${index}`;
        return {
          id: id.startsWith('hist-') ? id : `hist-${id}`,
          deviceId: h.tagid || 'N/A',
          deviceName: h.devicename || 'Không rõ',
          action: h.action || 'UPDATE', // Lấy giá trị thô từ Sheet
          timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : 'Không rõ',
          performer: h.performer || 'Hệ thống',
          target: h.target || ''
        };
      }).reverse());
    } catch (err: any) {
      setError({ message: "Lỗi kết nối", details: err.message, isNetworkError: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleIdentify = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => setCurrentUser(null);

  const sendPostRequest = async (payload: any) => {
    setIsSaving(true);
    try {
      await fetch(GOOGLE_SCRIPT_APP_URL, { 
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify(payload) 
      });
      setTimeout(() => {
        fetchData();
        setIsSaving(false);
        setIsAddDeviceOpen(false);
        setIsAddUserOpen(false);
        setEditingDevice(null);
        setEditingUser(null);
        setAssigningDevice(null);
      }, 2000);
    } catch (err: any) {
      setError({ message: "Lỗi cập nhật", details: err.message });
      setIsSaving(false);
    }
  };

  const handleAddDevice = (newDevice: any) => {
    if (!isAdmin) return;
    sendPostRequest({ ...newDevice, action: 'ADD_DEVICE', timestamp: new Date().toISOString(), performedBy: currentUser?.name });
  };

  const handleEditDevice = (updatedDevice: Device) => {
    if (!isAdmin) return;
    sendPostRequest({ ...updatedDevice, action: 'EDIT_DEVICE', tagId: updatedDevice.tagId, timestamp: new Date().toISOString(), performedBy: currentUser?.name });
  };

  const handleDeleteDevice = (id: string) => {
    if (!isAdmin) return;
    const device = devices.find(d => d.id === id);
    if (device && window.confirm(`Xóa thiết bị ${device.name}?`)) {
      sendPostRequest({ action: 'DELETE_DEVICE', tagId: device.tagId, timestamp: new Date().toISOString(), performedBy: currentUser?.name });
    }
  };

  const handleAddUser = (newUser: any) => {
    if (!isManagement) return;
    sendPostRequest({ ...newUser, action: 'ADD_USER', timestamp: new Date().toISOString(), performedBy: currentUser?.name });
  };

  const handleEditUser = (updatedUser: User) => {
    if (!isAdmin) return;
    sendPostRequest({ ...updatedUser, action: 'EDIT_USER', timestamp: new Date().toISOString(), performedBy: currentUser?.name });
  };

  const handleDeleteUser = (id: string) => {
    if (!isAdmin) return;
    const user = users.find(u => u.id === id);
    if (user && window.confirm(`Xóa nhân sự ${user.name}?`)) {
      sendPostRequest({ 
        action: 'DELETE_USER', 
        employeeId: user.employeeId, 
        name: user.name, 
        timestamp: new Date().toISOString(), 
        performedBy: currentUser?.name 
      });
    }
  };

  const handleAction = (deviceId: string, action: 'ASSIGN' | 'RETURN') => {
    if (!isManagement) return;
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    if (action === 'ASSIGN') {
      if (device.status !== 'AVAILABLE') {
        alert("Thiết bị này không sẵn sàng để cấp phát.");
        return;
      }
      setAssigningDevice(device);
    } else if (action === 'RETURN') {
      if (device.status !== 'ASSIGNED') return;
      if (window.confirm(`Thu hồi ${device.name}?`)) {
        sendPostRequest({ action: 'RETURN_DEVICE', tagId: device.tagId, timestamp: new Date().toISOString(), performedBy: currentUser?.name });
      }
    }
  };

  const handleFabClick = () => {
    if (activeTab === 'users' && isManagement) setIsAddUserOpen(true);
    else if (activeTab === 'devices' && isAdmin) setIsAddDeviceOpen(true);
  };

  const showFab = (activeTab === 'users' && isManagement) || (activeTab === 'devices' && isAdmin);

  if (!currentUser) return <IdentificationView users={users} onSelect={handleIdentify} isLoading={isLoading} />;

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 tracking-tight leading-none">AssetFlow</span>
            <span className={`text-[9px] font-bold uppercase mt-0.5 tracking-wider ${isAdmin ? 'text-primary' : isOperation ? 'text-orange-500' : 'text-slate-400'}`}>
              {currentUser.role} {isManagement ? 'MODE' : '- VIEW ONLY'}
            </span>
          </div>
        </div>
        <button onClick={fetchData} className="text-slate-500 p-2 rounded-full hover:bg-slate-100" disabled={isLoading}>
          <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-12">
        {activeTab === 'dashboard' && <DashboardView devices={visibleDevices} history={visibleHistory} onViewAll={() => setActiveTab('devices')} onAction={handleAction} onEdit={setEditingDevice} onDelete={handleDeleteDevice} isAdmin={isAdmin} isManagement={isManagement} onSearch={(v) => { setSearchTerm(v); setActiveTab('devices'); }} />}
        {activeTab === 'devices' && <DevicesView devices={visibleDevices} onAction={handleAction} onEdit={setEditingDevice} onDelete={handleDeleteDevice} isAdmin={isAdmin} isManagement={isManagement} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeTab === 'users' && <UsersView users={users} isAdmin={isAdmin} isManagement={isManagement} onDelete={handleDeleteUser} onEditUser={setEditingUser} />}
        {activeTab === 'settings' && (
          <div className="flex flex-col items-center justify-center pt-10 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl w-full text-center">
               <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-inner">
                  {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover rounded-full" /> : <span className="material-symbols-outlined text-primary text-5xl">person</span>}
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-1">{currentUser.name}</h3>
               <p className="text-sm text-slate-400 font-medium mb-6">ID: {currentUser.employeeId} | Vai trò: {currentUser.role}</p>
               <button onClick={handleLogout} className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Đăng xuất</button>
            </div>
          </div>
        )}
      </main>

      {showFab && (
        <div className="fixed bottom-24 right-6 z-40">
          <button onClick={handleFabClick} className="w-14 h-14 rounded-full shadow-fab bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>
      )}

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {isAddDeviceOpen && <AddDeviceModal existingTagIds={existingTagIds} onClose={() => setIsAddDeviceOpen(false)} onSubmit={handleAddDevice} isSaving={isSaving} />}
      {isAddUserOpen && <AddUserModal onClose={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} isSaving={isSaving} />}
      {assigningDevice && <AssignUserModal users={users} onClose={() => setAssigningDevice(null)} onSubmit={(u) => sendPostRequest({ action: 'ASSIGN_DEVICE', tagId: assigningDevice.tagId, userName: u.name, timestamp: new Date().toISOString(), performedBy: currentUser?.name })} isSaving={isSaving} />}
      {editingDevice && <EditDeviceModal device={editingDevice} onClose={() => setEditingDevice(null)} onSubmit={handleEditDevice} isSaving={isSaving} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSubmit={handleEditUser} isSaving={isSaving} />}
    </div>
  );
};

export default App;
