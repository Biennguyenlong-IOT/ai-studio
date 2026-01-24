
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
import IdentificationView from './components/IdentificationView';

// URL Google Apps Script Web App
// IMPORTANT: You must Deploy this script with:
// 1. Execute as: Me
// 2. Who has access: Anyone
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string; isNetworkError?: boolean } | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  const existingTagIds = useMemo(() => devices.map(d => d.tagId), [devices]);

  const visibleDevices = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return devices;
    return devices.filter(d => 
      d.assignedTo === currentUser.name || 
      d.assignedTo === currentUser.employeeId
    );
  }, [devices, currentUser, isAdmin]);

  const visibleHistory = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return history;
    const deviceIds = new Set(visibleDevices.map(d => d.tagId));
    return history.filter(h => 
      deviceIds.has(h.deviceId) || 
      h.target === currentUser.name || 
      h.target === currentUser.employeeId
    );
  }, [history, visibleDevices, currentUser, isAdmin]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${GOOGLE_SCRIPT_APP_URL}?action=GET_DATA&cb=${Date.now()}`;
      
      console.log("Attempting fetch from:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        // Removed explicit mode: 'cors' to allow default redirect handling
        headers: {
          'Accept': 'application/json',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format from server.");
      }

      // Format Devices
      const formattedDevices: Device[] = (data.devices || []).map((d: any, index: number) => ({
        id: d.id || d.tagid || `dev-${index}`,
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
      }));
      setDevices(formattedDevices);

      // Format Users
      const formattedUsers: User[] = (data.users || []).map((u: any, index: number) => ({
        id: u.id || u.employeeid || `user-${index}`,
        name: u.name || 'Unknown User',
        employeeId: u.employeeid || 'N/A',
        role: (u.role?.toString().toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STAFF') as any,
        avatarUrl: u.avatarurl || undefined
      }));
      setUsers(formattedUsers);

      // Format History
      const formattedHistory: HistoryEntry[] = (data.history || []).map((h: any, index: number) => {
        let normalizedAction: HistoryEntry['action'] = 'UPDATE';
        const rawAction = (h.action || '').toString().toUpperCase();
        if (rawAction.includes('ASSIGN')) normalizedAction = 'ASSIGN';
        else if (rawAction.includes('RETURN')) normalizedAction = 'RETURN';
        else if (rawAction.includes('REPAIR')) normalizedAction = 'REPAIR';

        return {
          id: h.id || `hist-${index}`,
          deviceId: h.tagid || 'N/A',
          deviceName: h.devicename || 'N/A',
          action: normalizedAction,
          timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN') : 'Không rõ',
          performer: h.performer || 'Hệ thống',
          target: h.target || (normalizedAction === 'RETURN' ? 'Kho' : '')
        };
      });
      setHistory(formattedHistory.reverse());

    } catch (err: any) {
      console.error("Fetch Execution Error:", err);
      
      const isNetworkError = err.name === 'TypeError' || err.message.includes('Failed to fetch');
      
      setError({ 
        message: isNetworkError ? "Lỗi kết nối API (CORS/Network)" : "Lỗi phản hồi máy chủ",
        details: err.message,
        isNetworkError
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIdentify = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDashboardSearch = (val: string) => {
    setSearchTerm(val);
    setActiveTab('devices');
  };

  const sendPostRequest = async (payload: any) => {
    setIsSaving(true);
    try {
      await fetch(GOOGLE_SCRIPT_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify(payload) 
      });
      
      setTimeout(() => {
        fetchData();
        setIsSaving(false);
        setIsAddDeviceOpen(false);
        setIsAddUserOpen(false);
        setEditingDevice(null);
        setAssigningDevice(null);
      }, 2000);
    } catch (err: any) {
      console.error("POST Execution Error:", err);
      setError({ message: "Không thể cập nhật dữ liệu.", details: err.message });
      setIsSaving(false);
    }
  };

  const handleAddDevice = (newDevice: Omit<Device, 'id' | 'status' | 'lastUpdated'>) => {
    if (!isAdmin) return;
    const payload = { ...newDevice, action: 'ADD_DEVICE', timestamp: new Date().toISOString(), performedBy: currentUser?.name };
    sendPostRequest(payload);
  };

  const handleEditDevice = (updatedDevice: Device) => {
    if (!isAdmin) return;
    const payload = { ...updatedDevice, action: 'EDIT_DEVICE', tagId: updatedDevice.tagId, timestamp: new Date().toISOString(), performedBy: currentUser?.name };
    sendPostRequest(payload);
  };

  const handleDeleteDevice = (id: string) => {
    if (!isAdmin) return;
    const device = devices.find(d => d.id === id);
    if (!device || !window.confirm(`Xóa thiết bị "${device.name}"?`)) return;
    const payload = { action: 'DELETE_DEVICE', tagId: device.tagId, deviceName: device.name, timestamp: new Date().toISOString(), performedBy: currentUser?.name };
    sendPostRequest(payload);
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'avatarUrl'>) => {
    if (!isAdmin) return;
    const payload = { ...newUser, action: 'ADD_USER', timestamp: new Date().toISOString(), performedBy: currentUser?.name };
    sendPostRequest(payload);
  };

  const handleDeleteUser = (id: string) => {
    if (!isAdmin) return;
    const user = users.find(u => u.id === id);
    if (!user || !window.confirm(`Xóa nhân sự "${user.name}"?`)) return;
    const payload = { action: 'DELETE_USER', employeeId: user.employeeId, name: user.name, timestamp: new Date().toISOString(), performedBy: currentUser?.name };
    sendPostRequest(payload);
  };

  const handleAssignUser = (user: User) => {
    if (!assigningDevice || !isAdmin || !currentUser) return;
    const payload = { action: 'ASSIGN_DEVICE', tagId: assigningDevice.tagId, userName: user.name, deviceName: assigningDevice.name, timestamp: new Date().toISOString(), performedBy: currentUser.name };
    sendPostRequest(payload);
  };

  const handleAction = (deviceId: string, action: 'ASSIGN' | 'RETURN') => {
    if (!isAdmin || !currentUser) return;
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    if (action === 'ASSIGN') { 
      setAssigningDevice(device); 
    } else {
      if (!window.confirm(`Thu hồi thiết bị "${device.name}" về kho?`)) return;
      const payload = { action: 'RETURN_DEVICE', tagId: device.tagId, deviceName: device.name, timestamp: new Date().toISOString(), performedBy: currentUser.name };
      sendPostRequest(payload);
    }
  };

  const handleFabClick = () => {
    if (!isAdmin) return;
    if (activeTab === 'users') setIsAddUserOpen(true);
    else setIsAddDeviceOpen(true);
  };

  if (!currentUser) {
    return <IdentificationView users={users} onSelect={handleIdentify} isLoading={isLoading} />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 tracking-tight leading-none">AssetFlow</span>
            <span className={`text-[9px] font-bold uppercase mt-0.5 tracking-wider ${isAdmin ? 'text-primary' : 'text-slate-400'}`}>
              {currentUser.role} {isAdmin ? '' : '- VIEW ONLY'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={fetchData} className="text-slate-500 p-2 rounded-full hover:bg-slate-100" disabled={isLoading || isSaving}>
            <span className={`material-symbols-outlined ${isLoading || isSaving ? 'animate-spin' : ''}`}>sync</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-12">
        {error && (
          <div className="bg-white border-2 border-red-100 p-6 rounded-[32px] mb-8 shadow-xl shadow-red-50 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                 <span className="material-symbols-outlined text-red-500 text-3xl">cloud_off</span>
              </div>
              <div>
                 <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">{error.message}</h4>
                 <p className="text-xs text-red-500 font-bold italic">{error.details}</p>
              </div>
            </div>
            
            {error.isNetworkError && (
               <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Hướng dẫn khắc phục nhanh:</p>
                  <ul className="space-y-2">
                     <li className="flex gap-2 text-xs font-medium text-slate-600">
                        <span className="text-primary font-black">1.</span>
                        <span>Mở Google Apps Script, nhấn <b>Deploy {'>'} New Deployment</b></span>
                     </li>
                     <li className="flex gap-2 text-xs font-medium text-slate-600">
                        <span className="text-primary font-black">2.</span>
                        <span><b>Execute as:</b> Chọn <b>Me</b> (Tài khoản của bạn)</span>
                     </li>
                     <li className="flex gap-2 text-xs font-medium text-slate-600">
                        <span className="text-primary font-black">3.</span>
                        <span><b>Who has access:</b> Chọn <b>Anyone</b> (Bắt buộc)</span>
                     </li>
                  </ul>
               </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={fetchData} 
                className="flex-1 bg-primary text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                Thử lại kết nối
              </button>
              <button 
                onClick={() => window.open('https://script.google.com/', '_blank')}
                className="px-6 py-3 rounded-2xl border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
              </button>
            </div>
          </div>
        )}
        
        {isLoading && !error ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">Đang đồng bộ JSON API...</p>
              <p className="text-[10px] text-slate-300 mt-1 font-medium italic">Vui lòng kiểm tra tab Apps Script nếu chờ lâu</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView devices={visibleDevices} history={visibleHistory} onViewAll={() => setActiveTab('devices')} onAction={handleAction} onEdit={setEditingDevice} onDelete={handleDeleteDevice} isAdmin={isAdmin} onSearch={handleDashboardSearch} />
            )}
            {activeTab === 'devices' && (
              <DevicesView devices={visibleDevices} onAction={handleAction} onEdit={setEditingDevice} onDelete={handleDeleteDevice} isAdmin={isAdmin} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            )}
            {activeTab === 'users' && (
              <UsersView users={users} isAdmin={isAdmin} onDelete={handleDeleteUser} />
            )}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-full pt-10 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl w-full max-sm text-center transform transition-all hover:scale-[1.02]">
                   <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-inner relative">
                      {currentUser.avatarUrl ? (
                         <img src={currentUser.avatarUrl} className="w-full h-full object-cover rounded-full" />
                      ) : (
                         <span className="material-symbols-outlined text-primary text-5xl">person</span>
                      )}
                      <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white shadow-sm ${isAdmin ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-1">{currentUser.name}</h3>
                   <p className="text-sm text-slate-400 font-medium mb-6">Mã nhân viên: {currentUser.employeeId}</p>
                   <div className="flex flex-col gap-3">
                      <div className={`px-4 py-2 text-white text-[11px] font-bold rounded-2xl uppercase tracking-[0.2em] shadow-lg ${isAdmin ? 'bg-primary shadow-primary/20' : 'bg-slate-400'}`}>
                         {currentUser.role} MODE
                      </div>
                      <button onClick={handleLogout} className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95">
                         <span className="material-symbols-outlined text-[20px]">logout</span>
                         Đăng xuất tài khoản
                      </button>
                   </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AssetFlow v3.3 (CORS Optimized)</p>
              </div>
            )}
          </>
        )}
      </main>

      {isAdmin && activeTab !== 'settings' && activeTab !== 'dashboard' && (
        <div className="fixed bottom-24 right-6 z-40">
          <button onClick={handleFabClick} className="w-14 h-14 rounded-full shadow-fab bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>
      )}

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {isAddDeviceOpen && <AddDeviceModal existingTagIds={existingTagIds} onClose={() => setIsAddDeviceOpen(false)} onSubmit={handleAddDevice} isSaving={isSaving} />}
      {isAddUserOpen && <AddUserModal onClose={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} isSaving={isSaving} />}
      {assigningDevice && <AssignUserModal users={users} onClose={() => setAssigningDevice(null)} onSubmit={handleAssignUser} isSaving={isSaving} />}
      {editingDevice && <EditDeviceModal device={editingDevice} onClose={() => setEditingDevice(null)} onSubmit={handleEditDevice} isSaving={isSaving} />}
      {isSaving && (
        <div className="fixed top-20 right-4 z-50 animate-slideIn">
           <div className="bg-white border border-primary/20 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-slate-600">Đang đồng bộ Sheet...</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
