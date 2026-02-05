'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      className="prose prose-lg max-w-none 
        prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
        prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:leading-tight
        prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:leading-snug prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug
        prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
        prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[1.0625rem]
        prose-a:text-orange-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-orange-700 prose-a:transition-colors
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-em:text-gray-700 prose-em:italic
        prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
        prose-pre:!bg-gray-900 prose-pre:!text-gray-100 prose-pre:!p-6 prose-pre:!rounded-xl prose-pre:!overflow-x-auto prose-pre:!my-8 prose-pre:!shadow-lg prose-pre:!block
        prose-pre:code:!bg-transparent prose-pre:code:!text-gray-100 prose-pre:code:!p-0 prose-pre:code:!text-sm prose-pre:code:!leading-relaxed prose-pre:code:!block prose-pre:code:!whitespace-pre
        prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-orange-50/30 prose-blockquote:rounded-r-lg prose-blockquote:my-6
        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:space-y-2
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:space-y-2
        prose-li:text-gray-700 prose-li:leading-relaxed prose-li:pl-2
        prose-li:marker:text-orange-500
        prose-img:rounded-xl prose-img:shadow-xl prose-img:my-8 prose-img:border prose-img:border-gray-200
        prose-hr:border-gray-300 prose-hr:my-12 prose-hr:border-t-2
        prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:shadow-md prose-table:rounded-lg prose-table:overflow-hidden
        prose-thead:bg-gray-100
        prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
        prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-3 prose-td:text-gray-700
        prose-tbody:bg-white
        first:prose-p:mt-0 last:prose-p:mb-0
        [&_pre]:!whitespace-pre [&_pre]:!overflow-x-auto
        [&_pre_code]:!whitespace-pre [&_pre_code]:!block"
    >
      {content}
    </ReactMarkdown>
  )
}
