import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Image, 
  Users, 
  Target, 
  CheckSquare, 
  Sun, 
  Moon, 
  X 
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode
}) {
  const tabs = [
    { id: 'tab1', name: 'Home', icon: LayoutDashboard },
    { id: 'tab2', name: 'Dairy', icon: BookOpen },
    { id: 'tab3', name: 'Gallery', icon: Image },
    { id: 'tab4', name: 'Contacts', icon: Users },
    { id: 'tab5', name: 'Goals', icon: Target },
    { id: 'tab6', name: 'Todo', icon: CheckSquare },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Scrollable Container for Navigation */}
        <div className="overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Navigation</span>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with space-y-12 */}
          <nav className="p-4 space-y-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Switcher Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              {darkMode ? 'Dark Mode' : 'Light Mode'}
            </span>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                darkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}