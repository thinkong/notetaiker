import { useEffect, useState } from "react";
import { api } from "./lib/api";

function App() {
  const [health, setHealth] = useState<string>("loading...");

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Hello NoteTaiker</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700">
          Backend status: <span className="font-mono font-bold text-green-500">{health}</span>
        </p>
      </div>
      <p className="mt-8 text-gray-500 text-sm">
        Tailwind v4 is working if this page is styled.
      </p>
    </div>
  );
}

export default App;
