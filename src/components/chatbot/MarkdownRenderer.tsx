'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useTheme } from '@/context/ThemeContext';
import { Copy, Check } from 'lucide-react';

// ─── Copy Button Component for Code Blocks ─────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="chatbot-md-copy-btn"
      aria-label={copied ? 'Copied' : 'Copy code'}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function MarkdownRenderer({ content, isDark: isDarkProp }: MarkdownRendererProps) {
  const { isDark: themeDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeDark;

  const components = useMemo(
    () => ({
      // ── Headings ──
      h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="chatbot-md-h1" {...props}>{children}</h1>
      ),
      h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="chatbot-md-h2" {...props}>{children}</h2>
      ),
      h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="chatbot-md-h3" {...props}>{children}</h3>
      ),
      h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="chatbot-md-h4" {...props}>{children}</h4>
      ),
      h5: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h5 className="chatbot-md-h5" {...props}>{children}</h5>
      ),
      h6: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h6 className="chatbot-md-h6" {...props}>{children}</h6>
      ),

      // ── Paragraph ──
      p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="chatbot-md-p" {...props}>{children}</p>
      ),

      // ── Bold / Italic / Strikethrough ──
      strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <strong className="chatbot-md-strong" {...props}>{children}</strong>
      ),
      em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <em className="chatbot-md-em" {...props}>{children}</em>
      ),
      del: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <del className="chatbot-md-del" {...props}>{children}</del>
      ),

      // ── Links ──
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="chatbot-md-link"
          {...props}
        >
          {children}
        </a>
      ),

      // ── Unordered List ──
      ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="chatbot-md-ul" {...props}>{children}</ul>
      ),
      ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="chatbot-md-ol" {...props}>{children}</ol>
      ),
      li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="chatbot-md-li" {...props}>{children}</li>
      ),

      // ── Blockquote ──
      blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="chatbot-md-blockquote" {...props}>{children}</blockquote>
      ),

      // ── Horizontal Rule ──
      hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
        <hr className="chatbot-md-hr" {...props} />
      ),

      // ── Inline Code ──
      code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
        const isInline = !className;
        if (isInline) {
          return (
            <code className="chatbot-md-code-inline" {...props}>
              {children}
            </code>
          );
        }
        // Block code is handled by pre
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },

      // ── Code Block (pre) ──
      pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
        // Extract the code content for the copy button
        const codeElement = React.Children.toArray(children).find(
          (child) => React.isValidElement(child) && (child.type === 'code')
        ) as React.ReactElement<React.HTMLAttributes<HTMLElement>> | undefined;
        const codeText = codeElement?.props?.children
          ? String(codeElement.props.children)
          : '';
        // Get language from className like "hljs language-javascript"
        const langClass = codeElement?.props?.className || '';
        const langMatch = langClass.match(/language-(\w+)/);
        const language = langMatch ? langMatch[1] : '';

        return (
          <div className="chatbot-md-code-block-wrapper">
            <div className="chatbot-md-code-header">
              <span className="chatbot-md-code-lang">
                {language || 'code'}
              </span>
              <CopyButton text={codeText} />
            </div>
            <pre className={`chatbot-md-code-block ${isDark ? 'chatbot-md-code-dark' : 'chatbot-md-code-light'}`} {...props}>
              {children}
            </pre>
          </div>
        );
      },

      // ── Table ──
      table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="chatbot-md-table-wrapper">
          <table className="chatbot-md-table" {...props}>{children}</table>
        </div>
      ),
      thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="chatbot-md-thead" {...props}>{children}</thead>
      ),
      tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody className="chatbot-md-tbody" {...props}>{children}</tbody>
      ),
      tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr className="chatbot-md-tr" {...props}>{children}</tr>
      ),
      th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="chatbot-md-th" {...props}>{children}</th>
      ),
      td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="chatbot-md-td" {...props}>{children}</td>
      ),

      // ── Image ──
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img
          src={src}
          alt={alt || ''}
          className="chatbot-md-img"
          loading="lazy"
          {...props}
        />
      ),
    }),
    [isDark]
  );

  return (
    <div className={`chatbot-md-root ${isDark ? 'chatbot-md-dark' : 'chatbot-md-light'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
