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
    <div className="prose prose-lg max-w-none 
      prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
      prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-16 prose-h1:leading-[1.2]
      prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:leading-[1.3] prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
      prose-h3:text-2xl prose-h3:mb-5 prose-h3:mt-10 prose-h3:leading-[1.4]
      prose-h4:text-xl prose-h4:mb-4 prose-h4:mt-8 prose-h4:leading-[1.5]
      prose-h5:text-lg prose-h5:mb-3 prose-h5:mt-6
      prose-h6:text-base prose-h6:mb-3 prose-h6:mt-6
      prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:mb-7 prose-p:text-[1.125rem]
      prose-a:text-purple-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-purple-700 prose-a:transition-colors
      prose-strong:text-gray-900 prose-strong:font-semibold
      prose-em:text-gray-700 prose-em:italic
      prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-md prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-code:font-normal
      prose-pre:!bg-gray-900 prose-pre:!text-gray-100 prose-pre:!p-6 prose-pre:!rounded-xl prose-pre:!overflow-x-auto prose-pre:!my-10 prose-pre:!shadow-2xl prose-pre:!block prose-pre:!border prose-pre:!border-gray-800
      prose-pre:code:!bg-transparent prose-pre:code:!text-gray-100 prose-pre:code:!p-0 prose-pre:code:!text-sm prose-pre:code:!leading-[1.7] prose-pre:code:!block prose-pre:code:!whitespace-pre
      prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-purple-50/50 prose-blockquote:rounded-r-lg prose-blockquote:my-8 prose-blockquote:leading-[1.7]
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-7 prose-ul:space-y-3
      prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-7 prose-ol:space-y-3
      prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:pl-2 prose-li:text-[1.0625rem]
      prose-li:marker:text-purple-500 prose-li:marker:font-bold
      prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-10 prose-img:border prose-img:border-gray-200 prose-img:w-full
      prose-hr:border-gray-300 prose-hr:my-12 prose-hr:border-t-2
      prose-table:border-collapse prose-table:w-full prose-table:my-10 prose-table:shadow-lg prose-table:rounded-lg prose-table:overflow-hidden
      prose-thead:bg-gradient-to-r prose-thead:from-purple-50 prose-thead:to-pink-50
      prose-th:border prose-th:border-gray-300 prose-th:px-5 prose-th:py-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-th:text-sm
      prose-td:border prose-td:border-gray-300 prose-td:px-5 prose-td:py-4 prose-td:text-gray-700 prose-td:leading-[1.7]
      prose-tbody:bg-white
      prose-tr:transition-colors hover:prose-tr:bg-gray-50
      first:prose-p:mt-0 last:prose-p:mb-0
      [&_pre]:!whitespace-pre [&_pre]:!overflow-x-auto
      [&_pre_code]:!whitespace-pre [&_pre_code]:!block
      [&_ul_ul]:mt-3 [&_ul_ul]:mb-0
      [&_ol_ol]:mt-3 [&_ol_ol]:mb-0
      [&_li>p]:mb-3 [&_li>p]:mt-3
      [&_li>p:first-child]:mt-0 [&_li>p:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
