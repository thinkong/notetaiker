import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { nordColors } from "../theme";

export const markdownHighlightStyle = HighlightStyle.define([
  {
    tag: t.heading1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: nordColors.frost3,
  },
  {
    tag: t.heading2,
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: nordColors.frost3,
  },
  {
    tag: t.heading3,
    fontSize: "1.125rem",
    fontWeight: "bold",
    color: nordColors.frost3,
  },
  {
    tag: [t.heading4, t.heading5, t.heading6],
    fontWeight: "bold",
    color: nordColors.frost3,
  },
  {
    tag: t.strong,
    color: nordColors.aurora0,
    fontWeight: "bold",
  },
  {
    tag: t.emphasis,
    color: nordColors.aurora4,
    fontStyle: "italic",
  },
  {
    tag: t.link,
    color: nordColors.frost1,
    textDecoration: "underline",
  },
  {
    tag: t.url,
    color: nordColors.frost2,
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: nordColors.aurora3,
  },
  {
    tag: t.comment,
    color: nordColors.polar3,
  },
]);

export const markdownStyleExtension = syntaxHighlighting(
  markdownHighlightStyle,
);
