import { EditorView } from "@codemirror/view";

export const linkHandler = EditorView.domEventHandlers({
  mousedown(event, view) {
    if (!(event.metaKey || event.ctrlKey)) return;

    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null) return;

    const { state } = view;
    // Look for a URL tag at the clicked position
    let url: string | null = null;

    // For now, let's use a regex-based approach on the line text for simplicity
    // while keeping within the GSD constraints.

    const line = state.doc.lineAt(pos);
    const lineText = line.text;
    const offset = pos - line.from;

    // Simple URL regex
    const urlRegex = /https?:\/\/[^\s)]+/g;
    let match;
    while ((match = urlRegex.exec(lineText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (offset >= start && offset <= end) {
        url = match[0];
        break;
      }
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }
  },
});
