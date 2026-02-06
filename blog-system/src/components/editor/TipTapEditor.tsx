'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote,
  ImageIcon
} from 'lucide-react'
import { MediaLibraryModal } from './MediaLibraryModal'

interface TipTapEditorProps {
  content: Record<string, unknown> | null
  onChange: (content: Record<string, unknown>) => void
  onImageUpload?: (file: File) => Promise<string>
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  })

  if (!editor) {
    return null
  }

  const handleImageSelect = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            type="button"
            title="粗体"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            type="button"
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300 mx-1 self-stretch" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            type="button"
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            type="button"
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300 mx-1 self-stretch" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            type="button"
            title="无序列表"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            type="button"
            title="有序列表"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            type="button"
            title="引用"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300 mx-1 self-stretch" />
          <button
            onClick={() => setShowMediaLibrary(true)}
            className="p-2 rounded hover:bg-purple-100 transition-colors bg-purple-50 border border-purple-200"
            type="button"
            title="从媒体库插入图片"
          >
            <ImageIcon className="w-4 h-4 text-purple-600" />
          </button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
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
