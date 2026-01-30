import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Settings, Save, Search, Share2 } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { Editor } from "./components/editor/Editor";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { StatusIndicator } from "./components/layout/StatusIndicator";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SearchPalette } from "./components/search/SearchPalette";
import { Sidebar } from "./components/sidebar/Sidebar";
import { SidebarTimeline } from "./components/sidebar/SidebarTimeline";
import { GraphView } from "./components/graph/GraphView";

const queryClient = new QueryClient();

function MainCapture() {
  const [content, setContent] = useState<string>(
    "# Welcome to notetAIker\n\nStart typing your thoughts here...",
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const { status, forceSave } = useDebouncedSave();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSelectNote = (noteId: string) => {
    // Open sidebar if closed
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
    // Small delay to allow sidebar to open
    setTimeout(
      () => {
        const element = document.getElementById(`note-${noteId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-nord-frost3", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-nord-frost3",
              "ring-offset-2",
            );
          }, 2000);
        }
      },
      isSidebarOpen ? 0 : 300,
    );
  };

  // Keyboard shortcuts
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setIsSearchOpen((prev) => !prev);
  });

  useHotkeys("mod+b", (e) => {
    e.preventDefault();
    setIsSidebarOpen((prev) => !prev);
  });

  useHotkeys(
    "mod+enter",
    (e) => {
      e.preventDefault();
      forceSave(content);
    },
    { enableOnFormTags: true },
    [content, forceSave],
  );

  return (
    <>
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <SidebarTimeline />
      </Sidebar>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-3xl mx-auto w-full py-12 px-4">
          <header className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-nord-frost3 tracking-tight">
                notetAIker
              </h1>
              <p className="text-nord-polar3 dark:text-nord-snow1 mt-2">
                Focused, distraction-free capturing.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => forceSave(content)}
                className="flex items-center gap-2 px-4 py-2 bg-nord-frost3 text-white rounded-full hover:bg-nord-frost2 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
                title="Save (Ctrl + Enter)"
              >
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-all rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2 active:scale-95"
                aria-label="Search (Cmd+K)"
                title="Search (Cmd+K)"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate("/graph")}
                className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-all rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2 active:scale-95"
                aria-label="Graph View"
                title="Graph View"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-all rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2 active:scale-95"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </header>

          <div className="min-h-[60vh]">
            <Editor
              value={content}
              onChange={handleContentChange}
              onSave={forceSave}
              placeholder="Capture your thoughts..."
            />
          </div>
        </div>
      </div>

      <StatusIndicator status={status} />

      <SearchPalette
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectNote={handleSelectNote}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-nord-snow2 dark:bg-nord-polar0 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<MainCapture />} />
            <Route path="/graph" element={<GraphView />} />
            <Route
              path="/settings"
              element={
                <main className="max-w-3xl mx-auto w-full py-12 px-4">
                  <SettingsPage />
                </main>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
