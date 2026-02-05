---
phase: quick-007
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/App.tsx
  - apps/web/src/components/editor/Editor.tsx
autonomous: true

must_haves:
  truths:
    - "User can toggle between edit and preview modes"
    - "Preview mode renders markdown content using existing Markdown component"
    - "Toggle button is easily accessible near editor controls"
    - "Current mode is visually indicated"
  artifacts:
    - path: "apps/web/src/App.tsx"
      provides: "Preview toggle state and UI control"
      contains: "preview toggle button"
    - path: "apps/web/src/components/editor/Editor.tsx"
      provides: "Conditional rendering of CodeMirror or preview"
      exports: ["Editor"]
  key_links:
    - from: "apps/web/src/App.tsx"
      to: "apps/web/src/components/editor/Editor.tsx"
      via: "showPreview prop"
      pattern: "showPreview=.*"
    - from: "apps/web/src/components/editor/Editor.tsx"
      to: "apps/web/src/components/common/Markdown.tsx"
      via: "import and render in preview mode"
      pattern: "import.*Markdown"
---

<objective>
Add a preview toggle button to switch between editing markdown and viewing rendered output.

Purpose: Enable users to preview how their markdown will render without saving or leaving the editor.
Output: Toggle button in header that switches editor between edit and preview modes.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@/home/ubuntu/projects/notetaiker/apps/web/src/App.tsx
@/home/ubuntu/projects/notetaiker/apps/web/src/components/editor/Editor.tsx
@/home/ubuntu/projects/notetaiker/apps/web/src/components/common/Markdown.tsx
</context>

<tasks>

<task type="auto">
  <name>Add preview toggle state and button to App.tsx</name>
  <files>apps/web/src/App.tsx</files>
  <action>
Add preview mode state in MainCapture component:
- Add state: `const [showPreview, setShowPreview] = useState(false);`
- Import Eye icon from lucide-react: `import { Settings, Save, Search, Share2, Eye, Edit3 } from "lucide-react";`
- Add toggle button in header button group (after Save button, before Search button):
  ```tsx
  <button
    onClick={() => setShowPreview(!showPreview)}
    className="flex items-center gap-2 px-4 py-2 bg-nord-snow1 dark:bg-nord-polar2 text-nord-polar3 dark:text-nord-snow1 rounded-full hover:bg-nord-snow0 dark:hover:bg-nord-polar1 transition-all font-medium shadow-sm hover:shadow-md active:scale-95"
    title={showPreview ? "Edit Mode" : "Preview Mode"}
  >
    {showPreview ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    <span className="hidden sm:inline">{showPreview ? "Edit" : "Preview"}</span>
  </button>
  ```
- Pass showPreview prop to Editor component: `<Editor ... showPreview={showPreview} />`
- Do NOT add keyboard shortcut (keep it simple - button only)
  </action>
  <verify>
Check that button appears in header and clicking it toggles state:
```bash
grep -A 5 "showPreview" /home/ubuntu/projects/notetaiker/apps/web/src/App.tsx
```
  </verify>
  <done>Toggle button exists in header between Save and Search buttons, shows Eye/Edit3 icon based on mode</done>
</task>

<task type="auto">
  <name>Implement preview mode rendering in Editor component</name>
  <files>apps/web/src/components/editor/Editor.tsx</files>
  <action>
Modify Editor component to support preview mode:
- Add showPreview prop to EditorProps interface: `showPreview?: boolean;`
- Import Markdown component: `import { Markdown } from "../common/Markdown";`
- Extract showPreview from props with default false: `{ value, onChange, onSave, theme: controlledTheme, placeholder = "Start typing...", className = "", availableTags = [], showPreview = false }`
- Replace the return statement to conditionally render editor or preview:
  ```tsx
  return (
    <div className={`w-full h-full ${className}`}>
      {showPreview ? (
        <div className="h-full overflow-y-auto px-4 py-2">
          <Markdown content={value} />
        </div>
      ) : (
        <CodeMirror
          ref={cmRef}
          value={value}
          height="100%"
          theme={cmTheme}
          extensions={extensions}
          onChange={handleChange}
          autoFocus
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightSelectionMatches: true,
            tabSize: 2,
          }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
  ```
- Ensure preview container has same parent div styling as editor for consistent layout
  </action>
  <verify>
Check that Editor component conditionally renders preview:
```bash
grep -B 2 -A 8 "showPreview ?" /home/ubuntu/projects/notetaiker/apps/web/src/components/editor/Editor.tsx
```
  </verify>
  <done>Editor component accepts showPreview prop and renders Markdown component when true, CodeMirror when false</done>
</task>

<task type="auto">
  <name>Manual testing of preview toggle</name>
  <files>None</files>
  <action>
Start dev server and verify preview functionality:
1. Run `pnpm dev` from project root
2. Open browser to http://localhost:5173
3. Type some markdown content (headers, lists, code blocks, etc.)
4. Click the Preview button (Eye icon) in header
5. Verify markdown renders correctly using existing Markdown component styles
6. Click Edit button (Edit3 icon) to return to editing
7. Verify content is preserved and editable
8. Test that editing works normally after toggling back
9. Test that tags are still visible in both modes (TagManager is above Editor)
  </action>
  <verify>
All manual tests pass:
- [ ] Toggle button visible in header
- [ ] Clicking toggles between edit/preview modes
- [ ] Preview shows rendered markdown with proper styling
- [ ] Switching back to edit preserves content
- [ ] Tags remain visible in both modes
  </verify>
  <done>Preview toggle works correctly, markdown renders with existing Markdown component, no layout issues</done>
</task>

</tasks>

<verification>
1. Button appears in header with Eye/Edit3 icons
2. Clicking button toggles between edit and preview modes
3. Preview mode uses existing Markdown component for rendering
4. Content is preserved when switching between modes
5. No TypeScript errors in editor or app components
</verification>

<success_criteria>
- User can click toggle button to switch between edit and preview modes
- Preview mode displays rendered markdown using existing Markdown component
- Toggle button shows current mode (Eye for preview, Edit3 for edit)
- Editor maintains content when switching modes
- No regression in existing editor functionality
</success_criteria>

<output>
After completion, create `.planning/quick/007-create-a-preview-toggle-button-to-previe/007-SUMMARY.md`
</output>
