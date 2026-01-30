import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`prose prose-nord dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-nord-polar1 dark:text-nord-snow2 mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-nord-polar1 dark:text-nord-snow2 mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-nord-polar1 dark:text-nord-snow2 mt-2 mb-1">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-nord-polar1 dark:text-nord-snow2 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-nord-polar1 dark:text-nord-snow2 space-y-1 my-2 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-nord-polar1 dark:text-nord-snow2 space-y-1 my-2 ml-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-nord-polar1 dark:text-nord-snow2">
              {children}
            </li>
          ),
          // Inline code
          code: ({ className, children }) => {
            const isCodeBlock = className?.includes("language-");
            if (isCodeBlock) {
              return (
                <code className="block bg-nord-polar1 dark:bg-nord-polar0 text-nord-snow2 dark:text-nord-snow1 p-3 rounded-md text-sm font-mono overflow-x-auto my-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-nord-snow1 dark:bg-nord-polar2 text-nord-frost3 dark:text-nord-frost1 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          },
          // Code blocks
          pre: ({ children }) => (
            <pre className="bg-nord-polar1 dark:bg-nord-polar0 rounded-lg overflow-hidden my-3">
              {children}
            </pre>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-nord-frost3 pl-4 my-3 text-nord-polar2 dark:text-nord-snow1 italic">
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nord-frost3 hover:text-nord-frost2 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="border-nord-snow1 dark:border-nord-polar3 my-4" />
          ),
          // Tables (GFM)
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-nord-snow1 dark:border-nord-polar3 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-nord-snow1 dark:bg-nord-polar2">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-nord-snow1 dark:border-nord-polar3">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-nord-polar1 dark:text-nord-snow2 border border-nord-snow1 dark:border-nord-polar3">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-nord-polar1 dark:text-nord-snow2 border border-nord-snow1 dark:border-nord-polar3">
              {children}
            </td>
          ),
          // Strikethrough (GFM)
          del: ({ children }) => (
            <del className="text-nord-polar3 dark:text-nord-snow1 line-through">
              {children}
            </del>
          ),
          // Task lists (GFM)
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-nord-frost3"
              {...props}
            />
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-nord-polar0 dark:text-nord-snow2">
              {children}
            </strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-nord-polar2 dark:text-nord-snow1">
              {children}
            </em>
          ),
          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg max-w-full h-auto my-3"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
