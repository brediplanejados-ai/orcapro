import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import FixedCosts from './pages/FixedCosts';
import ProjectBudget from './pages/ProjectBudget';
import { clsx } from 'clsx';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Painel', icon: 'dashboard', path: '/' },
    { label: 'Custos', icon: 'payments', path: '/costs' },
    { label: 'Orçamentos', icon: 'description', path: '/budget' },
    { label: 'Ajustes', icon: 'settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center z-[100]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary dark:text-blue-400" : "text-gray-400"
              )}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 p-6 z-[100]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined font-bold">calculate</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-primary dark:text-white">OrçaPro</h1>
        </div>

        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between px-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tema</p>
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col md:flex-row">
          <Navigation />
          <main className="flex-1 md:ml-64 relative">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<FixedCosts />} />
                <Route path="/costs" element={<FixedCosts />} />
                <Route path="/budget" element={<ProjectBudget />} />
                <Route path="/settings" element={<FixedCosts />} />
              </Routes>
            </div>

            {/* Mobile Header with Theme Toggle */}
            <div className="md:hidden absolute top-4 right-4 z-[110]">
              <ThemeToggle />
            </div>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
