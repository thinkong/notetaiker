import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Editor } from "./components/editor/Editor";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { StatusIndicator } from "./components/layout/StatusIndicator";
import { Timeline } from "./components/timeline/Timeline";

const queryClient = new QueryClient();

function App() {
  const [content, setContent] = useState<string>(
    "# Welcome to NoteTaiker\n\nStart typing your thoughts here...",
  );

  const { status, save } = useDebouncedSave();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    save(newContent);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-nord-snow2 dark:bg-nord-polar0 transition-colors duration-300">
        <main className="max-w-3xl mx-auto w-full py-12 px-4">
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-nord-frost3 tracking-tight">
              NoteTaiker
            </h1>
            <p className="text-nord-polar3 dark:text-nord-snow1 mt-2">
              Focused, distraction-free capturing.
            </p>
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
        </main>

        <StatusIndicator status={status} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
