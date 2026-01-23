
import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'devices', icon: 'inventory_2', label: 'Devices' },
    { id: 'users', icon: 'group', label: 'Users' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${
            activeTab === tab.id ? 'text-primary' : 'text-slate-400'
          }`}
        >
          <span className={`material-symbols-outlined ${activeTab === tab.id ? 'font-fill' : ''}`}>
            {tab.icon}
          </span>
          <span className={`text-[10px] ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
