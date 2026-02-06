# Markdown 编辑器统一

## 修改内容

已将新建和编辑文章页面统一为只使用 Markdown 编辑器，移除了富文本编辑器选项。

## 修改的文件

1. **blog-system/src/app/dashboard/posts/new/page.tsx**
   - 移除 `TipTapEditor` 导入
   - 移除 `editorType` 状态和编辑器类型选择 UI
   - 移除 `content` 状态（富文本 JSON）
   - 移除 `handleImageUpload` 函数
   - 移除 `extractTextFromTipTap` 函数
   - 简化 `generateExcerpt` 函数，只处理 Markdown
   - 只保留 `markdownContent` 状态
   - 文章保存时直接使用 Markdown 字符串

2. **blog-system/src/app/dashboard/posts/[id]/edit/page.tsx**
   - 移除 `TipTapEditor` 导入
   - 移除 `content` 状态（富文本 JSON）
   - 移除 `handleImageUpload` 函数
   - 只保留 `markdownContent` 状态
   - 加载文章时将 content 转换为字符串（向后兼容旧的 JSON 格式）
   - 文章保存时直接使用 Markdown 字符串

3. **blog-system/src/components/editor/MarkdownEditor.tsx** (已在之前更新)
   - 默认显示预览模式
   - 可以切换到编辑模式修改源码
   - 预览模式使用 `article-content` 类，样式与前台一致

## 用户体验

- 新建文章：直接使用 Markdown 编辑器，默认显示预览效果
- 编辑文章：使用 Markdown 编辑器，默认显示预览效果
- 可以点击"编辑源码"按钮切换到编辑模式
- 预览效果与前台文章详情页完全一致

## 向后兼容

编辑页面会检查 content 字段的类型：
- 如果是字符串（Markdown），直接使用
- 如果是对象（旧的富文本 JSON），转换为 JSON 字符串显示（可以手动转换为 Markdown）

## 注意事项

- `TipTapEditor.tsx` 组件保留但不再使用
- 所有新文章都将以 Markdown 格式存储
- 媒体库功能仍然可用，可以在 Markdown 中插入图片链接
