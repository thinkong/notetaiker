import {
  useCallback,
  useMemo,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  markdown,
  markdownLanguage,
  insertNewlineContinueMarkup,
} from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { history } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { nordDark, nordLight } from "./theme";
import { markdownStyleExtension } from "./extensions/markdownStyle";
import { linkHandler } from "./extensions/links";
import { hashtagExtensions } from "./extensions/hashtags";
import { Markdown } from "../common/Markdown";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  theme?: "light" | "dark";
  placeholder?: string;
  className?: string;
  availableTags?: string[];
  showPreview?: boolean;
  title?: string;
  onTitleChange?: (title: string) => void;
  onFocus?: () => void;
}

export interface EditorHandle {
  focus: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  (
    {
      value,
      onChange,
      onSave,
      theme: controlledTheme,
      placeholder = "Start typing...",
      className = "",
      availableTags = [],
      showPreview = false,
      title,
      onTitleChange,
      onFocus,
    },
    ref,
  ) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        cmRef.current?.view?.focus();
      },
    }));

    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
      typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    );

    useEffect(() => {
      if (controlledTheme) return;

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }, [controlledTheme]);

    const activeTheme = controlledTheme || systemTheme;
    const cmTheme = activeTheme === "dark" ? nordDark : nordLight;

    const extensions = useMemo(
      () => [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        markdownStyleExtension,
        linkHandler,
        ...hashtagExtensions(() => availableTags),
        history(),
        bracketMatching(),
        keymap.of([{ key: "Enter", run: insertNewlineContinueMarkup }]),
        Prec.highest(
          keymap.of([
            {
              key: "Mod-Enter",
              run: (view) => {
                if (onSave) {
                  onSave(view.state.doc.toString());
                  return true;
                }
                return false;
              },
            },
          ]),
        ),
      ],
      [onSave, availableTags],
    );

    const handleChange = useCallback(
      (val: string) => {
        onChange(val);
      },
      [onChange],
    );

    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        {!showPreview && onTitleChange && (
          <input
            type="text"
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className="w-full px-4 py-3 text-3xl font-bold bg-transparent border-none outline-none text-nord-polar0 dark:text-nord-snow2 placeholder-nord-polar3/30 dark:placeholder-nord-snow0/30 font-display"
          />
        )}
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
            onFocus={onFocus}
          />
        )}
      </div>
    );
  },
);

export default Editor;
