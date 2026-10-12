import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/**
 * Single rendering path for reader pages AND the live editor preview.
 * - skipHtml drops raw HTML entirely
 * - rehype-sanitize (GitHub-style schema) strips scripts, event handlers and javascript: URLs
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]} skipHtml>
      {children}
    </ReactMarkdown>
  );
}
