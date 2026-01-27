import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const nordColors = {
  polar0: "#2e3440",
  polar1: "#3b4252",
  polar2: "#434c5e",
  polar3: "#4c566a",
  snow0: "#d8dee9",
  snow1: "#e5e9f0",
  snow2: "#eceff4",
  frost0: "#8fbcbb",
  frost1: "#88c0d0",
  frost2: "#81a1c1",
  frost3: "#5e81ac",
  aurora0: "#bf616a",
  aurora1: "#d08770",
  aurora2: "#ebcb8b",
  aurora3: "#a3be8c",
  aurora4: "#b48ead",
};

export const nordDarkTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: nordColors.polar0,
      color: nordColors.snow0,
    },
    ".cm-content": {
      caretColor: nordColors.frost1,
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: nordColors.frost1 },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: nordColors.polar2,
      },
    ".cm-panels": {
      backgroundColor: nordColors.polar0,
      color: nordColors.snow0,
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: `2px solid ${nordColors.polar1}`,
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: `2px solid ${nordColors.polar1}`,
    },
  },
  { dark: true },
);

export const nordDarkHighlight = HighlightStyle.define([
  { tag: t.keyword, color: nordColors.frost3 },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: nordColors.frost1,
  },
  { tag: [t.variableName], color: nordColors.snow0 },
  { tag: [t.function(t.variableName), t.labelName], color: nordColors.frost2 },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: nordColors.aurora2,
  },
  { tag: [t.definition(t.name), t.separator], color: nordColors.snow0 },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: nordColors.frost0,
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: nordColors.frost2,
  },
  { tag: [t.meta, t.comment], color: nordColors.polar3 },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: nordColors.frost3, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: nordColors.frost3 },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: nordColors.aurora4,
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: nordColors.aurora3,
  },
  { tag: t.invalid, color: nordColors.aurora0 },
]);

export const nordLightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: nordColors.snow2,
      color: nordColors.polar3,
    },
    ".cm-content": {
      caretColor: nordColors.frost1,
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: nordColors.frost1 },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: nordColors.snow0,
      },
    ".cm-panels": {
      backgroundColor: nordColors.snow2,
      color: nordColors.polar3,
    },
  },
  { dark: false },
);

export const nordLightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: nordColors.frost3 },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: nordColors.frost3,
  },
  { tag: [t.variableName], color: nordColors.polar3 },
  { tag: [t.function(t.variableName), t.labelName], color: nordColors.frost2 },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: nordColors.aurora1,
  },
  { tag: [t.definition(t.name), t.separator], color: nordColors.polar3 },
  {
    tag: [
      t.typeName,
      t.className,
      t.number,
      t.changed,
      t.annotation,
      t.modifier,
      t.self,
      t.namespace,
    ],
    color: nordColors.frost3,
  },
  {
    tag: [
      t.operator,
      t.operatorKeyword,
      t.url,
      t.escape,
      t.regexp,
      t.link,
      t.special(t.string),
    ],
    color: nordColors.frost2,
  },
  { tag: [t.meta, t.comment], color: nordColors.polar3 },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: nordColors.frost3, textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: nordColors.frost3 },
  {
    tag: [t.atom, t.bool, t.special(t.variableName)],
    color: nordColors.aurora4,
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: nordColors.aurora3,
  },
  { tag: t.invalid, color: nordColors.aurora0 },
]);

export const nordDark = [nordDarkTheme, syntaxHighlighting(nordDarkHighlight)];
export const nordLight = [
  nordLightTheme,
  syntaxHighlighting(nordLightHighlight),
];
