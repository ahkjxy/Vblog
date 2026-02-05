'use client'

import { useState } from 'react'
import { MarkdownContent } from '../MarkdownContent'
import { Eye, Code } from 'lucide-react'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center justify-between">
        <div className="text-sm text-gray-600 font-medium">Markdown 编辑器</div>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
        >
          {isPreview ? (
            <>
              <Code className="w-4 h-4" />
              编辑
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              预览
            </>
          )}
        </button>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <div className="p-6 bg-white min-h-[400px] max-h-[600px] overflow-y-auto">
          <MarkdownContent content={content} />
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[400px] p-4 font-mono text-sm focus:outline-none resize-none"
          placeholder="在这里输入 Markdown 内容...

# 标题 1
## 标题 2
### 标题 3

**粗体** *斜体* `代码`

- 列表项 1
- 列表项 2

1. 有序列表 1
2. 有序列表 2

[链接](https://example.com)

![图片](https://example.com/image.jpg)

```javascript
// 代码块
const hello = 'world';
```

> 引用文本
"
        />
      )}
    </div>
  )
}
