'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      components={{
        // 自定义组件渲染，确保正确的 HTML 结构
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
        h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
        h5: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
        h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>,
        ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
        ol: ({ children, ...props }) => <ol {...props}>{children}</ol>,
        li: ({ children, ...props }) => <li {...props}>{children}</li>,
        blockquote: ({ children, ...props }) => <blockquote {...props}>{children}</blockquote>,
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <code className={className} {...props}>{children}</code>
          ) : (
            <code {...props}>{children}</code>
          )
        },
        pre: ({ children, ...props }) => <pre {...props}>{children}</pre>,
        img: ({ src, alt, ...props }) => (
          <img src={src} alt={alt || ''} loading="lazy" {...props} />
        ),
        table: ({ children, ...props }) => <table {...props}>{children}</table>,
        thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
        tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
        tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
        th: ({ children, ...props }) => <th {...props}>{children}</th>,
        td: ({ children, ...props }) => <td {...props}>{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
