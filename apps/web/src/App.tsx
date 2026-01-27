import { useEffect, useState } from "react";
import { api } from "./lib/api";
import { Editor } from "./components/editor/Editor";

function App() {
  const [health, setHealth] = useState<string>("loading...");
  const [content, setContent] = useState<string>(
    "# Welcome to NoteTaiker\n\nStart typing your thoughts here...",
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.health.$get({});
        const data = (await res.json()) as { status: string };
        setHealth(data.status);
      } catch (error) {
        setHealth("error");
        console.error("Failed to fetch health:", error);
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-nord-snow2 dark:bg-nord-polar0 flex flex-col items-center p-8 transition-colors duration-300">
      <h1 className="text-4xl font-bold text-nord-frost3 mb-8">NoteTaiker</h1>

      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="bg-white dark:bg-nord-polar1 p-4 rounded-lg shadow-sm border border-nord-snow0 dark:border-nord-polar2">
          <p className="text-nord-polar3 dark:text-nord-snow0">
            Backend status:{" "}
            <span className="font-mono font-bold text-nord-aurora3">
              {health}
            </span>
          </p>
        </div>

        <div className="h-[500px] border border-nord-snow0 dark:border-nord-polar2 rounded-lg overflow-hidden shadow-lg">
          <Editor
            value={content}
            onChange={setContent}
            placeholder="Capture your thoughts..."
          />
        </div>

        <p className="text-nord-polar3 dark:text-nord-snow1 text-sm text-center">
          Nord theme is active. Try switching your system color scheme.
        </p>
      </div>
    </div>
  );
}

export default App;
