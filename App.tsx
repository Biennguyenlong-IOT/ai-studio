
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

const DEVICES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPQVVjmPXRJE3w0PhujorFo-Uj8mVwJ4Aa20i6LmsZpgmk-3pUsqajXf8Bhm68XXnROzierh4SITQ5/pub?gid=0&single=true&output=csv';
const USERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPQVVjmPXRJE3w0PhujorFo-Uj8mVwJ4Aa20i6LmsZpgmk-3pUsqajXf8Bhm68XXnROzierh4SITQ5/pub?gid=1789914936&single=true&output=csv';
const HISTORY_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPQVVjmPXRJE3w0PhujorFo-Uj8mVwJ4Aa20i6LmsZpgmk-3pUsqajXf8Bhm68XXnROzierh4SITQ5/pub?gid=801829903&single=true&output=csv';
const GOOGLE_SCRIPT_APP_URL = 'https://script.google.com/macros/s/AKfycbywRpgG-YElFth55EkcjLYQgH4bepTf_yMYsVI9X2ktgf9hABt6sxxa-D7Tj2ySf7Q1/exec';

const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => 
    h.replace(/"/g, '').trim().toLowerCase().replace(/\s+/g, '')
  );
  
  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else { current += char; }
    }
    values.push(current.trim());
    return headers.reduce((obj: any, header, i) => {
      let val = values[i] || '';
      val = val.replace(/^"|"$/g, '');
      obj[header] = val;
      return obj;
    }, {});
  });
};

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
  const [error, setError] = useState<string | null>(null);

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
      const cb = `cb=${Date.now()}`;
      const [devicesRes, usersRes, historyRes] = await Promise.all([
        fetch(`${DEVICES_CSV_URL}&${cb}`),
        fetch(`${USERS_CSV_URL}&${cb}`),
        fetch(`${HISTORY_CSV_URL}&${cb}`)
      ]);

      if (!devicesRes.ok || !usersRes.ok) throw new Error("Không thể tải dữ liệu.");

      const devicesCsv = await devicesRes.text();
      const usersCsv = await usersRes.text();
      const historyCsv = await (historyRes.ok ? historyRes.text() : Promise.resolve(''));

      const rawDevices = parseCSV(devicesCsv);
      const rawUsers = parseCSV(usersCsv);
      const rawHistory = parseCSV(historyCsv);
      
      const formattedDevices: Device[] = rawDevices.map((d, index) => ({
        id: d.id || `dev-${index}`,
        tagId: d.tagid || d.tag_id || d.mataisan || d['mãtài sản'] || 'N/A',
        name: d.name || d.ten || d['tên'] || 'Không tên',
        type: d.type || d.loai || d['loại'] || 'Khác',
        location: d.location || d.vitri || d['vịtrí'] || 'Chưa rõ',
        configuration: d.configuration || d.cauhinh || d['cấuhình'] || '',
        status: (d.status?.toUpperCase() as AssetStatus) || 'AVAILABLE',
        assignedTo: d.assignedto || d.nguoisudung || d['ngườisửdụng'] || undefined,
        lastUpdated: d.lastupdated || new Date().toISOString()
      }));
      setDevices(formattedDevices);

      const formattedUsers: User[] = rawUsers.map((u, index) => ({
        id: u.id || `user-${index}`,
        name: u.name || u.ten || u['tên'] || 'Unknown User',
        employeeId: u.employeeid || u.manhanvien || u['mãnhânviên'] || 'N/A',
        role: (u.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STAFF') as any,
        avatarUrl: u.avatarurl || undefined
      }));
      setUsers(formattedUsers);

      const formattedHistory: HistoryEntry[] = rawHistory.map((h, index) => {
        const device = formattedDevices.find(d => d.tagId === h.tagid);
        let normalizedAction: HistoryEntry['action'] = 'UPDATE';
        const rawAction = h.action?.toUpperCase() || '';
        if (rawAction.includes('ASSIGN')) normalizedAction = 'ASSIGN';
        else if (rawAction.includes('RETURN')) normalizedAction = 'RETURN';
        else if (rawAction.includes('REPAIR')) normalizedAction = 'REPAIR';

        return {
          id: h.id || `hist-${index}`,
          deviceId: h.tagid || 'N/A',
          deviceName: device ? device.name : (h.devicename || h.name || 'Device #' + (h.tagid || index)),
          action: normalizedAction,
          timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) : 'Unknown Time',
          performer: h.performedby || h.performer || 'Hệ thống',
          target: h.targetuser || h.target || (normalizedAction === 'RETURN' ? 'Kho' : '')
        };
      });
      
      setHistory(formattedHistory.reverse());

    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError("Lỗi kết nối dữ liệu. Vui lòng kiểm tra quyền truy cập Sheet.");
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

  const handleAddDevice = async (newDevice: Omit<Device, 'id' | 'status' | 'lastUpdated'>) => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const payload = { ...newDevice, action: 'ADD_DEVICE', timestamp: new Date().toISOString() };
      await fetch(GOOGLE_SCRIPT_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      setTimeout(() => {
        setIsSaving(false);
        setIsAddDeviceOpen(false);
        fetchData();
        alert("Thiết bị mới đã được lưu!");
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleEditDevice = async (updatedDevice: Device) => {
    if (!isAdmin) return;
    setIsSaving(true);
    const previousDevices = [...devices];
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    
    try {
      const payload = { 
        ...updatedDevice, 
        action: 'EDIT_DEVICE', 
        tagid: updatedDevice.tagId,
        mataisan: updatedDevice.tagId,
        timestamp: new Date().toISOString(),
        performedBy: currentUser?.name
      };

      await fetch(GOOGLE_SCRIPT_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      setTimeout(() => {
        setIsSaving(false);
        setEditingDevice(null);
        fetchData();
      }, 2500);

    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setIsSaving(false);
      setDevices(previousDevices);
    }
  };

  const handleAddUser = async (newUser: Omit<User, 'id' | 'avatarUrl'>) => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const payload = { ...newUser, action: 'ADD_USER', timestamp: new Date().toISOString() };
      await fetch(GOOGLE_SCRIPT_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      
      setTimeout(() => {
        setIsSaving(false);
        setIsAddUserOpen(false);
        fetchData();
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleAssignUser = async (user: User) => {
    if (!assigningDevice || !isAdmin || !currentUser) return;
    setIsSaving(true);
    const timestamp = new Date().toISOString();
    try {
      const payload = {
        action: 'ASSIGN_DEVICE',
        deviceId: assigningDevice.id,
        tagId: assigningDevice.tagId,
        tagid: assigningDevice.tagId,
        mataisan: assigningDevice.tagId,
        userId: user.id,
        userName: user.name,
        deviceName: assigningDevice.name,
        timestamp: timestamp,
        performedBy: currentUser.name
      };
      await fetch(GOOGLE_SCRIPT_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      
      setTimeout(() => {
        setIsSaving(false);
        setAssigningDevice(null);
        fetchData();
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleAction = async (deviceId: string, action: 'ASSIGN' | 'RETURN') => {
    if (!isAdmin || !currentUser) return;
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    if (action === 'ASSIGN') {
      setAssigningDevice(device);
    } else {
      setIsSaving(true);
      const timestamp = new Date().toISOString();
      try {
        const payload = {
          action: 'RETURN_DEVICE',
          deviceId: deviceId,
          tagId: device.tagId,
          tagid: device.tagId,
          mataisan: device.tagId,
          deviceName: device.name,
          timestamp: timestamp,
          performedBy: currentUser.name
        };
        await fetch(GOOGLE_SCRIPT_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });

        setTimeout(() => {
          setIsSaving(false);
          fetchData();
        }, 2000);
      } catch (err) {
        console.error(err);
        setIsSaving(false);
      }
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
          <button onClick={fetchData} className="text-slate-500 p-2 rounded-full hover:bg-slate-100">
            <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView 
                devices={visibleDevices} 
                history={visibleHistory} 
                onViewAll={() => setActiveTab('devices')} 
                onAction={handleAction} 
                onEdit={setEditingDevice} 
                isAdmin={isAdmin}
                onSearch={handleDashboardSearch}
              />
            )}
            {activeTab === 'devices' && (
              <DevicesView 
                devices={visibleDevices} 
                onAction={handleAction} 
                onEdit={setEditingDevice} 
                isAdmin={isAdmin}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}
            {activeTab === 'users' && <UsersView users={users} />}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-full pt-10 space-y-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl w-full max-w-sm text-center transform transition-all hover:scale-[1.02]">
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
                      
                      <button 
                         onClick={handleLogout}
                         className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                      >
                         <span className="material-symbols-outlined text-[20px]">logout</span>
                         Đăng xuất tài khoản
                      </button>
                   </div>
                </div>
                
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AssetFlow v2.4.0</p>
              </div>
            )}
          </>
        )}
      </main>

      {isAdmin && activeTab !== 'settings' && activeTab !== 'dashboard' && (
        <div className="fixed bottom-24 right-6 z-40">
          <button 
            onClick={handleFabClick} 
            className="w-14 h-14 rounded-full shadow-fab bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[32px]">add</span>
          </button>
        </div>
      )}

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {isAddDeviceOpen && <AddDeviceModal existingTagIds={existingTagIds} onClose={() => setIsAddDeviceOpen(false)} onSubmit={handleAddDevice} isSaving={isSaving} />}
      {isAddUserOpen && <AddUserModal onClose={() => setIsAddUserOpen(false)} onSubmit={handleAddUser} isSaving={isSaving} />}
      {assigningDevice && <AssignUserModal users={users} onClose={() => setAssigningDevice(null)} onSubmit={handleAssignUser} isSaving={isSaving} />}
      {editingDevice && <EditDeviceModal device={editingDevice} onClose={() => setEditingDevice(null)} onSubmit={handleEditDevice} isSaving={isSaving} />}
    </div>
  );
};

export default App;
