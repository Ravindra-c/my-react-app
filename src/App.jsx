import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import TodoTab from './components/TodoTab';
import GalleryTab from './components/GalleryTab';
import ContactsTab from './components/ContactsTab';
import GoalsTab from './components/GoalsTab';
import DiaryTab from './components/DiaryTab';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('tab6'); // Default tab
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar onLogout={() => setUser(null)} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'tab1' && (
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold">Home Content</h2>
              <p className="text-slate-400 mt-2">Welcome back, {user?.email}!</p>
            </div>
          )}

          {activeTab === 'tab2' && <DiaryTab />}

          {activeTab === 'tab3' && <GalleryTab />}

          {activeTab === 'tab4' && <ContactsTab />}

          {activeTab === 'tab5' && <GoalsTab />}

          {activeTab === 'tab6' && <TodoTab />}
          {/* Todo Tab loaded as full view */}
        </main>
      </div>
    </div>
  );
}