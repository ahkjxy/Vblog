'use client'

import { useRef, useState } from 'react'
import { MarkdownContent } from '../MarkdownContent'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote, Image, Heading2, Heading3 } from 'lucide-react'
import { MediaLibraryModal } from './MediaLibraryModal'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isSyncingRef = useRef(false)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleImageSelect = (url: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const imageMarkdown = `![图片](${url})`
    const newText = content.substring(0, start) + imageMarkdown + content.substring(start)
    
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length)
    }, 0)
  }

  // 同步滚动：编辑区 -> 预览区（使用 RAF 优化）
  const handleEditorScroll = () => {
    if (isSyncingRef.current) return
    
    const textarea = textareaRef.current
    const preview = previewRef.current
    if (!textarea || !preview) return

    isSyncingRef.current = true
    
    requestAnimationFrame(() => {
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1)
      const targetScroll = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
      
      preview.scrollTo({
        top: targetScroll,
        behavior: 'auto' // 使用 auto 而不是 smooth，避免延迟
      })
      
      setTimeout(() => {
        isSyncingRef.current = false
      }, 10)
    })
  }

  // 同步滚动：预览区 -> 编辑区（使用 RAF 优化）
  const handlePreviewScroll = () => {
    if (isSyncingRef.current) return
    
    const textarea = textareaRef.current
    const preview = previewRef.current
    if (!textarea || !preview) return

    isSyncingRef.current = true
    
    requestAnimationFrame(() => {
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1)
      const targetScroll = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight)
      
      textarea.scrollTop = targetScroll
      
      setTimeout(() => {
        isSyncingRef.current = false
      }, 10)
    })
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="粗体 (Ctrl+B)"
            >
              <Bold className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="斜体 (Ctrl+I)"
            >
              <Italic className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={() => insertMarkdown('\n## ', '')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="二级标题"
            >
              <Heading2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n### ', '')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="三级标题"
            >
              <Heading3 className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={() => insertMarkdown('[', '](url)')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="链接"
            >
              <LinkIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaLibrary(true)}
              className="p-2 rounded transition-colors bg-purple-100 hover:bg-purple-200"
              title="插入图片"
            >
              <Image className="w-4 h-4 text-purple-600" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={() => insertMarkdown('\n- ', '')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="无序列表"
            >
              <List className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n1. ', '')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n> ', '')}
              className="p-2 hover:bg-white rounded transition-colors"
              title="引用"
            >
              <Quote className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('\n```\n', '\n```\n')}
              className="px-3 py-2 hover:bg-white rounded transition-colors text-xs font-mono text-gray-600"
              title="代码块"
            >
              {'</>'}
            </button>
          </div>
        </div>

        {/* Editor and Preview - Side by Side */}
        <div className="grid grid-cols-2 divide-x">
          {/* Left: Editor */}
          <div className="bg-white">
            <div className="px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
              编辑区
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleEditorScroll}
              className="w-full h-[600px] p-4 font-mono text-sm focus:outline-none resize-none"
              style={{ 
                lineHeight: '1.6',
                tabSize: 2,
              }}
              placeholder="# 开始输入 Markdown 内容

## 二级标题

使用左侧工具栏快速插入格式

- 列表项 1
- 列表项 2

**粗体** 和 *斜体*

[链接](https://example.com)"
            />
          </div>

          {/* Right: Preview */}
          <div className="bg-white">
            <div className="px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
              实时预览
            </div>
            <div 
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="p-6 h-[600px] overflow-y-auto"
            >
              {content ? (
                <div className="article-content">
                  <MarkdownContent content={content} />
                </div>
              ) : (
                <div className="text-gray-400 text-center py-12">
                  <p className="text-sm">在左侧输入内容，这里会实时显示预览效果</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
          💡 提示：左侧编辑 Markdown，右侧实时预览效果 · 滚动自动同步
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleImageSelect}
      />
    </>
  )
}
