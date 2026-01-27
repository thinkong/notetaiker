import type { SaveStatus } from "../../hooks/useDebouncedSave";

interface StatusIndicatorProps {
  status: SaveStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Error saving";
      case "idle":
      default:
        return "";
    }
  };

  const text = getStatusText();

  if (!text) return null;

  return (
    <div className="fixed bottom-6 right-6 text-sm text-nord4/50 font-mono select-none">
      {text}
    </div>
  );
}
