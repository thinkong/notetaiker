import React, { useState } from "react";
import { PanelLeftClose, PanelLeft, History, Sparkles } from "lucide-react";
import { SidebarTimeline } from "./SidebarTimeline";
import { RelatedNotesPanel } from "./RelatedNotesPanel";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNoteId?: string;
  onNoteClick: (id: string) => void;
}

type Tab = "history" | "related";

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNoteId,
  onNoteClick,
}) => {
  const [activeTabState, setActiveTab] = useState<Tab>("history");
  const activeTab = !activeNoteId ? "history" : activeTabState;

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
              <h2 className="text-lg font-semibold text-nord-polar1 dark:text-nord-snow2">
                notetAIker
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

          {/* Tab Switcher */}
          <div className="flex p-1 bg-nord-snow1 dark:bg-nord-polar2 mx-4 mt-4 rounded-lg">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "history"
                  ? "bg-white dark:bg-nord-polar3 text-nord-frost3 shadow-sm"
                  : "text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={() => activeNoteId && setActiveTab("related")}
              disabled={!activeNoteId}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "related"
                  ? "bg-white dark:bg-nord-polar3 text-nord-frost3 shadow-sm"
                  : !activeNoteId
                    ? "text-nord-polar3 dark:text-nord-snow1 opacity-30 cursor-not-allowed"
                    : "text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Related
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar mt-2">
            {activeTab === "history" ? (
              <SidebarTimeline
                onNoteClick={onNoteClick}
                activeNoteId={activeNoteId}
              />
            ) : (
              activeNoteId && (
                <RelatedNotesPanel
                  noteId={activeNoteId}
                  onNoteClick={onNoteClick}
                />
              )
            )}
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
