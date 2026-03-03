import type { ViewUpdate } from "@codemirror/view";
import {
  MatchDecorator,
  Decoration,
  ViewPlugin,
  type DecorationSet,
  EditorView,
} from "@codemirror/view";
import type { CompletionContext } from "@codemirror/autocomplete";
import {
  autocompletion,
  type CompletionResult,
} from "@codemirror/autocomplete";

const hashtagDecoration = Decoration.mark({
  class: "cm-hashtag",
});

const hashtagMatcher = new MatchDecorator({
  regexp: /#[\w-]+/g,
  decoration: () => hashtagDecoration,
});

export const hashtagHighlighter = ViewPlugin.fromClass(
  class {
    hashtags: DecorationSet;
    constructor(view: EditorView) {
      this.hashtags = hashtagMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.hashtags = hashtagMatcher.updateDeco(update, this.hashtags);
    }
  },
  {
    decorations: (instance) => instance.hashtags,
  },
);

export const hashtagTheme = EditorView.baseTheme({
  ".cm-hashtag": {
    color: "#88c0d0", // nordfrost1
    fontWeight: "bold",
  },
});

export function hashtagAutocomplete(getTags: () => string[]) {
  return autocompletion({
    override: [
      async (context: CompletionContext): Promise<CompletionResult | null> => {
        const word = context.matchBefore(/#[\w-]*/);
        if (!word) return null;
        if (word.from === word.to && !context.explicit) return null;

        const tags = getTags();
        const options = tags.map((tag) => ({
          label: tag.startsWith("#") ? tag : `#${tag}`,
          type: "keyword",
        }));

        return {
          from: word.from,
          options,
          validFor: /^#[\w-]*$/,
        };
      },
    ],
  });
}

export const hashtagExtensions = (getTags: () => string[]) => [
  hashtagHighlighter,
  hashtagTheme,
  hashtagAutocomplete(getTags),
];
