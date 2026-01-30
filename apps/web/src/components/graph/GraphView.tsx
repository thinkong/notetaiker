import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GraphView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-nord-snow2 dark:bg-nord-polar0 overflow-hidden">
      <header className="p-4 flex items-center gap-4 border-b border-nord-snow0 dark:border-nord-polar1">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-frost3 transition-all rounded-full hover:bg-nord-snow1 dark:hover:bg-nord-polar2 active:scale-95"
          aria-label="Back to Capture"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-nord-polar0 dark:text-nord-snow2">
          Graph View
        </h1>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-nord-polar3 dark:text-nord-snow1 text-lg">
            Graph visualization placeholder.
          </p>
          <p className="text-nord-polar3 dark:text-nord-snow1 opacity-60">
            Coming soon: A visual map of your notes and tags.
          </p>
        </div>
      </main>
    </div>
  );
}
