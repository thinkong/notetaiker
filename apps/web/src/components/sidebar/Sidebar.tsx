import React from "react";
import { PanelLeftClose, PanelLeft, History } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 p-2 bg-nord-snow0 dark:bg-nord-polar1 rounded-lg shadow-lg border border-nord-snow1 dark:border-nord-polar3 hover:bg-nord-snow1 dark:hover:bg-nord-polar2 transition-all duration-200 group"
          aria-label="Open sidebar"
          title="Open history (Ctrl+B)"
        >
          <PanelLeft className="w-5 h-5 text-nord-polar3 dark:text-nord-snow1 group-hover:text-nord-frost3 transition-colors" />
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 h-full bg-nord-snow0 dark:bg-nord-polar1 border-r border-nord-snow1 dark:border-nord-polar3 shadow-xl transition-all duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? "w-80" : "w-0"
        }`}
      >
        <div
          className={`flex flex-col h-full overflow-hidden ${
            isOpen ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-nord-snow1 dark:border-nord-polar3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-nord-frost3" />
              <h2 className="text-lg font-semibold text-nord-polar1 dark:text-nord-snow2">
                Recent History
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-nord-snow1 dark:hover:bg-nord-polar2 transition-colors group"
              aria-label="Close sidebar"
              title="Close sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="w-5 h-5 text-nord-polar3 dark:text-nord-snow1 group-hover:text-nord-frost3 transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {children}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-nord-polar0/20 dark:bg-nord-polar0/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
