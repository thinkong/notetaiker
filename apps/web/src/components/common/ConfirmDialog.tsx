import { Command } from "cmdk";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  saveLabel?: string;
}

export function ConfirmDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved content. What would you like to do?",
  saveLabel = "Save Changes",
}: ConfirmDialogProps) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
      label={title}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="fixed inset-0 bg-nord-polar0/40 dark:bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md bg-nord-snow2 dark:bg-nord-polar1 rounded-xl shadow-2xl border border-nord-snow0 dark:border-nord-polar2 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-nord-frost2/20 text-nord-frost2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-nord-polar0 dark:text-nord-snow2">
            {title}
          </h2>
        </div>

        <p className="text-nord-polar3 dark:text-nord-snow0 mb-8">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-nord-polar3 dark:text-nord-snow1 hover:text-nord-polar0 dark:hover:text-nord-snow2 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-nord-aurora0 hover:bg-nord-aurora0/10 rounded-lg transition-colors font-medium border border-nord-aurora0/20"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-nord-frost3 text-white rounded-lg hover:bg-nord-frost2 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </Command.Dialog>
  );
}
