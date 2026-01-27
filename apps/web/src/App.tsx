import { useState } from "react";
import { Editor } from "./components/editor/Editor";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { StatusIndicator } from "./components/layout/StatusIndicator";

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

        <div className="min-h-[60vh]">
          <Editor
            value={content}
            onChange={handleContentChange}
            placeholder="Capture your thoughts..."
          />
        </div>
      </main>

      <StatusIndicator status={status} />
    </div>
  );
}

export default App;
