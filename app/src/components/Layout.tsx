import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ImportModal } from './ImportModal';
import { SettingsModal } from './SettingsModal';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/';
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b bg-card text-card-foreground">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-accent rounded-full transition-colors flex items-center justify-center"
                title="Go Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <Link to="/" className="text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity">
              MemoriAI
            </Link>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 hover:bg-accent rounded-full transition-colors flex items-center justify-center"
              title="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground rounded-md shadow-lg border z-50 flex flex-col py-1 overflow-hidden">
                  <Link 
                    to="/parse-sentence" 
                    className="px-4 py-2 hover:bg-accent text-sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Nhập câu (Parser)
                  </Link>
                  <Link 
                    to="/read-paragraph" 
                    className="px-4 py-2 hover:bg-accent text-sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Đọc đoạn văn
                  </Link>
                  <button 
                    onClick={() => { setShowImportModal(true); setIsDropdownOpen(false); }}
                    className="px-4 py-2 hover:bg-accent text-left text-sm"
                  >
                    Nhập thẻ (Import)
                  </button>
                  <div className="h-px bg-border my-1"></div>
                  <button 
                    onClick={() => { setShowSettingsModal(true); setIsDropdownOpen(false); }}
                    className="px-4 py-2 hover:bg-accent text-left text-sm"
                  >
                    Cài đặt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="pt-4">
        <Outlet />
      </main>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};
