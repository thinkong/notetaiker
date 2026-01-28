import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Editor } from "./components/editor/Editor";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { StatusIndicator } from "./components/layout/StatusIndicator";
import { Timeline } from "./components/timeline/Timeline";
import { SettingsPage } from "./components/settings/SettingsPage";

const queryClient = new QueryClient();

function MainCapture() {
  const [content, setContent] = useState<string>(
    "# Welcome to NoteTaiker\n\nStart typing your thoughts here...",
  );
  const navigate = useNavigate();

  const { status, save } = useDebouncedSave();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    save(newContent);
  };

  return (
    <>
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-nord-frost3 tracking-tight">
            NoteTaiker
          </h1>
          <p className="text-nord-polar3 dark:text-nord-snow1 mt-2">
            Focused, distraction-free capturing.
          </p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-colors rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className="min-h-[50vh] mb-16">
        <Editor
          value={content}
          onChange={handleContentChange}
          placeholder="Capture your thoughts..."
        />
      </div>

      <div className="border-t border-nord-snow0 dark:border-nord-polar1 pt-12">
        <Timeline />
      </div>

      <StatusIndicator status={status} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-nord-snow2 dark:bg-nord-polar0 transition-colors duration-300">
          <main className="max-w-3xl mx-auto w-full py-12 px-4">
            <Routes>
              <Route path="/" element={<MainCapture />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
