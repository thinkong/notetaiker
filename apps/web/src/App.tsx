import { useState, useRef, useMemo } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { Settings, Save, Search, Share2 } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { Editor, type EditorHandle } from "./components/editor/Editor";
import { useDebouncedSave } from "./hooks/useDebouncedSave";
import { StatusIndicator } from "./components/layout/StatusIndicator";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SearchPalette } from "./components/search/SearchPalette";
import { Sidebar } from "./components/sidebar/Sidebar";
import { SidebarTimeline } from "./components/sidebar/SidebarTimeline";
import { GraphView } from "./components/graph/GraphView";
import { useDraftPersistence } from "./hooks/useDraftPersistence";
import { useNavigationGuard } from "./hooks/useNavigationGuard";
import { Toast } from "./components/common/Toast";
import { ConfirmDialog } from "./components/common/ConfirmDialog";
import { NotePreviewOverlay } from "./components/preview/NotePreviewOverlay";
import { useTimeline } from "./hooks/useTimeline";
import { api } from "./lib/api";

const queryClient = new QueryClient();

function MainCapture() {
  const editorRef = useRef<EditorHandle>(null);
  const queryClient = useQueryClient();

  const { data: timelineData } = useTimeline();

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    timelineData?.pages.forEach((page) => {
      page.forEach((note) => {
        note.metadata.tags?.forEach((tag: string) => tags.add(tag));
        note.metadata.ai_tags?.forEach((tag: string) => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, [timelineData]);

  const { draft, setDraft, clearDraft } = useDraftPersistence();
  const initialContent = useMemo(
    () =>
      draft || "# Welcome to notetAIker\n\nStart typing your thoughts here...",
    [draft],
  );
  const [content, setContent] = useState<string>(initialContent);
  const [originalContent, setOriginalContent] =
    useState<string>(initialContent);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const navigate = useNavigate();

  const { status, noteId, forceSave, cancelSave, setNoteId, clearNoteId } =
    useDebouncedSave(1000, (savedContent) => {
      // Update baseline when background save succeeds
      setOriginalContent(savedContent);
    });

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      await forceSave(content);

      // Store what we just saved as original
      setOriginalContent(content);

      // Clear editor and draft
      setContent("");
      setOriginalContent("");
      clearDraft();
      clearNoteId(); // Reset for new notes

      // Invalidate notes query to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Show success toast
      setToastMessage("Note saved");
      setShowToast(true);

      // Return focus to editor
      setTimeout(() => editorRef.current?.focus(), 50);
    } catch (error) {
      console.error("Save failed:", error);
      setToastMessage("Save failed");
      setShowToast(true);
    }
  };

  const isDirty = useMemo(
    () => content.trim() !== originalContent.trim(),
    [content, originalContent],
  );

  const { isBlocked, proceed, reset, saveAndProceed, requestAction } =
    useNavigationGuard({
      isDirty,
      onSave: handleSave,
    });

  const handleNewNote = () => {
    requestAction(() => {
      cancelSave();
      clearNoteId();
      setContent("");
      setOriginalContent("");
      clearDraft();
      setTimeout(() => editorRef.current?.focus(), 50);
    });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setDraft(newContent); // Auto-save to localStorage
  };

  const [showPreview, setShowPreview] = useState(false);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);

  const handleNoteClick = (noteId: string) => {
    requestAction(() => {
      setPreviewNoteId(noteId);
      setShowPreview(true);
    });
  };

  const handleEditNote = async (noteId: string) => {
    // Close preview
    setShowPreview(false);
    setPreviewNoteId(null);

    setIsLoadingNote(true);

    // Fetch note content
    try {
      const res = await api.notes[":id"].$get({ param: { id: noteId } });
      if (res.ok) {
        const note = await res.json();
        setNoteId(noteId); // Set the note ID for editing
        setContent(note.content);
        setOriginalContent(note.content);
        setDraft(note.content);
        editorRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to load note:", error);
    } finally {
      setIsLoadingNote(false);
    }
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
    "mod+n",
    (e) => {
      e.preventDefault();
      handleNewNote();
    },
    { enableOnFormTags: true },
    [handleNewNote],
  );

  useHotkeys(
    "mod+enter",
    (e) => {
      e.preventDefault();
      handleSave();
    },
    { enableOnFormTags: true },
    [handleSave],
  );

  return (
    <>
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <SidebarTimeline onNoteClick={handleNoteClick} activeNoteId={noteId} />
      </Sidebar>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-3xl mx-auto w-full py-12 px-4">
          <header className="mb-12 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-nord-frost3 tracking-tight">
                notetAIker
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  noteId
                    ? "bg-nord-frost3/10 text-nord-frost3 border border-nord-frost3/20"
                    : "bg-nord-polar3/10 text-nord-polar3 border border-nord-polar3/20"
                }`}
              >
                {noteId ? "Editing" : "Draft"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewNote}
                className="flex items-center gap-2 px-4 py-2 bg-nord-snow1 dark:bg-nord-polar2 text-nord-polar3 dark:text-nord-snow1 rounded-full hover:bg-nord-snow0 dark:hover:bg-nord-polar1 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
                title="New Note"
              >
                <span className="w-5 h-5 flex items-center justify-center text-xl font-bold">
                  +
                </span>
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-nord-frost3 text-white rounded-full hover:bg-nord-frost2 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
                title="Save (Ctrl + Enter)"
              >
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {noteId ? "Save" : "Capture"}
                </span>
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
            {isLoadingNote ? (
              <div className="w-full h-full animate-pulse space-y-4">
                <div className="h-8 bg-nord-snow1 dark:bg-nord-polar2 rounded w-3/4" />
                <div className="h-4 bg-nord-snow1 dark:bg-nord-polar2 rounded w-full" />
                <div className="h-4 bg-nord-snow1 dark:bg-nord-polar2 rounded w-5/6" />
                <div className="h-4 bg-nord-snow1 dark:bg-nord-polar2 rounded w-4/5" />
                <div className="h-32 bg-nord-snow1 dark:bg-nord-polar2 rounded w-full" />
              </div>
            ) : (
              <Editor
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onSave={handleSave}
                placeholder="Capture your thoughts..."
                availableTags={availableTags}
              />
            )}
          </div>
        </div>
      </div>

      <StatusIndicator status={status} />

      <SearchPalette
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectNote={handleSelectNote}
      />

      {isBlocked && (
        <ConfirmDialog
          open={isBlocked}
          onSave={saveAndProceed}
          onDiscard={proceed}
          onCancel={reset}
        />
      )}

      {showToast && (
        <Toast message={toastMessage} onDismiss={() => setShowToast(false)} />
      )}

      <NotePreviewOverlay
        noteId={previewNoteId}
        open={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewNoteId(null);
        }}
        onEdit={handleEditNote}
      />
    </>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-nord-snow2 dark:bg-nord-polar0 transition-colors duration-300">
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainCapture />,
      },
      {
        path: "graph",
        element: <GraphView />,
      },
      {
        path: "settings",
        element: (
          <main className="max-w-3xl mx-auto w-full py-12 px-4">
            <SettingsPage />
          </main>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
