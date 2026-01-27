import React, { useCallback, useMemo, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import {
  markdown,
  markdownLanguage,
  insertNewlineContinueMarkup,
} from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { history } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { nordDark, nordLight } from "./theme";
import { markdownStyleExtension } from "./extensions/markdownStyle";
import { linkHandler } from "./extensions/links";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: "light" | "dark";
  placeholder?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  theme: controlledTheme,
  placeholder = "Start typing...",
  className = "",
}) => {
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
      history(),
      bracketMatching(),
      keymap.of([{ key: "Enter", run: insertNewlineContinueMarkup }]),
    ],
    [],
  );

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange],
  );

  return (
    <div className={`w-full h-full ${className}`}>
      <CodeMirror
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
    </div>
  );
};

export default Editor;
